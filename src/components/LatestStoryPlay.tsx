import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  LATEST_NODE_VIDEOS,
  LATEST_PUBLIC_VIDEO,
  LATEST_TIME_TRANSITIONS,
  branchForDecisions,
  confirmationStatus,
  latestFrames,
  latestNode,
  nextLatestNode,
  optionTarget,
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

const ROUTE_NAMES: Record<string, string> = {
  PUBLIC: '公共开场', A: '立即翻山', B: '走山谷', C: '等待天气信息', D: '安全等待', SHARED: '结算',
}

const ROUTE_LEGEND = [
  ['A', '立即翻山'], ['B', '走山谷'], ['C', '等待信息'], ['D', '安全等待'],
] as const

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
      <div className="latest-current-mission"><small>当前任务</small><span>{title}</span></div>
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
        <div><span>行动窗口</span><strong>{time}</strong><small>截止 Day 14 · 09:00</small></div>
        <div className="latest-day-ticks" aria-label={`${spansTime ? '本段开始于' : '当前'}第 ${day} 天；期限第 14 天`}>
          {Array.from({ length: 15 }, (_, index) => <i key={index} className={index <= day ? 'is-past' : ''} />)}
        </div>
      </div>
      <div className="latest-field-facts">
        <div><span>位置</span><strong>{location}</strong></div>
        <div><span>路线</span><strong>{ROUTE_NAMES[route] ?? route}</strong></div>
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

function ProductionVideo({
  clips,
  title,
  onComplete,
  fallback,
}: {
  fallback?: string
  clips: string[]
  title: string
  onComplete: () => void
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
  const subtitleTrack = latestSubtitleTrack(activeClip)

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
          src={activeClip}
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
        >
          {subtitleTrack && <track kind="captions" src={subtitleTrack.src} srcLang="zh-CN" label="中文字幕" />}
        </video>
      )}
      {!failed && !mediaReady && (
        <div className="latest-media-loader" role="status" aria-live="polite">
          <div className="latest-media-loader-mark">14</div>
          <small>FIELD DATA · {index + 1} / {clips.length}</small>
          <strong>{bufferPercent > 0 ? '正在缓冲行动记录' : '正在连接行动资料库'}</strong>
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
          <span>{bufferPercent > 0 ? `可播放数据已缓冲 ${bufferPercent}%` : '正在加载视频…'}</span>
        </div>
      )}
      {!failed && mediaReady && paused && <div className="latest-video-paused" aria-hidden="true"><b>▶</b><span>继续播放</span></div>}
      {!bridge && subtitle && <div className="latest-subtitle" aria-live="off">{subtitle}</div>}
      <div className="latest-video-tag"><i />现场记录</div>
      <div className="latest-video-title"><small>CURRENT OBJECTIVE</small><strong>{title}</strong></div>
      {clips.length > 1 && <div className="latest-video-count">{index + 1} / {clips.length}</div>}
      <span className="latest-frame-corner latest-frame-corner-a" />
      <span className="latest-frame-corner latest-frame-corner-b" />
    </section>
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
        <span>DECISION REQUIRED · {node.id} · {node.time}</span>
        <h1>{node.question ?? node.title}</h1>
        <p>{node.facts}</p>
        <small>这里只显示此刻已经掌握的信息，行动结果将在选择后揭示。</small>
      </div>
      <details className="latest-decision-note">
        <summary>记下判断依据（选填，随本次选择保存）</summary>
        <label htmlFor="decision-reason">{node.id === 'P06' ? '你优先保住什么？愿意为此放弃什么？' : '哪条信息支持你的决定？什么变化会让你调整？'}</label>
        <textarea id="decision-reason" rows={2} maxLength={1200} value={reason} onChange={event => setReason(event.target.value)} placeholder="用一句话记录此刻的判断，结局后可以回来对照。" />
      </details>
      <div className={`latest-choice-grid latest-choice-grid-${options.length}`}>
        {options.map((option, index) => (
          <button key={option.id} type="button" onClick={() => onSelect(option, reason.trim())} aria-label={`方案 ${index + 1}：${option.label}`}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <div><small>行动方案</small><strong>{option.label}</strong></div>
            <span><i>已知风险</i>{option.cost}</span>
            <em>确认选择 <u>↗</u></em>
          </button>
        ))}
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
        <a className="latest-report-jump" href="#latest-decision-report">进入战略学习复盘 <b>↓</b></a>
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
  const [saveError, setSaveError] = useState(false)
  const { nodeId, decisions, mediaDone, transitionDone } = session
  useEffect(() => {
    if (awaitResume) return
    try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); setSaveError(false) }
    catch { setSaveError(true) }
  }, [session, awaitResume])
  const view = presentNode(nodeId, decisions)
  const node = view?.node
  const videos = LATEST_NODE_VIDEOS[nodeId] ?? []
  const resultBranch = nodeId === 'RESULT' ? branchForDecisions(decisions) : undefined
  const resultVideo = nodeId === 'RESULT' ? resultVideoForDecisions(decisions) : undefined
  const arrivalTitle = resultBranch ? `抵达办事地点 · ${resultBranch.completion}` : '抵达办事地点'
  const options = useMemo(() => node && isDecisionNode(node) ? visibleOptions(node, decisions) : [], [node, decisions])
  const setMediaDone = (value: boolean) => setSession(s => ({ ...s, mediaDone: value }))
  const setTransitionDone = (value: boolean) => setSession(s => ({ ...s, transitionDone: value }))
  const go = (nextNodeId: string, nextDecisions = decisions) => setSession(s => advanceSession(s, nextNodeId, nextDecisions))
  const continueNode = () => { const next = nextLatestNode(nodeId); if (next) go(next) }
  const choose = (option: FinalOption, reason: string) => {
    go(optionTarget(option), [...decisions, { nodeId, optionId: option.id, label: option.label, reason, recordedAt: new Date().toISOString() }])
  }
  const back = () => setSession(rewindSession)
  const newGame = () => { setSession(freshSession()); setAwaitResume(false) }
  const restart = () => {
    setSession(s => ({ ...freshSession(), explored: true, seenOutcome: s.seenOutcome,
      archives: [...s.archives, { id: s.attemptId, nodeId: s.nodeId, decisions: s.decisions, completed: s.nodeId === 'RESULT', savedAt: new Date().toISOString() }] }))
    setAwaitResume(false)
  }

  if (nodeId === 'launch' || awaitResume) return (
    <main className="latest-launch">
      <div className="latest-launch-shade" />
      <header className="latest-launch-header">
        <div className="latest-brand-lockup"><span className="latest-brand-mark">14</span><div><small>ALASKA FIELD OPERATION</small><strong>最后十四天</strong></div></div>
        <span>单人决策剧情 · 第一人称体验</span>
      </header>
      <section className="latest-launch-layout">
        <div className="latest-launch-copy">
          <span>你是勘探队长 · 机会窗口已经开始倒数</span>
          <h1><small>最后</small>十四天</h1>
          <p>在天气、伤势与期限之间做出选择。每次行动都会留下代价，并形成你的决策画像。</p>
          <div className="latest-launch-actions">
            {awaitResume ? <><button type="button" onClick={() => setAwaitResume(false)}>继续上次行动 <b>→</b></button><button type="button" onClick={newGame}>开始全新一局</button></>
              : <button type="button" onClick={() => go('INTRO')}>{session.explored ? '开始对照探索' : '开始行动'} <b>→</b></button>}
            <small>全程第一人称 · 四条行动路线 · 结局由选择决定</small>
          </div>
        </div>
        <aside className="latest-briefing-board" aria-label="行动简报">
          <header><span>行动简报</span><b>DAY 0 / 14</b></header>
          <dl>
            <div><dt>目标</dt><dd>在期限内返回并完成最后确认</dd></div>
            <div><dt>固定截止</dt><dd>Day 14 · 09:00</dd></div>
            <div><dt>当前限制</dt><dd>队长左手偶发失力</dd></div>
          </dl>
          <div className="latest-briefing-window"><span>行动窗口</span><div>{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div><small>机会、时间和人员状态不能同时最大化</small></div>
          <div className="latest-route-legend">{ROUTE_LEGEND.map(([code, label]) => <span key={code}><b>{code}</b>{label}</span>)}</div>
        </aside>
      </section>
      <footer className="latest-launch-footer"><span>队伍：沈岚 · 老周 · 阿杰</span><span>01 / 行动开始</span></footer>
    </main>
  )

  const timeTransition = nodeId === 'RESULT' ? resultBridge(decisions) : LATEST_TIME_TRANSITIONS[nodeId]
  if (timeTransition && !transitionDone) return <TimeTransition key={nodeId} {...timeTransition} onComplete={() => setTransitionDone(true)} />

  if (nodeId === 'INTRO') return (
    <main className="latest-shell latest-shell-video" data-route="PUBLIC">
      <MissionHeader nodeId="PROLOGUE" title="确认机会、期限与路线" route="PUBLIC" />
      <ProductionVideo clips={[LATEST_PUBLIC_VIDEO]} title="确认机会、期限与路线" onComplete={() => go('P06')} />
      <footer className="latest-footer"><button type="button" onClick={back}>← 返回</button><button type="button" onClick={() => go('P06')}>跳过公共段 →</button></footer>
    </main>
  )

  if (nodeId === 'RESULT' && resultVideo && !mediaDone) return (
    <main className="latest-shell latest-shell-video" data-route="SHARED">
      <MissionHeader nodeId="ARRIVAL" title={arrivalTitle} route="SHARED" />
      <ProductionVideo clips={[resultVideo]} title={arrivalTitle} onComplete={() => setMediaDone(true)} />
      <footer className="latest-footer"><button type="button" onClick={back}>← 返回上一步</button><button type="button" onClick={() => setMediaDone(true)}>跳过抵达镜头 →</button></footer>
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

  return (
    <main className="latest-shell" data-route={node.route}>
      <MissionHeader nodeId={node.id} title={node.title} route={node.route} />
      <ExpeditionHud time={node.time} location={node.location} route={node.route} condition={view?.condition ?? '左手需照护'} />
      <section className={`latest-stage${showChoice ? ' latest-stage-choice' : ''}`}>
        {showChoice ? <ChoiceStage key={`${session.attemptId}-${node.id}`} node={node} options={options} decisions={decisions} onSelect={choose} />
          : videos.length > 0 && !mediaDone ? <ProductionVideo key={nodeId} clips={videos} title={node.title} fallback={node.facts} onComplete={() => isDecisionNode(node) ? setMediaDone(true) : continueNode()} />
            : <FrameStage node={node} onContinue={continueNode} />}
      </section>
      <footer className="latest-footer">
        <button type="button" onClick={back}>← 返回上一步</button>
        <span>{saveError ? '进度暂时无法保存，请勿刷新。' : session.explored ? '对照探索 · 此前的选择已保留在复盘中' : decisions.length ? decisions.map((item) => item.label).join(' → ') : '机会、期限、路线、天气与伤手已经说明'}</span>
        {videos.length > 0 && !mediaDone && <button type="button" onClick={() => isDecisionNode(node) ? setMediaDone(true) : continueNode()}>跳过本段 →</button>}
      </footer>
    </main>
  )
}
