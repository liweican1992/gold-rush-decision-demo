import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ComponentType } from 'react'
import * as mainline from './MainlineDemo'
import type { StoryNode } from './demo/story'

type FooterProps = {
  nodeKind: StoryNode['kind']
  canGoBack: boolean
  onBack: () => void
  onSkip: () => void
}

const FooterActions = (mainline as typeof mainline & {
  DemoFooterActions?: ComponentType<FooterProps>
}).DemoFooterActions

function renderActions(nodeKind: StoryNode['kind']) {
  if (!FooterActions) return ''
  return renderToStaticMarkup(
    <FooterActions
      nodeKind={nodeKind}
      canGoBack
      onBack={() => undefined}
      onSkip={() => undefined}
    />,
  )
}

describe('mainline footer navigation', () => {
  it('exposes the shared footer action component', () => {
    expect(FooterActions).toBeTypeOf('function')
  })

  it('shows back and skip for videos', () => {
    const html = renderActions('video')
    expect(html).toContain('返回上一步')
    expect(html).toContain('跳过剧情')
    expect(html).not.toContain('直接看一级选择')
  })

  it('does not allow choice or report nodes to skip', () => {
    for (const kind of ['choice', 'report'] as const) {
      const html = renderActions(kind)
      expect(html).toContain('返回上一步')
      expect(html).not.toContain('跳过剧情')
      expect(html).not.toContain('直接看一级选择')
    }
  })
})
