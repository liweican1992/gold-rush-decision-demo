import { describe,it,expect } from 'vitest'
import { advance,sceneFor } from './textPlay'
import { enumeratePaths } from './reviewedStory'
describe('文字试玩',()=>{
  it('全部合法选择恰好覆盖现有84条结局，没有死路',()=>{
    const found:string[]=[]
    function walk(h:string[]){expect(h.length).toBeLessThan(20);const s=sceneFor(h);if(s.ending){found.push(s.ending.id);return}expect(s.choices.some(c=>!c.disabled)).toBe(true);for(const c of s.choices)if(!c.disabled)walk(advance(h,c.id))}
    walk([])
    expect(found.sort()).toEqual(enumeratePaths().map(p=>p.id).sort())
  })
  it('拒绝跳关和超预算，D2不提前给D3通行结果',()=>{
    expect(()=>advance([],'E:A2:S4')).toThrow()
    const h=['P','A','A1','R:A1','S:A1','I:A1:S1','X:A1:S1:I2']
    expect(()=>advance(h,'E:A1:S1:I2:X1')).toThrow()
    expect(sceneFor(['P','C']).text.join('')).not.toContain('九天')
    expect(sceneFor(['P','C']).text.join('')).not.toContain('没有封断')
  })
})
