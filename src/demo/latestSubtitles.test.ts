import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { LATEST_NODE_VIDEOS, LATEST_PUBLIC_VIDEO, LATEST_RESULT_VIDEOS } from './latestStory'
import {
  LATEST_SUBTITLE_TRACKS,
  activeLatestSubtitle,
  latestSubtitleTrack,
} from './latestSubtitles'

const allPlayableVideos = [
  LATEST_PUBLIC_VIDEO,
  ...Object.values(LATEST_NODE_VIDEOS).flat(),
  ...Object.values(LATEST_RESULT_VIDEOS),
]
const uniquePlayableVideos = [...new Set(allPlayableVideos)]

describe('当前成片中文字幕', () => {
  it('所有 30 条可播放成片都有字幕轨，包括纯环境声片段', () => {
    expect(uniquePlayableVideos).toHaveLength(30)
    expect(Object.keys(LATEST_SUBTITLE_TRACKS).sort()).toEqual(uniquePlayableVideos.sort())
  })

  it('每条时间轴均有序、不重叠、不越过视频时长', () => {
    for (const track of Object.values(LATEST_SUBTITLE_TRACKS)) {
      let previousEnd = 0
      for (const cue of track.cues) {
        expect(cue.text.trim()).not.toBe('')
        expect(cue.start).toBeGreaterThanOrEqual(previousEnd)
        expect(cue.end).toBeGreaterThan(cue.start)
        expect(cue.end).toBeLessThanOrEqual(track.duration)
        expect(cue.text).not.toMatch(/[，。！？；：、]$/)
        previousEnd = cue.end
      }
    }
  })

  it('每条成片都有可发布的 VTT，内容与校准时间轴一致', () => {
    for (const video of uniquePlayableVideos) {
      const track = latestSubtitleTrack(video)
      expect(track).toBeDefined()
      const path = fileURLToPath(new URL(`../../public${track!.src}`, import.meta.url))
      expect(existsSync(path), path).toBe(true)
      const vtt = readFileSync(path, 'utf8')
      expect(vtt.startsWith('WEBVTT\n')).toBe(true)
      for (const cue of track!.cues) expect(vtt).toContain(cue.text)
    }
  })

  it('网页覆盖字幕只在对应对白时间内出现', () => {
    const track = latestSubtitleTrack('/videos/latest/b-final-dawn.mp4')!
    expect(activeLatestSubtitle(track.cues, 3)).toBe('')
    expect(activeLatestSubtitle(track.cues, 4.4)).toBe('天亮前走')
    expect(activeLatestSubtitle(track.cues, 7.8)).toBe('谁撑不住，马上说')
    expect(activeLatestSubtitle(track.cues, 10)).toBe('')
  })

  it('视频切换到 CDN 域名后仍能按文件名匹配字幕', () => {
    const track = latestSubtitleTrack(
      'https://media.thu2026.online/gold-rush/videos/latest/b-final-dawn.mp4?version=20260922',
    )
    expect(track?.cues.some((cue) => cue.text === '天亮前走')).toBe(true)
    expect(track?.src).toBe('/subtitles/latest/b-final-dawn.vtt')
  })

  it('纯环境声片段保留空字幕轨，不伪造对白', () => {
    for (const video of [
      '/videos/latest/sh-town-day.mp4',
      '/videos/latest/sh-town-night.mp4',
      '/videos/latest/sh-valley-travel.mp4',
    ]) {
      expect(latestSubtitleTrack(video)?.cues).toEqual([])
    }
  })
})
