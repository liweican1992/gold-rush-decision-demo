import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReviewedStoryMapPage } from './ReviewedStoryMapPage'
import { FINAL_BRANCHES, FINAL_KEYFRAMES, FINAL_NODES, branchFrameSequences, validateFinalStoryMap } from '../demo/finalStoryMap'

describe('FINAL 全分支关键帧地图', () => {
  it('展示封版节点、18 条代表路径和 55 张 WebGPT 通过关键帧', () => {
    const html = renderToStaticMarkup(<ReviewedStoryMapPage />)

    expect(FINAL_NODES).toHaveLength(33)
    expect(FINAL_BRANCHES).toHaveLength(18)
    expect(FINAL_KEYFRAMES).toHaveLength(55)
    expect((html.match(/data-branch-id=/g) ?? []).length).toBe(18)
    expect((html.match(/data-keyframe-id=/g) ?? []).length).toBeGreaterThanOrEqual(55)
    expect(html).toContain('当前 FINAL 全分支与关键帧')
    expect(html).toContain('WebGPT 复审通过')
    expect(html).toContain('WebGPT 最终映射复核：PASS · 2026-09-14')
    expect(html).toContain('P02 单条低成本 Pavo 打样')
    expect(html).toContain('不授权批量生成或消耗 Pavo 积分')
  })

  it('每个剧情节点和每条代表路径都有可显示的关键帧', () => {
    for (const node of FINAL_NODES) expect(node.frameIds.length, node.id).toBeGreaterThan(0)
    for (const branch of FINAL_BRANCHES) expect(branch.frameIds.length, branch.id).toBeGreaterThan(0)
    expect(validateFinalStoryMap()).toEqual([])
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
