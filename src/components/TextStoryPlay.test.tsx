import {renderToStaticMarkup} from 'react-dom/server'
import {it,expect} from 'vitest'
import {TextStoryPlay} from './TextStoryPlay'
it('开场不显示未来结局、知识点或视频',()=>{const html=renderToStaticMarkup(<TextStoryPlay/>);expect(html).toContain('发现之后，只剩十四天');expect(html).not.toContain('<video');expect(html).not.toContain('完成本轮原范围评估');expect(html).not.toContain('沉没成本')})
