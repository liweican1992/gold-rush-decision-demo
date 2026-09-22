import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LatestDecision } from '../demo/latestStory'
import { LatestDecisionReport } from './LatestDecisionReport'
import { ResultStage } from './LatestStoryPlay'

const decisions: LatestDecision[] = [
  { nodeId: 'P06', optionId: 'P06-C', label: '先等天气信息' },
  { nodeId: 'C02', optionId: 'C2-1', label: '再等一天，拿到更完整的山路判断' },
  { nodeId: 'C03', optionId: 'C3-1', label: '按这份判断走山路' },
  { nodeId: 'C06', optionId: 'C6-3', label: '停止继续走高地，改走更低风险路线' },
]

describe('LatestDecisionReport', () => {
  it('renders a teaching debrief with observations, concepts, comparison and writable reflection', () => {
    const html = renderToStaticMarkup(<LatestDecisionReport decisions={decisions} onRestart={() => undefined} />)
    expect(html).toContain('战略管理学习复盘')
    expect(html).toContain('当时信息')
    expect(html).toContain('战略分析')
    expect(html).toContain('信息价值与等待成本')
    expect(html).toContain('本局证据')
    expect(html).toContain('换到企业中')
    expect(html).toContain('reflection-trigger')
    expect(html).toContain('reflection-transfer')
    expect(html).toContain('下载学习复盘')
    expect(html).not.toContain('progressbar')
    expect(html).not.toContain('画像置信度')
    expect(html).not.toContain('证据校准型')
    expect(html).not.toContain('C-06')
  })

  it('does not show route letters as a result badge or red failure status for safety waiting', () => {
    const path = [
      { nodeId: 'P06', optionId: 'P06-D', label: '等天气好转后安全返回' },
      { nodeId: 'D03', optionId: 'D3-1', label: '继续按安全等待的安排走' },
    ]
    const html = renderToStaticMarkup(<ResultStage decisions={path} onRestart={() => undefined} />)
    expect(html).not.toContain('D-01')
    expect(html).not.toContain('>D<')
    expect(html).not.toContain('D安全等待')
    expect(html).not.toContain('latest-result-seal')
    expect(html).not.toContain('latest-confirmation-closed')
    expect(html).toContain('约Day 40安全返回')
    expect(html).toContain('纪律还是惯性')
  })
})
