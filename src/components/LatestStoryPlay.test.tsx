import { describe, expect, it } from 'vitest'
import { dayFromTime } from './LatestStoryPlay'

describe('latest story day counter', () => {
  it('uses scene start for interval labels instead of future days', () => {
    expect(dayFromTime('Day 0—2')).toBe(0)
    expect(dayFromTime('约 Day 9—11')).toBe(9)
  })

  it('ignores clock digits when reading the day', () => {
    expect(dayFromTime('Day 3 · 09:00')).toBe(3)
    expect(dayFromTime('Day 14 · 18:00')).toBe(14)
  })
})
