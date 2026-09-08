import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StoryMapPage } from './StoryMapPage'

describe('story map page', () => {
  it('renders the 34 route-specific terminal paths instead of shared narrative endings', () => {
    const html = renderToStaticMarkup(<StoryMapPage />)

    expect(html).toContain('正式剧情树 v3.0')
    expect(html).toContain('34条独立因果结局')
    expect(html).toContain('旧版“所有路线')
    expect(html).toContain('已废弃')
    expect(html).toContain('A · 立即翻山')
    expect(html).toContain('D · 等待3–4周后安全撤离')
    expect((html.match(/data-finale-id=/g) ?? []).length).toBe(34)
    expect(html).not.toContain('状态分流模块')
    expect(html).not.toContain('可达 F')
  })

  it('offers all route filters and audited structural-node candidates', () => {
    const html = renderToStaticMarkup(<StoryMapPage />)

    for (const label of ['全部剧情', 'A 翻山', 'B 山谷', 'C 预报', 'D 撤离']) expect(html).toContain(label)
    expect(html).not.toContain('未绑定合格帧')
    expect((html.match(/data-main-node=/g) ?? []).length).toBe(18)
    expect(html).toContain('候选已绑定·未验收')
    expect(html).toContain('队伍获得雪地运输能力')
    expect(html).toContain('D2-1')
    expect(html).toContain('自动结果')
  })

  it('exposes the formal audit result and production gates for review', () => {
    const html = renderToStaticMarkup(<StoryMapPage />)

    expect(html).toContain('剧情验收总览')
    expect(html).toContain('34 / 34')
    expect(html).toContain('校验错误')
    expect(html).toContain('0 项')
    expect(html).toContain('结构节点候选已覆盖')
    expect(html).toContain('INTRO、PRIMARY、A0—D3 共18个结构节点')
    expect(html).toContain('27 / 34 条结局已有独立K03结果候选')
    expect(html).toContain('其余 7 条继续显示继承K01输入帧')
    expect(html).toContain('第4天 · 剩余10天')
    expect(html).toContain('原有土地购买机会进入公开竞争')
    expect(html).toContain('队伍接受报价')
    expect(html).toContain('重型设备永久留弃')
    expect(html).toContain('受潮造成的完整度损失无法消除')
    expect(html).toContain('有限样本仍会限制后续价值评估')
  })

  it('shows the ending story, final state and approximate profile on every finale card', () => {
    const html = renderToStaticMarkup(<StoryMapPage />)

    expect((html.match(/data-finale-frame=/g) ?? []).length).toBe(34)
    expect((html.match(/>独立K03结果帧待验收<\/span>/g) ?? []).length).toBe(27)
    expect((html.match(/K01输入帧待验收<\/span>/g) ?? []).length).toBe(7)
    for (const id of ['A1-1', 'B3-3', 'C3-2', 'D2-1']) expect(html).toContain(`data-finale-frame="${id}"`)
    expect((html.match(/story-map-finale-profile/g) ?? []).length).toBe(34)
    expect(html).toContain('第三次选择 → 结尾剧情 → 用户画像')
    expect(html).toContain('A2-3')
    expect(html).toContain('保持重装，按安全节奏前进')
    expect(html).toContain('抵达时登记窗口已经关闭')
    expect(html).toContain('当前机会终止')
    expect(html).toContain('用户画像倾向')
    expect(html).toContain('复盘重构型')
  })
})

 it('renders all card mains through the audited mapping and review copies separately', () => {
   const html = renderToStaticMarkup(<StoryMapPage />)
   expect((html.match(/data-main-node=/g) ?? []).length).toBe(18)
   for (const id of ['INTRO', 'PRIMARY', 'A0', 'A1', 'A2', 'A3', 'B0', 'C0', 'D0']) {
     expect(html).toContain(`data-main-node="${id}"`)
   }
   expect(html).not.toContain('本节点已有关键帧')
   expect(html).not.toContain('src="/images/choice-frames/outcome-A2.png"')
   expect(html).not.toContain('src="/images/choice-frames/choice-primary.webp"')
   expect(html).toContain('id="reuse-review"')
   expect(html).toContain('该校验不覆盖图片事实和声画连续性')
   expect(html).toContain('/images/choice-frames/review-only/')
 })
