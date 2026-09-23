import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TeacherBriefingPage } from './TeacherBriefingPage'

describe('教师说明页入口', () => {
  it('从导航和首屏都能打开完整剧情与关键帧总览', () => {
    const html = renderToStaticMarkup(<TeacherBriefingPage />)

    expect(html.match(/href="\/docs\/story-map"/g)).toHaveLength(2)
    expect(html).toContain('剧情与关键帧总览')
    expect(html).toContain('查看完整剧情与关键帧')
  })
})
