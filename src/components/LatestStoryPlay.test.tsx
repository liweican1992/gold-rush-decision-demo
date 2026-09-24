import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { dayFromTime, LatestStoryPlay, ProductionVideo } from './LatestStoryPlay'
import { advanceSession, freshSession } from '../demo/storySession'

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

describe('opening briefing', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('keeps the resume entry for an unfinished briefing', () => {
    const session = advanceSession(freshSession(), 'INTRO')
    vi.stubGlobal('window', { localStorage: { getItem: () => JSON.stringify(session) } })
    const html = renderToStaticMarkup(<LatestStoryPlay />)
    expect(html).toContain('继续上次行动')
    expect(html).not.toContain('<video')
  })

  it('highlights automatic full-pack download before the opening-video status', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => null } })
    const html = renderToStaticMarkup(<LatestStoryPlay />)
    expect(html).toContain('首次进入此页会自动下载并缓存到当前浏览器')
    expect(html).toContain('未下载完成时点击开始会先提示')
    expect(html.indexOf('下载完整视频资源包')).toBeLessThan(html.indexOf('开场剧情视频'))
    expect(html).toContain('33')
  })
})

describe('video captions', () => {
  it('does not give Safari a native caption track when the page renders captions itself', () => {
    const html = renderToStaticMarkup(
      <ProductionVideo clips={['/videos/latest/public-intro.mp4']} title="开场" onComplete={() => {}} />,
    )
    expect(html).toContain('<video')
    expect(html).not.toContain('<track')
  })
})
