import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StoryVideoPlaceholder } from './StoryVideoPlaceholder'

describe('StoryVideoPlaceholder', () => {
  it('keeps a missing video node demonstrable with its synopsis and continue action', () => {
    const html = renderToStaticMarkup(
      <StoryVideoPlaceholder
        nodeId="A0"
        title="山脊第三天：风暴提前"
        synopsis="横向暴雪提前抵达。"
        expectedVideo="/videos/demo/route-a-situation.mp4"
        onContinue={() => undefined}
      />,
    )
    expect(html).toContain('山脊第三天：风暴提前')
    expect(html).toContain('横向暴雪提前抵达。')
    expect(html).toContain('继续决策')
    expect(html).not.toContain('route-a-situation.mp4')
  })
})
