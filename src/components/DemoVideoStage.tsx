import { useEffect, useState, type ReactNode } from 'react'
import { findSubtitle, type SubtitleCue } from '../demo/subtitles'

type DemoVideoStageProps = {
  src: string
  badge: string
  onEnded: () => void
  onError: () => void
  subtitles?: SubtitleCue[]
  children?: ReactNode
  freezeAtEnd?: boolean
}

export function DemoVideoStage({ src, badge, onEnded, onError, subtitles = [], children, freezeAtEnd = false }: DemoVideoStageProps) {
  const [videoError, setVideoError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const activeSubtitle = findSubtitle(subtitles, currentTime)

  useEffect(() => {
    setVideoError(false)
    setCurrentTime(0)
  }, [src, freezeAtEnd])

  const freezeOnLastFrame = (video: HTMLVideoElement) => {
    if (!freezeAtEnd || !Number.isFinite(video.duration)) return
    video.pause()
    video.currentTime = Math.max(0, video.duration - 1 / 24)
  }

  return (
    <section className="demo-video-stage">
      {videoError ? (
        <div className="demo-video-fallback" role="status">
          <span>VIDEO UNAVAILABLE</span>
          <strong>当前演示将继续</strong>
          <small>视频加载失败，已切换到可演示降级流程。</small>
        </div>
      ) : (
        <video
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
        />
      )}
      <div className="demo-video-badge"><i />{badge}</div>
      {activeSubtitle && !videoError && (
        <div className="demo-subtitle" aria-live="off">
          <span>{activeSubtitle.text}</span>
        </div>
      )}
      {children}
    </section>
  )
}
