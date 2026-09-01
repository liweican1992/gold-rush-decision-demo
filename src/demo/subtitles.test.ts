import { describe, expect, it } from 'vitest'
import { INTRO_SUBTITLES, findSubtitle } from './subtitles'

describe('intro subtitles', () => {
  it('keeps all dialogue cues ordered and non-overlapping', () => {
    expect(INTRO_SUBTITLES).toHaveLength(10)

    for (const [index, cue] of INTRO_SUBTITLES.entries()) {
      expect(cue.end).toBeGreaterThan(cue.start)
      if (index > 0) expect(cue.start).toBeGreaterThanOrEqual(INTRO_SUBTITLES[index - 1].end)
    }
  })

  it('finds the active cue and clears it between lines', () => {
    expect(findSubtitle(INTRO_SUBTITLES, 5)?.text).toBe('队长，化验结果出来了')
    expect(findSubtitle(INTRO_SUBTITLES, 9.5)?.text).toBe('高品位金矿。我们真的找到了')
    expect(findSubtitle(INTRO_SUBTITLES, 15)).toBeUndefined()
    expect(findSubtitle(INTRO_SUBTITLES, 65.8)).toBeUndefined()
  })

  it('uses the detected speech boundaries from the final audio track', () => {
    expect(INTRO_SUBTITLES.map(({ start, end }) => [start, end])).toEqual([
      [4.42, 7.0],
      [7.02, 10.0],
      [17.2, 20.02],
      [25.16, 26.82],
      [27.46, 30.4],
      [36.3, 39.72],
      [43.9, 47.68],
      [54.0, 55.18],
      [55.18, 58.66],
      [63.86, 65.66],
    ])
  })
})
