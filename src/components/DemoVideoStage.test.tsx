import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DemoVideoStage } from './DemoVideoStage'

describe('DemoVideoStage frozen choice backdrop', () => {
  it('renders an exact extracted tail frame instead of seeking or showing the generic fallback', () => {
    const html = renderToStaticMarkup(
      <DemoVideoStage
        badge="公共开场 · 局面停留"
        src="/videos/web/intro.mp4"
        freezeAtEnd
        freezeFrameSrc="/images/choice-frames/choice-primary.webp"
        onEnded={() => undefined}
        onError={() => undefined}
      />,
    )

    expect(html).toContain('class="demo-video-freeze-frame"')
    expect(html).toContain('src="/images/choice-frames/choice-primary.webp"')
    expect(html).not.toContain('<video')
    expect(html).not.toContain('gold-rush-hero.jpg')
  })

  it('exposes an accessible video name and optional caption track', () => {
    const html = renderToStaticMarkup(
      <DemoVideoStage
        badge="X1 · 真实剧情"
        src="/videos/web/shared-x1-priority-v2.mp4"
        captionSrc="/subtitles/shared-x1-priority-v2.vtt"
        onEnded={() => undefined}
        onError={() => undefined}
      />,
    )

    expect(html).toContain('aria-label="X1 · 真实剧情"')
    expect(html).toContain('kind="captions"')
    expect(html).toContain('src="/subtitles/shared-x1-priority-v2.vtt"')
    expect(html).toContain('default=""')
  })
})
