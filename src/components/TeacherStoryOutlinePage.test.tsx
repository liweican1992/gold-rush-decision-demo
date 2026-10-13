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
    expect(html).toContain('为什么不把它做成一道选择题？')
    expect(html).toContain('本案例最终呈现的底层知识点')
    expect(html).toContain('战略适配与动态调整')
    expect(html).toContain('目标与约束')
    expect(html).toContain('外部环境')
    expect(html).toContain('资源与能力')
    expect(html).toContain('信息分批出现')
    expect(html).toContain('报告引用本局证据')
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
