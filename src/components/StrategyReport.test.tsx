import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { replayDecisions } from '../demo/strategy'
import { StrategyReport } from './StrategyReport'

describe('StrategyReport', () => {
  it('renders the objective outcome, five dimensions, evidence, course replay, and reflection', () => {
    const progress = replayDecisions(['C', 'C3', 'X1-CAPABILITY', 'X2-STAGED-ALLIANCE', 'X3-JOINT-SUBMIT'])
    const html = renderToStaticMarkup(<StrategyReport progress={progress} decisions={[]} onRestart={() => undefined} />)

    expect(html).toContain('受限控制提交')
    expect(html).toContain('机会与速度')
    expect(html).toContain('风险与韧性')
    expect(html).toContain('支持证据')
    expect(html).toContain('反向证据')
    expect(html).toContain('知识点回放')
    expect(html).toContain('画像证据')
    expect(html).toContain('选择关联')
    expect(html).toContain('objective-state-bar')
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('如果只改变一个外部条件')
  })

  it('does not present an official profile before four valid decisions', () => {
    const progress = replayDecisions(['A', 'A2', 'X1-PEOPLE'])
    const html = renderToStaticMarkup(<StrategyReport progress={progress} decisions={[]} onRestart={() => undefined} />)

    expect(html).toContain('画像证据不足')
    expect(html).not.toContain('本轮主要倾向')
  })
})
