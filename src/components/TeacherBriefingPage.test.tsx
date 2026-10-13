import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TeacherBriefingPage } from './TeacherBriefingPage'

describe('教师说明页入口', () => {
  it('优先打开教师故事大纲，同时保留完整制作资料入口', () => {
    const html = renderToStaticMarkup(<TeacherBriefingPage />)

    expect(html.match(/href="\/docs\/story-outline"/g)).toHaveLength(2)
    expect(html.match(/href="\/docs\/story-map"/g)).toHaveLength(1)
    expect(html).toContain('故事大纲')
    expect(html).toContain('完整制作资料')
  })
})
