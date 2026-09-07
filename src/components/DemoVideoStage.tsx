import { useEffect, useState, type ReactNode } from 'react'
import { findSubtitle, type SubtitleCue } from '../demo/subtitles'

type DemoVideoStageProps = {
  src: string
  badge: string
  onEnded: () => void
  onError: () => void
  subtitles?: SubtitleCue[]
  captionSrc?: string
  children?: ReactNode
  freezeAtEnd?: boolean
  freezeFrameSrc?: string
}

export function DemoVideoStage({
  src,
  badge,
  onEnded,
  onError,
  subtitles = [],
  captionSrc,
  children,
  freezeAtEnd = false,
  freezeFrameSrc,
}: DemoVideoStageProps) {
  const [videoError, setVideoError] = useState(false)
  const [freezeFrameError, setFreezeFrameError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const activeSubtitle = findSubtitle(subtitles, currentTime)

  useEffect(() => {
    setVideoError(false)
    setFreezeFrameError(false)
    setCurrentTime(0)
  }, [src, freezeAtEnd, freezeFrameSrc])

  const freezeOnLastFrame = (video: HTMLVideoElement) => {
    if (!freezeAtEnd || !Number.isFinite(video.duration)) return
    video.pause()
    video.currentTime = Math.max(0, video.duration - 1 / 24)
  }

  return (
    <section className="demo-video-stage">
      {freezeAtEnd && freezeFrameSrc && !freezeFrameError ? (
        <img
          className="demo-video-freeze-frame"
          src={freezeFrameSrc}
          alt=""
          aria-hidden="true"
          onError={() => setFreezeFrameError(true)}
        />
      ) : videoError ? (
        <div className={`demo-video-fallback${freezeAtEnd ? ' demo-video-fallback-plain' : ''}`} role="status">
          <span>VIDEO UNAVAILABLE</span>
          <strong>当前演示将继续</strong>
          <small>视频加载失败，已切换到可演示降级流程。</small>
        </div>
      ) : (
        <video
          aria-label={badge}
          autoPlay={!freezeAtEnd}
          key={`${src}-${freezeAtEnd ? 'frozen' : 'playing'}`}
          playsInline
          preload="auto"
          src={src}
          onLoadedMetadata={(event) => freezeOnLastFrame(event.currentTarget)}
          onSeeked={(event) => {
            if (freezeAtEnd) {
              event.currentTarget.pause()
              setCurrentTime(event.currentTarget.currentTime)
            }
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onEnded={onEnded}
          onError={() => {
            setVideoError(true)
            onError()
          }}
        >
          {captionSrc && <track kind="captions" src={captionSrc} srcLang="zh-CN" label="中文字幕" default />}
        </video>
      )}
      <div className="demo-video-badge"><i />{badge}</div>
      {activeSubtitle && !captionSrc && !videoError && (
        <div className="demo-subtitle" aria-live="off">
          <span>{activeSubtitle.text}</span>
        </div>
      )}
      {children}
    </section>
  )
}
