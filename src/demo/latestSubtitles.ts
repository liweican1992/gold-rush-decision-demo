import subtitleData from './latestSubtitles.json'

export type LatestSubtitleCue = {
  start: number
  end: number
  text: string
}

export type LatestSubtitleTrack = {
  duration: number
  cues: LatestSubtitleCue[]
  notes?: string
  src: string
}

type SubtitleSource = {
  duration: number
  cues: LatestSubtitleCue[]
  notes?: string
}

function videoPath(filename: string) {
  return `/videos/latest/${filename}`
}

function subtitlePath(filename: string) {
  return `/subtitles/latest/${filename.replace(/\.mp4$/i, '.vtt')}`
}

export const LATEST_SUBTITLE_TRACKS = Object.fromEntries(
  Object.entries(subtitleData.videos).map(([filename, source]) => [
    videoPath(filename),
    { ...(source as SubtitleSource), src: subtitlePath(filename) },
  ]),
) as Record<string, LatestSubtitleTrack>

export function latestSubtitleTrack(video: string) {
  const cleanPath = video.split(/[?#]/, 1)[0]
  const filename = cleanPath.split('/').at(-1)
  return filename ? LATEST_SUBTITLE_TRACKS[videoPath(filename)] : undefined
}

export function activeLatestSubtitle(cues: LatestSubtitleCue[], time: number) {
  return cues.find((cue) => time >= cue.start && time < cue.end)?.text ?? ''
}
