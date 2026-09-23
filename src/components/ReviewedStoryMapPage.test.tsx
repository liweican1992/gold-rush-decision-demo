import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReviewedStoryMapPage } from './ReviewedStoryMapPage'
import { FINAL_BRANCHES, FINAL_KEYFRAMES, FINAL_NODES, branchFrameSequences, validateFinalStoryMap } from '../demo/finalStoryMap'

describe('教师用剧情与关键帧总览', () => {
  it('展示全量节点、代表路径和关键帧，并使用教师可读的说明', () => {
    const html = renderToStaticMarkup(<ReviewedStoryMapPage />)

    expect(FINAL_NODES).toHaveLength(33)
    expect(FINAL_BRANCHES).toHaveLength(18)
    expect(FINAL_KEYFRAMES).toHaveLength(55)
    expect(FINAL_NODES.reduce((total, node) => total + (node.options?.length ?? 0), 0)).toBe(28)
    expect((html.match(/data-branch-id=/g) ?? []).length).toBe(18)
    expect((html.match(/data-keyframe-id=/g) ?? []).length).toBeGreaterThanOrEqual(55)
    expect(html).toContain('《最后十四天》剧情与关键帧总览')
    expect(html).toContain('<b>28</b>决策选项')
    expect(html).toContain('剧情结构检查通过')
    expect(html).toContain('课堂观察')
    expect(html).toContain('关键帧图库')
    expect(html).toContain('href="/teacher"')
    expect(html).not.toMatch(/WebGPT|Pavo/)
  })

  it('每个剧情节点和每条代表路径都有可显示的关键帧', () => {
    for (const node of FINAL_NODES) expect(node.frameIds.length, node.id).toBeGreaterThan(0)
    for (const branch of FINAL_BRANCHES) expect(branch.frameIds.length, branch.id).toBeGreaterThan(0)
    expect(validateFinalStoryMap()).toEqual([])
  })

  it('跟随实际游玩中的条件节点、选项去向、决策文案和场景背景', () => {
    const html = renderToStaticMarkup(<ReviewedStoryMapPage />)

    for (const id of ['A4FB1', 'A4FB2', 'A4FB3', 'B4FBDAWN', 'B4FBREST', 'C2FB1', 'C2FB2', 'C04VA', 'C6FB2', 'C04VB', 'D5FB1', 'D5FB2']) {
      expect(html, `runtime node ${id}`).toContain(`data-node-id="${id}"`)
    }
    expect(html).toContain('href="#node-A4FB1"')
    expect(html).toContain('href="#node-C04VA"')
    expect(html).toContain('你准备怎么行动？')
    expect(html).toContain('安全返回，原窗口已失去')
    expect(html).toContain('/images/decision-stills/A04-continue.webp')
    expect(html).toContain('/images/decision-stills/B04-steady.webp')
  })

  it('只绑定返修后的 A 线和城镇夜景版本', () => {
    const sources = FINAL_KEYFRAMES.map((frame) => frame.src).join('\n')
    expect(sources).not.toMatch(/A路线.*target_v01/)
    expect(sources).toContain('SH-TOWN-NIGHT_夜间抵达同一地点_target_v03.png')
    expect(sources).not.toContain('SH-TOWN-NIGHT_夜间抵达同一地点_target_v01.png')
    expect(sources).not.toContain('SH-TOWN-NIGHT_夜间抵达同一地点_target_v02.png')
  })

  it('A 线暂避和撤回路径保留伤手共同事实，且 A-05 不串联互斥撤回时点', () => {
    for (const branch of FINAL_BRANCHES.filter((item) => item.route === 'A')) {
      for (const sequence of branchFrameSequences(branch)) {
        expect(sequence.frameIds.indexOf('A02B'), `${branch.id} ${sequence.label}`).toBeGreaterThan(sequence.frameIds.indexOf('A02A'))
        expect(sequence.frameIds.indexOf('A02B'), `${branch.id} ${sequence.label}`).toBeLessThan(sequence.frameIds.indexOf('A02C'))
      }
    }

    const withdrawal = FINAL_BRANCHES.find((item) => item.id === 'A-05')! as typeof FINAL_BRANCHES[number] & {
      frameVariants?: Array<{ label: string; frameIds: string[] }>
    }
    expect(withdrawal.frameVariants).toHaveLength(2)
    for (const variant of withdrawal.frameVariants ?? []) {
      const fullSequence = [...withdrawal.frameIds, ...variant.frameIds]
      expect(fullSequence, variant.label).toContain('A02B')
      expect(fullSequence.includes('A03R-D3') && fullSequence.includes('A03R-D5'), variant.label).toBe(false)
    }

    const html = renderToStaticMarkup(<ReviewedStoryMapPage />)
    expect(html).toContain('Day 3直接撤回')
    expect(html).toContain('到A04后晚撤回')
    expect((html.match(/data-branch-id=/g) ?? []).length).toBe(18)
  })
})
