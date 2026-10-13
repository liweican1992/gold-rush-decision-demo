import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TeacherStoryOutlinePage } from './TeacherStoryOutlinePage'

describe('教师故事大纲', () => {
  it('用一页说明共同情境、四条路线、三类结局和课程关联', () => {
    const html = renderToStaticMarkup(<TeacherStoryOutlinePage />)

    expect(html).toContain('《最后十四天》故事大纲')
    expect(html).toContain('学生每局只会经历其中一条路线')
    expect(html).toContain('<b>1</b>个共同情境')
    expect(html).toContain('<b>4</b>条可选路线')
    expect(html).toContain('<b>2–4</b>次关键选择')
    expect(html).toContain('<b>3</b>类客观结局')
    for (const route of ['立即翻山', '走山谷', '先等天气信息', '优先安全']) expect(html).toContain(route)
    for (const outcome of ['按期完成确认', '超期抵达，进入重新拍卖', '主动放弃，安全返回']) expect(html).toContain(outcome)
    for (const concept of ['目标与约束', '信息价值', '战略一致性与动态调整', '沉没成本与退出边界']) expect(html).toContain(concept)
    for (const routeConcept of ['环境、资源与能力匹配', '里程碑与调整时机', '等待成本与机会成本', '目标层级与价值排序']) expect(html).toContain(routeConcept)
    expect((html.match(/放到企业中：/g) ?? []).length).toBe(12)
    expect(html).toContain('为什么它不是“选对得奖、选错受罚”的分支树？')
    expect(html).toContain('世界不因为玩家选了什么而改变事实')
    expect(html).toContain('不是奖惩机制，而是因果机制')
    for (const design of ['先兑现选择的价值', '代价来自共同约束', '场景汇合，历史不清零', '同一动作会因时机改变', '信息有价值，却不是答案', '按当时依据复盘']) expect(html).toContain(design)
    for (const step of ['观察', '判断', '承诺', '执行', '即时反馈', '延迟回响', '再判断']) expect(html).toContain(step)
    expect(html).toContain('本案例最终呈现的底层知识点')
    expect(html).toContain('战略适配与动态调整')
    expect(html).toContain('目标与约束')
    expect(html).toContain('外部环境')
    expect(html).toContain('资源与能力')
    expect(html).toContain('Day 6 提速和 Day 9 提速不是同一笔成本')
    expect(html).toContain('href="/docs/story-map"')
    expect(html).toContain('完整节点、选择去向与关键帧仍保留在原页面')
  })

  it('不把制作节点数、关键帧数和内部编号当作教师主叙事', () => {
    const html = renderToStaticMarkup(<TeacherStoryOutlinePage />)

    expect(html).not.toContain('33个剧情结构节点')
    expect(html).not.toContain('55张剧情关键帧')
    expect(html).not.toMatch(/P01|C04V|D02|X01|R01/)
  })
})
