import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  LATEST_NODE_VIDEOS,
  LATEST_PUBLIC_VIDEO,
  LATEST_RESULT_VIDEOS,
  LATEST_TIME_TRANSITIONS,
  arrivalOutcomeForDecisions,
  branchForDecisions,
  confirmationStatus,
  latestFrames,
  latestNode,
  nextLatestNode,
  optionTarget,
  resultSceneTitleForDecisions,
  resultVideoForDecisions,
  visibleOptions,
  type LatestDecision,
} from '../demo/latestStory'
import type { FinalNode, FinalOption } from '../demo/finalStoryMap'
import { activeLatestSubtitle, latestSubtitleTrack } from '../demo/latestSubtitles'
import { LatestDecisionReport } from './LatestDecisionReport'
import { reportPathTitle } from '../demo/latestReport'
import './latestStoryPlay.css'
import { bridgesForVideo, pendingBridge, resultBridge, cardDuration, type NarrativeCard, type VideoBridge } from '../demo/narrativeBridges'

import { presentNode, decisionBackdrop } from '../demo/storyPresentation'
import { SESSION_KEY, freshSession, restoreSession, advanceSession, rewindSession, type AttemptRecord } from '../demo/storySession'
import { measureVideoPackBytes, shouldAutoStartFullPack, shouldPromptBeforeStarting, type VideoPackStatus } from '../demo/videoPack'

const ROUTE_NAMES: Record<string, string> = {
  PUBLIC: '公共开场', A: '立即翻山', B: '走山谷', C: '等待天气信息', D: '安全等待', SHARED: '结算',
}

const ROUTE_LEGEND = [
  ['A', '立即翻山'], ['B', '走山谷'], ['C', '等待信息'], ['D', '安全等待'],
] as const

// Bump this name when replacing public-intro.mp4 under the same URL.
const CORE_VIDEO_CACHE_NAME = 'last-fourteen-days-core-v1'
const FULL_VIDEO_CACHE_NAME = 'last-fourteen-days-full-v1'
const downloadedVideos = new Map<string, { objectUrl: string; bytes: number }>()
const ALL_LATEST_VIDEOS = [...new Set([
  LATEST_PUBLIC_VIDEO,
  ...Object.values(LATEST_NODE_VIDEOS).flat(),
  ...Object.values(LATEST_RESULT_VIDEOS),
])]

type FullDownloadProgress = {
  status: VideoPackStatus
  completed: number
  downloadedBytes: number
  totalBytes: number
  persistedCount: number
}

const initialFullDownloadProgress: FullDownloadProgress = {
  status: 'idle', completed: 0, downloadedBytes: 0, totalBytes: 0, persistedCount: 0,
}

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 ** 2).toFixed(1)} MiB`
}

async function writeCoreVideoCache(src: string, response: Response) {
  if (!('caches' in window)) return
  try {
    const cache = await window.caches.open(CORE_VIDEO_CACHE_NAME)
    await cache.put(src, response)
  } catch {
    // Continue with the in-memory copy when persistent browser storage is unavailable.
  }
}

async function readStoredVideo(src: string) {
  if (!('caches' in window)) return undefined
  for (const cacheName of [FULL_VIDEO_CACHE_NAME, CORE_VIDEO_CACHE_NAME]) {
    try {
      const cache = await window.caches.open(cacheName)
      const response = await cache.match(src)
      if (response) return await response.blob()
    } catch {
      // The remote video remains available when browser storage is unavailable.
    }
  }
  return undefined
}

async function downloadCompleteVideoPack(
  signal: AbortSignal,
  onProgress: (progress: Omit<FullDownloadProgress, 'status'>) => void,
) {
  let fullCache: Cache | undefined
  if ('caches' in window) {
    try { fullCache = await window.caches.open(FULL_VIDEO_CACHE_NAME) }
    catch { fullCache = undefined }
  }

  let cursor = 0
  let completed = 0
  let downloadedBytes = 0
  let totalBytes = await measureVideoPackBytes(ALL_LATEST_VIDEOS, signal)
  let observedTotalBytes = 0
  let persistedCount = 0
  const publish = () => onProgress({ completed, downloadedBytes, totalBytes, persistedCount })
  publish()

  const downloadNext = async () => {
    while (!signal.aborted) {
      const src = ALL_LATEST_VIDEOS[cursor]
      if (!src) return
      cursor += 1

      const storedBlob = await readStoredVideo(src)
      const inMemory = downloadedVideos.get(src)
      if (storedBlob) {
        downloadedBytes += storedBlob.size
        observedTotalBytes += storedBlob.size
        persistedCount += 1
        completed += 1
        publish()
        continue
      }
      if (inMemory) {
        downloadedBytes += inMemory.bytes
        observedTotalBytes += inMemory.bytes
        completed += 1
        publish()
        continue
      }

      const response = await fetch(src, { signal })
      if (!response.ok) throw new Error(`Video request failed: ${response.status}`)
      let fileBytes = 0
      const chunks: ArrayBuffer[] = []
      if (response.body) {
        const reader = response.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fileBytes += value.byteLength
          downloadedBytes += value.byteLength
          chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer)
          publish()
        }
      } else {
        const buffer = await response.arrayBuffer()
        chunks.push(buffer)
        fileBytes = buffer.byteLength
        downloadedBytes += fileBytes
      }

      const blob = new Blob(chunks, { type: response.headers.get('content-type') ?? 'video/mp4' })
      observedTotalBytes += fileBytes
      let persisted = false
      if (fullCache) {
        try {
          await fullCache.put(src, new Response(blob, { headers: { 'Content-Type': 'video/mp4' } }))
          persisted = true
        } catch {
          // Keep an in-memory copy if the browser refuses persistent storage.
        }
      }
      if (persisted) persistedCount += 1
      else downloadedVideos.set(src, { objectUrl: URL.createObjectURL(blob), bytes: blob.size })
      completed += 1
      publish()
    }
  }

  await Promise.all(Array.from({ length: 2 }, () => downloadNext()))
  if (signal.aborted) throw new DOMException('Download cancelled', 'AbortError')
  if (!totalBytes) totalBytes = observedTotalBytes
  return { completed, downloadedBytes, totalBytes, persistedCount }
}

function usePlayableVideoSource(src: string) {
  const [resolved, setResolved] = useState<{ src: string; url: string } | null>(null)

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined
    setResolved(null)

    const inMemory = downloadedVideos.get(src)
    if (inMemory) {
      setResolved({ src, url: inMemory.objectUrl })
      return () => { active = false }
    }

    void readStoredVideo(src).then((blob) => {
      if (!active) return
      if (blob) {
        objectUrl = URL.createObjectURL(blob)
        setResolved({ src, url: objectUrl })
      } else {
        setResolved({ src, url: src })
      }
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  return resolved?.src === src ? resolved.url : undefined
}

export function dayFromTime(time: string) {
  return Number(time.match(/Day\s*(\d+)/)?.[1] ?? 0)
}

function MissionHeader({ nodeId, title, route }: { nodeId: string; title: string; route: string }) {
  return (
    <header className="latest-topbar">
      <div className="latest-brand-lockup">
        <span className="latest-brand-mark">14</span>
        <div><small>ALASKA FIELD OPERATION</small><strong>最后十四天</strong></div>
      </div>
      <div className="latest-current-mission"><small>当前情况</small><span>{title}</span></div>
      <div className="latest-route-code"><small>{ROUTE_NAMES[route] ?? route}</small><b>{nodeId}</b></div>
    </header>
  )
}

function ExpeditionHud({ time, location, route, condition }: { time: string; location: string; route: string; condition: string }) {
  const day = dayFromTime(time)
  const spansTime = /[—→]|起/.test(time)
  return (
    <section className="latest-expedition-hud" aria-label="行动状态">
      <div className="latest-day-counter"><span>{spansTime ? '起始 DAY' : 'DAY'}</span><strong>{String(day).padStart(2, '0')}</strong><small>/ 14</small></div>
      <div className="latest-deadline-rail">
        <div><span>行程时间</span><strong>{time}</strong><small>截止 Day 14 · 09:00</small></div>
        <div className="latest-day-ticks" aria-label={`${spansTime ? '本段开始于' : '当前'}第 ${day} 天；期限第 14 天`}>
          {Array.from({ length: 15 }, (_, index) => <i key={index} className={index <= day ? 'is-past' : ''} />)}
        </div>
      </div>
      <div className="latest-field-facts">
        <div><span>位置</span><strong>{location}</strong></div>
        <div><span>最初选择</span><strong>{route === 'PUBLIC' ? '尚未决定' : ROUTE_NAMES[route] ?? route}</strong></div>
      </div>
      <div className="latest-squad">
        <span>队伍</span>
        <div><b>沈</b><b>周</b><b>杰</b><em>队长 · 第一人称</em></div>
      </div>
      <div className="latest-condition"><span>关键限制</span><strong><i />{condition}</strong></div>
    </section>
  )
}

function isDecisionNode(node: ReturnType<typeof latestNode>): node is FinalNode {
  return Boolean(node && 'options' in node && node.options?.length)
}

function firstVideoFromTarget(targetId: string, decisions: LatestDecision[]) {
  let candidateId: string | undefined = targetId
  const visited = new Set<string>()

  while (candidateId && !visited.has(candidateId)) {
    visited.add(candidateId)
    if (candidateId === 'RESULT') return resultVideoForDecisions(decisions)

    const clips = LATEST_NODE_VIDEOS[candidateId]
    if (clips?.length) return clips[0]

    const candidateNode = latestNode(candidateId)
    if (candidateNode && isDecisionNode(candidateNode)) return undefined
    candidateId = nextLatestNode(candidateId)
  }

  return undefined
}

function videosAfterDecision(node: FinalNode, decisions: LatestDecision[]) {
  return visibleOptions(node, decisions).flatMap((option) => {
    const afterChoice = [...decisions, { nodeId: node.id, optionId: option.id, label: option.label }]
    const video = firstVideoFromTarget(optionTarget(option), afterChoice)
    return video ? [video] : []
  })
}

function playbackPrefetchCandidates(nodeId: string, decisions: LatestDecision[]) {
  if (nodeId === 'INTRO') {
    const firstChoice = latestNode('P06')
    return firstChoice && isDecisionNode(firstChoice) ? videosAfterDecision(firstChoice, decisions) : []
  }

  const activeNode = latestNode(nodeId)
  if (activeNode && isDecisionNode(activeNode)) return [...new Set(videosAfterDecision(activeNode, decisions))]

  const candidates: string[] = []
  let candidateId = nextLatestNode(nodeId)
  const visited = new Set([nodeId])

  while (candidateId && !visited.has(candidateId)) {
    visited.add(candidateId)
    if (candidateId === 'RESULT') {
      const resultVideo = resultVideoForDecisions(decisions)
      if (resultVideo) candidates.push(resultVideo)
      break
    }

    const clips = LATEST_NODE_VIDEOS[candidateId]
    const candidateNode = latestNode(candidateId)
    if (candidateNode && isDecisionNode(candidateNode)) {
      if (clips?.length) candidates.push(clips[0])
      candidates.push(...videosAfterDecision(candidateNode, decisions))
      break
    }
    if (clips?.length) candidates.push(clips[0])
    candidateId = nextLatestNode(candidateId)
  }

  return [...new Set(candidates)]
}

export function ProductionVideo({
  clips,
  title,
  onComplete,
  fallback,
  prefetchCandidates = [],
}: {
  fallback?: string
  clips: string[]
  title: string
  onComplete: () => void
  prefetchCandidates?: string[]
}) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const [mediaReady, setMediaReady] = useState(false)
  const [bufferPercent, setBufferPercent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [retry, setRetry] = useState(0)
  const [bridge, setBridge] = useState<VideoBridge | null>(null)
  const bridgeRef = useRef<VideoBridge | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const activeClip = clips[index]
  const playableSource = usePlayableVideoSource(activeClip)
  const subtitleTrack = latestSubtitleTrack(activeClip)
  const queuedPrefetch = [...new Set(prefetchCandidates)].filter((source) => source !== activeClip)

  useEffect(() => {
    setIndex(0)
    setFailed(false)
    setSubtitle('')
    setMediaReady(false)
    setBufferPercent(0)
    setPaused(false)
  }, [clips.join('|')])

  useEffect(() => {
    const shown = new Set<number>()
    const bridges = bridgesForVideo(activeClip)
    bridgeRef.current = null
    setBridge(null)
    let frame = 0
    const inspect = () => {
      const video = videoRef.current
      if (video && !video.paused && !bridgeRef.current) {
        const index = pendingBridge(bridges, video.currentTime, shown)
        if (index >= 0) {
          shown.add(index)
          const card = bridges[index]
          bridgeRef.current = card
          video.pause()
          setSubtitle('')
          setBridge(card)
        }
      }
      frame = window.requestAnimationFrame(inspect)
    }
    if (bridges.length) frame = window.requestAnimationFrame(inspect)
    return () => window.cancelAnimationFrame(frame)
  }, [activeClip, retry])

  const resumeBridge = () => {
    const card = bridgeRef.current
    const video = videoRef.current
    bridgeRef.current = null
    setBridge(null)
    if (!video || !card) return
    video.currentTime = Math.max(video.currentTime, card.resumeAt)
    void video.play().catch(() => { setMediaReady(true); setPaused(true) })
  }

  const updateBufferProgress = (video: HTMLVideoElement) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.buffered.length === 0) return
    const bufferedEnd = video.buffered.end(video.buffered.length - 1)
    setBufferPercent(Math.min(100, Math.round((bufferedEnd / video.duration) * 100)))
  }

  const finishClip = () => {
    setSubtitle('')
    if (index < clips.length - 1) {
      setMediaReady(false)
      setBufferPercent(0)
      setPaused(false)
      setIndex((value) => value + 1)
    }
    else onComplete()
  }

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => { setMediaReady(true); setPaused(true) })
    else video.pause()
  }

  return (
    <section className="latest-video-wrap">
      {bridge && <TimeTransition key={`${activeClip}-${bridge.at}`} {...bridge} onComplete={resumeBridge} />}
      {!failed && <PlaybackPrefetch videoRef={videoRef} sources={queuedPrefetch} enabled={mediaReady} />}
      <div className="latest-video-screen">
      {failed ? (
        <div className="latest-media-error">
          <strong>当前片段无法加载</strong>
          <p>{fallback ?? subtitleTrack?.cues.map(cue => cue.text).join('。') ?? '可以重试加载，或继续查看文字简报。'}</p>
          <button type="button" onClick={() => { setFailed(false); setMediaReady(false); setRetry(v => v + 1) }}>重新加载</button>
          <button type="button" onClick={finishClip}>已读简报，继续 →</button>
        </div>
      ) : (
        <video
          ref={videoRef}
          key={`${activeClip}-${retry}`}
          src={playableSource}
          aria-label={`${title} · 片段 ${index + 1}；单击或按空格暂停与继续`}
          autoPlay
          playsInline
          tabIndex={0}
          preload="auto"
          onClick={togglePlayback}
          onKeyDown={(event) => {
            if (event.key !== ' ' && event.key !== 'Enter') return
            event.preventDefault()
            togglePlayback()
          }}
          onLoadStart={() => {
            setMediaReady(false)
            setBufferPercent(0)
          }}
          onProgress={(event) => updateBufferProgress(event.currentTarget)}
          onLoadedMetadata={(event) => updateBufferProgress(event.currentTarget)}
          onCanPlay={(event) => {
            updateBufferProgress(event.currentTarget)
            setMediaReady(true)
            setPaused(event.currentTarget.paused)
          }}
          onPlaying={() => {
            setMediaReady(true)
            setPaused(false)
          }}
          onPause={() => setPaused(true)}
          onWaiting={(event) => {
            updateBufferProgress(event.currentTarget)
            setMediaReady(false)
          }}
          onTimeUpdate={(event) => setSubtitle(activeLatestSubtitle(subtitleTrack?.cues ?? [], event.currentTarget.currentTime))}
          onSeeked={(event) => setSubtitle(activeLatestSubtitle(subtitleTrack?.cues ?? [], event.currentTarget.currentTime))}
          onEnded={finishClip}
          onError={() => setFailed(true)}
        />
      )}
      {!failed && !mediaReady && (
        <div className="latest-media-loader" role="status" aria-live="polite">
          <div className="latest-media-loader-mark">14</div>
          <small>FIELD DATA · {index + 1} / {clips.length}</small>
          <strong>{bufferPercent > 0 ? '正在缓冲本段视频' : '正在加载本段视频'}</strong>
          <div
            className="latest-media-progress"
            role="progressbar"
            aria-label="视频资源加载进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={bufferPercent}
          >
            <i style={{ width: `${Math.max(bufferPercent, 3)}%` }} />
          </div>
          <span>{bufferPercent > 0 ? `已缓冲 ${bufferPercent}%` : '准备好后会自动播放'}</span>
        </div>
      )}
      {!failed && mediaReady && paused && <div className="latest-video-paused" aria-hidden="true"><b>▶</b><span>继续播放</span></div>}
      {!bridge && subtitle && <div className="latest-subtitle" aria-live="off">{subtitle}</div>}
      </div>
      <div className="latest-video-caption">
        <div className="latest-video-caption-title"><small>眼前的情况</small><strong>{title}</strong></div>
        <div className="latest-video-caption-actions">
          {clips.length > 1 && <span>片段 {index + 1} / {clips.length}</span>}
          {!failed && <button type="button" onClick={togglePlayback} disabled={!mediaReady || !!bridge} aria-label={paused ? '继续播放视频' : '暂停视频'}>{paused ? '▶ 继续播放' : 'Ⅱ 暂停'}</button>}
        </div>
      </div>
    </section>
  )
}

function OpeningBriefing({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="latest-opening-briefing" aria-labelledby="opening-briefing-title">
      <section>
        <small>故事开始之前</small>
        <h1 id="opening-briefing-title">阿拉斯加 · 勘探营地</h1>
        <p>你签下了一份为期三个月的购买期权，可以在期限内买下这片土地。</p>
        <p>如今，你和队友终于发现了看起来品质很好的金矿。</p>
        <p>但土地还不属于你。你必须在最后十四天内亲自赶回去，完成购买确认。</p>
        <button autoFocus type="button" onClick={onContinue}>进入营地 <span aria-hidden="true">→</span></button>
      </section>
    </main>
  )
}

function TimeTransition({ title, detail, onComplete }: NarrativeCard & { onComplete: () => void }) {
  const complete = useRef(onComplete)
  complete.current = onComplete
  const duration = cardDuration({title, detail})
  useEffect(() => {
    const timer = window.setTimeout(() => complete.current(), duration)
    return () => window.clearTimeout(timer)
  }, [title, detail, duration])

  return (
    <section className="latest-time-transition" role="dialog" aria-modal="true" aria-label="剧情过场" style={{'--bridge-duration': `${duration}ms`} as CSSProperties}>
      <button autoFocus type="button" onClick={onComplete} aria-label={`${title}，${detail}；点击继续`}>
        <strong>{title}</strong>
        <span>{detail}</span>
        <i />
        <small>点击继续</small>
      </button>
    </section>
  )
}

function VideoPreload({ src, onComplete }: {
  src: string
  onComplete?: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playableSource = usePlayableVideoSource(src)
  const complete = useRef(onComplete)
  const completed = useRef(false)
  complete.current = onComplete

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    completed.current = false
    const checkComplete = () => {
      if (completed.current || !Number.isFinite(video.duration) || video.duration <= 0 || video.buffered.length === 0) return
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      if (bufferedEnd >= video.duration - 0.25) {
        completed.current = true
        complete.current?.()
      }
    }
    video.addEventListener('progress', checkComplete)
    video.addEventListener('loadedmetadata', checkComplete)
    video.addEventListener('canplaythrough', checkComplete)
    checkComplete()
    return () => {
      video.removeEventListener('progress', checkComplete)
      video.removeEventListener('loadedmetadata', checkComplete)
      video.removeEventListener('canplaythrough', checkComplete)
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={playableSource}
      preload="auto"
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
      style={{ position: 'fixed', width: 1, height: 1, left: -2, bottom: -2, opacity: 0, pointerEvents: 'none' }}
    />
  )
}

function PlaybackPrefetch({
  videoRef,
  sources,
  enabled,
}: {
  videoRef: { current: HTMLVideoElement | null }
  sources: string[]
  enabled: boolean
}) {
  const [index, setIndex] = useState(0)
  const sourceKey = sources.join('|')
  const source = sources[index]

  useEffect(() => {
    setIndex(0)
  }, [sourceKey])

  const [bufferAllowsPrefetch, setBufferAllowsPrefetch] = useState(false)
  useEffect(() => {
    if (!enabled) {
      setBufferAllowsPrefetch(false)
      return
    }

    const inspect = () => {
      const activeVideo = videoRef.current
      if (!activeVideo) {
        setBufferAllowsPrefetch(false)
      } else if (activeVideo.paused) {
        setBufferAllowsPrefetch(true)
      } else {
        let bufferedAhead = 0
        for (let range = 0; range < activeVideo.buffered.length; range += 1) {
          const start = activeVideo.buffered.start(range)
          const end = activeVideo.buffered.end(range)
          if (activeVideo.currentTime >= start - 0.1 && activeVideo.currentTime <= end) {
            bufferedAhead = end - activeVideo.currentTime
            break
          }
        }
        setBufferAllowsPrefetch((allowed) => allowed ? bufferedAhead >= 6 : bufferedAhead >= 18)
      }
    }

    const activeVideo = videoRef.current
    if (!activeVideo) return
    const events = ['canplay', 'loadedmetadata', 'pause', 'play', 'playing', 'progress', 'timeupdate', 'waiting'] as const
    for (const event of events) activeVideo.addEventListener(event, inspect)
    inspect()
    return () => {
      for (const event of events) activeVideo.removeEventListener(event, inspect)
    }
  }, [enabled, videoRef])

  if (!enabled || !source || !bufferAllowsPrefetch) return null
  return (
    <VideoPreload
      key={source}
      src={source}
      onComplete={() => {
        setIndex((current) => current + 1)
      }}
    />
  )
}

function FrameStage({ node, onContinue }: { node: NonNullable<ReturnType<typeof latestNode>>; onContinue: () => void }) {
  const frames = latestFrames(node.frameIds)
  return (
    <section className="latest-frame-stage">
      <div className={`latest-frame-grid latest-frame-grid-${Math.min(frames.length, 3)}`}>
        {frames.slice(0, 3).map((frame) => <img key={frame.id} src={frame.src} alt={frame.title} />)}
      </div>
      <div className="latest-frame-copy">
        <span>FIELD BRIEF · {node.kind} · {ROUTE_NAMES[node.route]}</span>
        <h1>{node.title}</h1>
        <p>{node.facts}</p>
        <dl>
          <div><dt>时间</dt><dd>{node.time}</dd></div>
          <div><dt>地点</dt><dd>{node.location}</dd></div>
          <div><dt>本段重点</dt><dd>{node.knowledge}</dd></div>
        </dl>
        <button type="button" onClick={onContinue}>继续行动 <b>→</b></button>
      </div>
    </section>
  )
}

function ChoiceStage({ node, options, decisions, onSelect }: { node: FinalNode; options: FinalOption[]; decisions: LatestDecision[]; onSelect: (option: FinalOption, reason: string) => void }) {
  const [reason, setReason] = useState('')
  const style = { '--latest-choice-image': `url("${decisionBackdrop(node.id, decisions)}")` } as CSSProperties
  return (
    <section className="latest-choice-stage" style={style}>
      <div className="latest-choice-head">
        <span>轮到你决定</span>
        <h1>{node.question ?? node.title}</h1>
        <p>{node.facts}</p>
      </div>
      <details className="latest-decision-note" open={node.id === 'P06'}>
        <summary>先记下一句判断依据（选填，结局后对照）</summary>
        <label htmlFor="decision-reason">{node.id === 'P06' ? '你优先保住什么？愿意为此放弃什么？' : '哪条信息支持你的决定？什么变化会让你调整？'}</label>
        <textarea id="decision-reason" rows={2} maxLength={1200} value={reason} onChange={event => setReason(event.target.value)} placeholder="用一句话记录此刻的判断，结局后可以回来对照。" />
      </details>
      <div className={`latest-choice-grid latest-choice-grid-${options.length}`}>
        {options.map((option, index) => (
          <button key={option.id} type="button" onClick={() => onSelect(option, reason.trim())} aria-label={`方案 ${index + 1}：${option.label}`}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <div><strong>{option.label}</strong></div>
            <span><i>需要权衡</i>{option.cost}</span>
            <em>确认选择 <u>↗</u></em>
          </button>
        ))}
      </div>
    </section>
  )
}

export function ArrivalOutcomeStage({ decisions }: { decisions: LatestDecision[] }) {
  const branch = branchForDecisions(decisions)
  const outcome = arrivalOutcomeForDecisions(decisions)
  if (!branch || !outcome) return null
  return (
    <section className="latest-arrival-stage" data-tone={outcome.tone}>
      <figure className="latest-arrival-visual">
        <img src={outcome.image} alt={outcome.title} />
        <figcaption>{outcome.eyebrow}</figcaption>
      </figure>
      <div className="latest-arrival-copy">
        <span>ACTION RECORD · {branch.id}</span>
        <h1>{outcome.title}</h1>
        <p>{outcome.detail}</p>
        <dl>
          <div><dt>期限结果</dt><dd>{branch.deadline}</dd></div>
          <div><dt>人员状态</dt><dd>{branch.people}</dd></div>
          <div><dt>核心取舍</dt><dd>{branch.tradeoff}</dd></div>
        </dl>
      </div>
    </section>
  )
}

export function ResultStage({ decisions, onRestart, attemptId = "preview", archives = [], explored = false }: { decisions: LatestDecision[]; onRestart: () => void; attemptId?: string; archives?: AttemptRecord[]; explored?: boolean }) {
  const branch = branchForDecisions(decisions)
  if (!branch) return <section className="latest-result"><h1>路径尚未完成</h1><button type="button" onClick={onRestart}>重新开始</button></section>
  return (
    <section className="latest-result">
      <div className="latest-result-copy">
        <span>行动已结束 · 回看你的选择</span>
        <h1>{reportPathTitle(branch)}</h1>
        <div className="latest-confirmation latest-confirmation-neutral">
          {confirmationStatus(branch)}
        </div>
        <div className="latest-result-grid">
          <div><small>{/Day/.test(branch.completion) ? '本局完成时间' : '行动结果'}</small><strong>{branch.completion}</strong></div>
          <div><small>期限结果</small><strong>{branch.deadline}</strong></div>
          <div><small>人员状态</small><strong>{branch.people}</strong></div>
          <div><small>核心取舍</small><strong>{branch.tradeoff}</strong></div>
        </div>
        <div className="latest-path">
          {decisions.map((decision) => <span key={`${decision.nodeId}-${decision.optionId}`}>{decision.label}</span>)}
        </div>
        <a className="latest-report-jump" href="#latest-decision-report">回看这一路的选择 <b>↓</b></a>
      </div>
      <LatestDecisionReport decisions={decisions} onRestart={onRestart} attemptId={attemptId} archives={archives} explored={explored} />
    </section>
  )
}

export function LatestStoryPlay() {
  const [session, setSession] = useState(() => {
    try { return restoreSession(window.localStorage.getItem(SESSION_KEY)) ?? freshSession() }
    catch { return freshSession() }
  })
  const [awaitResume, setAwaitResume] = useState(session.nodeId !== 'launch')
  const [showStartPrompt, setShowStartPrompt] = useState(false)
  const [startIntent, setStartIntent] = useState<'new' | 'resume'>('new')
  const [saveError, setSaveError] = useState(false)
  const { nodeId, decisions, mediaDone, transitionDone, arrivalSceneDone } = session
  const isLaunchScreen = nodeId === 'launch' || awaitResume
  useEffect(() => {
    if (awaitResume) return
    try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); setSaveError(false) }
    catch { setSaveError(true) }
  }, [session, awaitResume])
  const isFreshLaunch = nodeId === 'launch' && !awaitResume
  const [startupLoadState, setStartupLoadState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [startupLoadedBytes, setStartupLoadedBytes] = useState(0)
  const [startupTotalBytes, setStartupTotalBytes] = useState(0)
  const [startupRetry, setStartupRetry] = useState(0)
  const [fullDownload, setFullDownload] = useState(initialFullDownloadProgress)
  const fullDownloadController = useRef<AbortController | null>(null)

  useEffect(() => () => {
    fullDownloadController.current?.abort()
    fullDownloadController.current = null
  }, [])

  useEffect(() => {
    if (!isFreshLaunch) return
    const existing = downloadedVideos.get(LATEST_PUBLIC_VIDEO)
    if (existing) {
      setStartupLoadedBytes(existing.bytes)
      setStartupTotalBytes(existing.bytes)
      setStartupLoadState('ready')
      return
    }

    const controller = new AbortController()
    let active = true
    setStartupLoadState('loading')
    setStartupLoadedBytes(0)
    setStartupTotalBytes(0)

    const downloadCoreVideo = async () => {
      const cachedBlob = await readStoredVideo(LATEST_PUBLIC_VIDEO)
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob)
        downloadedVideos.set(LATEST_PUBLIC_VIDEO, { objectUrl, bytes: cachedBlob.size })
        if (active) {
          setStartupLoadedBytes(cachedBlob.size)
          setStartupTotalBytes(cachedBlob.size)
          setStartupLoadState('ready')
        }
        return
      }

      const response = await fetch(LATEST_PUBLIC_VIDEO, { signal: controller.signal })
      if (!response.ok) throw new Error(`Core video request failed: ${response.status}`)
      const cacheWrite = writeCoreVideoCache(LATEST_PUBLIC_VIDEO, response.clone())
      const totalBytes = Number(response.headers.get('content-length')) || 0
      if (active) setStartupTotalBytes(totalBytes)

      let loadedBytes = 0
      let blob: Blob
      if (!response.body) {
        blob = await response.blob()
        loadedBytes = blob.size
      } else {
        const reader = response.body.getReader()
        const chunks: ArrayBuffer[] = []
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          loadedBytes += value.byteLength
          chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer)
          if (active) setStartupLoadedBytes(loadedBytes)
        }
        blob = new Blob(chunks, { type: response.headers.get('content-type') ?? 'video/mp4' })
      }

      await cacheWrite
      const objectUrl = URL.createObjectURL(blob)
      downloadedVideos.set(LATEST_PUBLIC_VIDEO, { objectUrl, bytes: loadedBytes })
      if (active) {
        setStartupLoadedBytes(loadedBytes)
        setStartupTotalBytes(totalBytes || loadedBytes)
        setStartupLoadState('ready')
      }
    }

    void downloadCoreVideo().catch((error: unknown) => {
      if (!active || (error instanceof DOMException && error.name === 'AbortError')) return
      setStartupLoadState('failed')
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [isFreshLaunch, startupRetry])
  const view = presentNode(nodeId, decisions)
  const node = view?.node
  const videos = LATEST_NODE_VIDEOS[nodeId] ?? []
  const resultBranch = nodeId === 'RESULT' ? branchForDecisions(decisions) : undefined
  const resultVideo = nodeId === 'RESULT' ? resultVideoForDecisions(decisions) : undefined
  const arrivalTitle = resultSceneTitleForDecisions(decisions)
  const options = useMemo(() => node && isDecisionNode(node) ? visibleOptions(node, decisions) : [], [node, decisions])
  const setMediaDone = (value: boolean) => setSession(s => ({ ...s, mediaDone: value }))
  const setTransitionDone = (value: boolean) => setSession(s => ({ ...s, transitionDone: value }))
  const setArrivalSceneDone = (value: boolean) => setSession(s => ({ ...s, arrivalSceneDone: value }))
  const go = (nextNodeId: string, nextDecisions = decisions) => setSession(s => advanceSession(s, nextNodeId, nextDecisions))
  const continueNode = () => { const next = nextLatestNode(nodeId); if (next) go(next) }
  const choose = (option: FinalOption, reason: string) => {
    go(optionTarget(option), [...decisions, { nodeId, optionId: option.id, label: option.label, reason, recordedAt: new Date().toISOString() }])
  }
  const back = () => setSession(rewindSession)
  const cancelFullDownloadForGameplay = () => {
    if (!fullDownloadController.current) return
    fullDownloadController.current.abort()
    fullDownloadController.current = null
    setFullDownload((progress) => ({ ...progress, status: 'idle' }))
  }
  const downloadFullPack = () => {
    if (fullDownloadController.current) return
    const controller = new AbortController()
    fullDownloadController.current = controller
    setFullDownload({ ...initialFullDownloadProgress, status: 'estimating' })
    void downloadCompleteVideoPack(controller.signal, (progress) => {
      setFullDownload({ ...progress, status: 'downloading' })
    }).then((progress) => {
      setFullDownload({ ...progress, status: 'ready' })
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return
      controller.abort()
      setFullDownload((progress) => ({ ...progress, status: 'failed' }))
    }).finally(() => {
      if (fullDownloadController.current === controller) fullDownloadController.current = null
    })
  }
  useEffect(() => {
    if (!shouldAutoStartFullPack({
      launchVisible: isLaunchScreen,
      coreVideoPending: isFreshLaunch && startupLoadState === 'loading',
      requestActive: Boolean(fullDownloadController.current),
      status: fullDownload.status,
    })) return
    downloadFullPack()
  }, [isLaunchScreen, isFreshLaunch, startupLoadState, fullDownload.status])
  const enterAction = (intent: 'new' | 'resume') => {
    setShowStartPrompt(false)
    cancelFullDownloadForGameplay()
    if (intent === 'resume') setAwaitResume(false)
    else go('INTRO')
  }
  const requestStart = (intent: 'new' | 'resume') => {
    if (shouldPromptBeforeStarting(fullDownload.status)) {
      setStartIntent(intent)
      setShowStartPrompt(true)
      return
    }
    enterAction(intent)
  }
  const newGame = () => { cancelFullDownloadForGameplay(); setSession(freshSession()); setAwaitResume(false) }
  const restart = () => {
    setSession(s => ({ ...freshSession(), explored: true, seenOutcome: s.seenOutcome,
      archives: [...s.archives, { id: s.attemptId, nodeId: s.nodeId, decisions: s.decisions, completed: s.nodeId === 'RESULT', savedAt: new Date().toISOString() }] }))
    setAwaitResume(false)
  }

  if (nodeId === 'launch' || awaitResume) return (
    <>
    {showStartPrompt && <div className="latest-start-confirm-backdrop">
      <section className="latest-start-confirm" role="dialog" aria-modal="true" aria-labelledby="latest-start-confirm-title" aria-describedby="latest-start-confirm-description">
        <span>资源包下载提示</span>
        <h2 id="latest-start-confirm-title">{fullDownload.status === 'ready' ? '完整资源包已就绪' : '完整资源包尚未下载完成'}</h2>
        <p id="latest-start-confirm-description">
          {fullDownload.status === 'ready'
            ? '全部视频已经缓存，可以开始行动。'
            : fullDownload.status === 'estimating'
              ? '正在统计完整资源包的总量，随后会自动继续下载。'
              : fullDownload.status === 'downloading'
                ? `当前已下载 ${formatMegabytes(fullDownload.downloadedBytes)}${fullDownload.totalBytes ? ` / ${formatMegabytes(fullDownload.totalBytes)}` : ''}，完成 ${fullDownload.completed} / ${ALL_LATEST_VIDEOS.length} 段。`
                : fullDownload.status === 'failed'
                  ? `资源包下载中断，已完成 ${fullDownload.completed} / ${ALL_LATEST_VIDEOS.length} 段；可以留在首页重试，也可以继续开始。`
                  : '完整资源包还未就绪，可以留在首页等待下载，也可以现在开始。'}
        </p>
        {fullDownload.status !== 'ready' && <small>现在开始会暂停完整包下载，已完成的视频会保留；剧情视频之后按需加载。</small>}
        <div className="latest-start-confirm-actions">
          <button type="button" autoFocus onClick={() => setShowStartPrompt(false)}>{fullDownload.status === 'ready' ? '返回首页' : fullDownload.status === 'failed' ? '留在首页重试下载' : '留在首页继续下载'}</button>
          <button type="button" onClick={() => enterAction(startIntent)}>{startIntent === 'resume' ? '继续上次行动' : '仍然开始行动'}</button>
        </div>
      </section>
    </div>}
    <main className="latest-launch">
      <div className="latest-launch-shade" />
      <header className="latest-launch-header">
        <div className="latest-brand-lockup"><span className="latest-brand-mark">14</span><div><small>ALASKA FIELD OPERATION</small><strong>最后十四天</strong></div></div>
        <span>单人决策剧情 · 第一人称体验</span>
      </header>
      <section className="latest-launch-layout">
        <div className="latest-launch-copy">
          <span>你是勘探队长 · 返程期限只剩十四天</span>
          <h1><small>最后</small>十四天</h1>
          <p>发现了可能有金矿的土地，却还没有买下它。你必须在十四天内赶回去，亲自完成确认。山里天气未定，你的左手又受了伤。这一路，怎么走由你决定。</p>
          <div className="latest-launch-actions">
            {awaitResume ? <><button type="button" onClick={() => requestStart('resume')}>继续上次行动 <b>→</b></button><button type="button" onClick={newGame}>开始全新一局</button></>
              : <button type="button" disabled={startupLoadState !== 'ready'} onClick={() => requestStart('new')}>{startupLoadState === 'ready' ? (session.explored ? '开始对照探索' : '开始行动') : '正在准备核心资源…'} {startupLoadState === 'ready' && <b>→</b>}</button>}
            <small>和三位队友一起出发，在关键时刻作出决定</small>
          </div>
          {isLaunchScreen && <section className="latest-launch-full-pack" aria-label="下载完整视频资源包">
            <div className="latest-launch-preload-heading"><span>自动预下载 · {ALL_LATEST_VIDEOS.length} 段视频</span><strong>{fullDownload.status === 'ready' ? '全部就绪' : fullDownload.status === 'estimating' ? '正在统计总量' : fullDownload.status === 'downloading' ? '正在下载' : fullDownload.status === 'failed' ? '下载中断' : '首次进入自动开始'}</strong></div>
            <p>完整资源包约 100 MiB，首次进入此页会自动下载并缓存到当前浏览器，之后切换路线可少等一会儿。</p>
            <div className={`latest-launch-preload-progress${fullDownload.status === 'estimating' ? ' is-indeterminate' : ''}`} role="progressbar" aria-label="完整资源包下载进度" aria-valuemin={0} aria-valuemax={fullDownload.totalBytes || ALL_LATEST_VIDEOS.length} aria-valuenow={fullDownload.status === 'estimating' ? undefined : fullDownload.totalBytes ? Math.min(fullDownload.totalBytes, fullDownload.downloadedBytes) : fullDownload.completed}>
              <i style={{ width: `${Math.min(100, fullDownload.totalBytes ? fullDownload.downloadedBytes / fullDownload.totalBytes * 100 : fullDownload.completed / ALL_LATEST_VIDEOS.length * 100)}%` }} />
            </div>
            <div className="latest-launch-preload-detail"><span>{fullDownload.completed} / {ALL_LATEST_VIDEOS.length} 段视频已准备</span><b>{fullDownload.status === 'idle' ? '即将自动开始' : `${formatMegabytes(fullDownload.downloadedBytes)}${fullDownload.totalBytes ? ` / ${formatMegabytes(fullDownload.totalBytes)}` : fullDownload.status === 'estimating' ? ' · 正在统计总量' : fullDownload.status === 'ready' ? ' · 总量统计不可用' : ' · 总量暂不可用'}`}</b></div>
            <small className="latest-launch-preload-note">未下载完成时点击开始会先提示；继续开始会暂停完整包下载，剧情视频仍会按需加载。</small>
            {fullDownload.status === 'ready' && <small className="latest-launch-preload-note">已保存到浏览器缓存：{fullDownload.persistedCount} / {ALL_LATEST_VIDEOS.length} 段{fullDownload.persistedCount === ALL_LATEST_VIDEOS.length ? '，下次访问可复用。' : '；其余素材本次打开期间可直接播放。'}</small>}
            {fullDownload.status === 'failed' && <small className="latest-launch-full-pack-error">有视频下载失败。已完成的素材保留在缓存中，可以重试剩余部分。</small>}
            <button type="button" onClick={downloadFullPack} disabled={fullDownload.status === 'estimating' || fullDownload.status === 'downloading' || fullDownload.status === 'ready' || (isFreshLaunch && startupLoadState !== 'ready')}>
              {fullDownload.status === 'ready' ? '完整资源包已就绪' : fullDownload.status === 'estimating' ? '正在统计总量…' : fullDownload.status === 'downloading' ? '完整资源包下载中…' : fullDownload.status === 'failed' ? '重试下载剩余视频' : isFreshLaunch && startupLoadState !== 'ready' ? '开场视频准备好后自动下载' : '开始下载完整资源包'}
            </button>
          </section>}
          {isFreshLaunch && <section className="latest-launch-preload" aria-label="核心游戏资源下载">
            <div className="latest-launch-preload-heading"><span>CORE DATA · 01 / 01</span><strong>{startupLoadState === 'ready' ? '已就绪' : startupLoadState === 'failed' ? '下载未完成' : '正在下载开场视频'}</strong></div>
            <div className={`latest-launch-preload-progress${startupTotalBytes ? '' : ' is-indeterminate'}`} role="progressbar" aria-label="核心资源下载进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={startupTotalBytes ? Math.min(100, Math.floor(startupLoadedBytes / startupTotalBytes * 100)) : undefined}>
              <i style={{ width: startupTotalBytes ? `${Math.min(100, startupLoadedBytes / startupTotalBytes * 100)}%` : undefined }} />
            </div>
            <div className="latest-launch-preload-detail"><span>开场剧情视频</span><b>{formatMegabytes(startupLoadedBytes)}{startupTotalBytes ? ` / ${formatMegabytes(startupTotalBytes)}` : ''}</b></div>
            <small className="latest-launch-preload-note">先准备开场视频；后续路线素材会在播放和选择时按需下载。</small>
            {startupLoadState === 'failed' && <div className="latest-launch-preload-actions"><small>核心视频暂时无法下载，可重试或直接在线播放。</small><button type="button" onClick={() => setStartupRetry((value) => value + 1)}>重试下载</button><button type="button" onClick={() => requestStart('new')}>直接在线播放 →</button></div>}
          </section>}
        </div>
        <aside className="latest-briefing-board" aria-label="行动简报">
          <header><span>行动简报</span><b>DAY 0 / 14</b></header>
          <dl>
            <div><dt>目标</dt><dd>在期限内返回并完成最后确认</dd></div>
            <div><dt>固定截止</dt><dd>Day 14 · 09:00</dd></div>
            <div><dt>当前限制</dt><dd>队长左手偶发失力</dd></div>
          </dl>
          <div className="latest-briefing-window"><span>返程期限</span><div>{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div><small>赶时间、避风雪、照顾伤手，你需要作出取舍。</small></div>
          <div className="latest-route-legend">{ROUTE_LEGEND.map(([code, label]) => <span key={code}><b>{code}</b>{label}</span>)}</div>
        </aside>
      </section>
      <footer className="latest-launch-footer"><span>队伍：沈岚 · 老周 · 阿杰</span><span>01 / 行动开始</span></footer>
    </main>
    </>
  )

  if (nodeId === 'INTRO' && !transitionDone) return (
    <>
      <OpeningBriefing onContinue={() => setTransitionDone(true)} />
      <VideoPreload src={LATEST_PUBLIC_VIDEO} />
    </>
  )

  const timeTransition = nodeId === 'RESULT' ? resultBridge(decisions) : LATEST_TIME_TRANSITIONS[nodeId]
  const transitionVideo = nodeId === 'RESULT' ? resultVideo : videos[0]
  if (timeTransition && !transitionDone) return (
    <>
      <TimeTransition key={nodeId} {...timeTransition} onComplete={() => setTransitionDone(true)} />
      {transitionVideo && <VideoPreload key={transitionVideo} src={transitionVideo} />}
    </>
  )

  if (nodeId === 'INTRO') return (
    <main className="latest-shell latest-shell-video" data-route="PUBLIC">
      <MissionHeader nodeId="PROLOGUE" title="确认机会、期限与路线" route="PUBLIC" />
      <ProductionVideo clips={[LATEST_PUBLIC_VIDEO]} title="确认机会、期限与路线" prefetchCandidates={playbackPrefetchCandidates('INTRO', decisions)} onComplete={() => go('P06')} />
      <footer className="latest-footer"><button type="button" onClick={back}>← 返回</button><button type="button" onClick={() => go('P06')}>跳过开场 →</button></footer>
    </main>
  )

  if (nodeId === 'RESULT' && resultVideo && !mediaDone) return (
    <main className="latest-shell latest-shell-video" data-route="SHARED">
      <MissionHeader nodeId="ARRIVAL" title={arrivalTitle} route="SHARED" />
      <ProductionVideo clips={[resultVideo]} title={arrivalTitle} onComplete={() => setMediaDone(true)} />
      <footer className="latest-footer"><button type="button" onClick={back}>← 返回上一步</button><button type="button" onClick={() => setMediaDone(true)}>跳过抵达镜头 →</button></footer>
    </main>
  )

  if (nodeId === 'RESULT' && !arrivalSceneDone) return (
    <main className="latest-shell latest-shell-arrival" data-route="SHARED">
      <MissionHeader nodeId="OUTCOME" title={resultBranch?.deadline === '主动放弃' ? '安全返程结果' : '返程与办理结果'} route="SHARED" />
      <section className="latest-stage">
        <ArrivalOutcomeStage decisions={decisions} />
      </section>
      <footer className="latest-footer"><button type="button" onClick={back}>← 返回上一步</button><button type="button" onClick={() => setArrivalSceneDone(true)}>进入复盘 →</button></footer>
    </main>
  )

  if (nodeId === 'RESULT') return (
    <main className="latest-shell latest-shell-result" data-route="SHARED">
      <MissionHeader nodeId="DEBRIEF" title="行动结果与战略学习复盘" route="SHARED" />
      <ResultStage decisions={decisions} onRestart={restart} attemptId={session.attemptId} archives={session.archives} explored={session.explored} />
      <footer className="latest-footer"><button type="button" onClick={back}>← 返回上一步</button><span>明确目标 · 解释取舍 · 检验依据 · 形成调整条件</span></footer>
    </main>
  )

  if (!node) return null
  const showChoice = isDecisionNode(node) && (videos.length === 0 || mediaDone)
  const playbackCandidates = !mediaDone && videos.length > 0
    ? playbackPrefetchCandidates(nodeId, decisions)
    : []

  return (
    <>
    <main className="latest-shell" data-route={node.route}>
      <MissionHeader nodeId={node.id} title={node.title} route={node.route} />
      <ExpeditionHud time={node.time} location={node.location} route={node.route} condition={view?.condition ?? '左手需照护'} />
      <section className={`latest-stage${showChoice ? ' latest-stage-choice' : ''}`}>
        {showChoice ? <ChoiceStage key={`${session.attemptId}-${node.id}`} node={node} options={options} decisions={decisions} onSelect={choose} />
          : videos.length > 0 && !mediaDone ? <ProductionVideo key={nodeId} clips={videos} title={node.title} fallback={node.facts} prefetchCandidates={playbackCandidates} onComplete={() => isDecisionNode(node) ? setMediaDone(true) : continueNode()} />
            : <FrameStage node={node} onContinue={continueNode} />}
      </section>
      <footer className="latest-footer">
        <button type="button" onClick={back}>← 返回上一步</button>
        <span>{saveError ? '进度暂时无法保存，请勿刷新。' : session.explored ? '对照探索 · 此前的选择已保留在复盘中' : decisions.length ? decisions.map((item) => item.label).join(' → ') : '机会、期限、路线、天气与伤手已经说明'}</span>
        {videos.length > 0 && !mediaDone && <button type="button" onClick={() => isDecisionNode(node) ? setMediaDone(true) : continueNode()}>跳过本段 →</button>}
      </footer>
    </main>
    </>
  )
}
