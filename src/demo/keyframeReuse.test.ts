import { describe, it, expect } from 'vitest'
import { canShow, getMain, getProcesses, getReviewAssets, validateManifest, data } from './keyframeReuse'
import { CHECKS, STAGES, type Asset, type Usage } from './keyframeReuse.types'

const a: Asset = { id: 'test', version: 1, sourcePath: 'public/images/choice-frames/test.png', sourceSha256: 'a'.repeat(64), origin: 'legacy-image', watermark: 'none', plannedTargetPath: 'public/images/choice-frames/legacy-candidates/test.png', copy: { targetPath: 'public/images/choice-frames/legacy-candidates/test.png', targetSha256: 'a'.repeat(64), verified: true } }
const u: Usage = { id: 'use', assetId: 'test', nodeId: 'D1', shotId: 'decision', stage: '节点决策状态', action: '等待结束后的撤收准备', judgment: '候选待审', repair: '无需修复待验', acceptance: '未验收', checks: Object.fromEntries(CHECKS.map(k => [k, { result: 'external', evidence: `D1 正式 facts：${k}（测试夹具）` }])) as Usage['checks'], continuityIssues: [], conflicts: [], stageMatchesNode: true, placement: 'main' }
const m = { version: 1 as const, assets: [a], usages: [u] }
describe('keyframe eligibility', () => {
  it('allows a D1 decision candidate without production acceptance', () => {
    expect(canShow(a, u, 'main')).toBe(true)
    expect(getMain('D1', m)?.usage.acceptance).toBe('未验收')
  })
  it.each(['pavo', 'unknown'] as const)('restricts %s watermark to review', watermark => {
    const asset = { ...a, watermark }
    expect(canShow(asset, u, 'main')).toBe(false)
    expect(canShow(asset, { ...u, placement: 'process', stage: '行动过程' }, 'process')).toBe(false)
    expect(canShow(asset, u, 'review')).toBe(true)
  })
  it.each(CHECKS)('blocks unresolved %s and blank external evidence', key => {
    for (const result of ['pending', 'conflict', 'external'] as const) {
      const usage = { ...u, checks: { ...u.checks, [key]: { result, evidence: '' } } }
      expect(canShow(a, usage, 'main')).toBe(false)
      expect(canShow(a, { ...usage, placement: 'process', stage: '行动过程' }, 'process')).toBe(false)
    }
  })
  it('blocks repairs, continuity issues, conflicts and forbidden usages', () => {
    for (const patch of [{ repair: '可裁切待复核' }, { continuityIssues: ['左手服装不一致'] }, { conflicts: ['同岸'] }, { judgment: '禁止用于该节点' }]) {
      expect(canShow(a, { ...u, ...patch } as Usage, 'main')).toBe(false)
    }
  })
  it('keeps process, main and independent usages separate', () => {
    const process: Usage = { ...u, id: 'process', nodeId: 'A2', stage: '行动开始', judgment: '仅作参考', placement: 'process', stageMatchesNode: false }
    const denied: Usage = { ...u, id: 'denied', nodeId: 'A2', judgment: '禁止用于该节点' }
    const manifest = { ...m, usages: [process, denied] }
    expect(getProcesses('A2', manifest)).toHaveLength(1)
    expect(getMain('A2', manifest)).toBeUndefined()
    expect(canShow(a, process, 'main')).toBe(false)
  })
  it('requires verified matching hashes, exact target plan and approved directory', () => {
    for (const asset of [{ ...a, copy: undefined }, { ...a, copy: { ...a.copy!, verified: false } }, { ...a, copy: { ...a.copy!, targetSha256: 'b'.repeat(64) } }, { ...a, copy: { ...a.copy!, targetPath: 'public/images/choice-frames/review-only/test.png' } }]) {
      expect(canShow(asset, u, 'main')).toBe(false)
    }
  })
  it('fails closed for duplicate main bindings and unknown nodes', () => {
    expect(getMain('D1', { ...m, usages: [u, { ...u, id: 'duplicate' }] })).toBeUndefined()
    expect(canShow(a, { ...u, nodeId: 'X1' }, 'main')).toBe(false)
    expect(canShow(a, { ...u, nodeId: 'A2-99', stage: '独立终局' }, 'main')).toBe(false)
    expect(canShow(a, { ...u, nodeId: 'INTRO', stage: '直接后果' }, 'main')).toBe(false)
  })
  it('rejects malformed data instead of hiding it', () => {
    expect(() => validateManifest({ ...m, usages: [{ ...u, stage: '整装' }] })).toThrow()
    expect(() => validateManifest({ ...m, assets: [a, a] })).toThrow()
    expect(() => validateManifest({ ...m, usages: [{ ...u, assetId: 'missing' }] })).toThrow()
    expect(() => validateManifest({ ...m, usages: [{ ...u, checks: {} }] })).toThrow()
  })
  it('registers every batch file conservatively with the exact six stages', () => {
    expect(STAGES).toEqual(['公共入口', '节点决策状态', '行动开始', '行动过程', '直接后果', '独立终局'])
    expect(data.assets).toHaveLength(121)
    expect(data.usages.every(row => row.acceptance === '未验收')).toBe(true)
    expect(data.usages.filter(row => row.placement === 'main').map(row => row.nodeId).sort()).toEqual(['A0', 'A1', 'A1-1', 'A1-2', 'A1-3', 'A2', 'A2-1', 'A2-2', 'A2-3', 'A3', 'A3-1', 'A3-2', 'A3-3', 'B0', 'B1', 'B1-1', 'B1-2', 'B1-3', 'B2', 'B2-1', 'B2-2', 'B2-3', 'B3', 'B3-1', 'B3-2', 'B3-3', 'C0', 'C1', 'C1-1', 'C1-2', 'C1-3', 'C2', 'C2-1', 'C2-2', 'C2-3', 'C3', 'C3-1', 'C3-2', 'C3-3', 'D0', 'D1', 'D1-1', 'D1-2', 'D1-3', 'D2', 'D2-1', 'D3', 'D3-1', 'D3-2', 'D3-3', 'INTRO', 'PRIMARY'])
    expect(getMain('INTRO', data)?.asset.id).toBe('generated-intro-k03-v1')
    expect(getMain('PRIMARY', data)?.asset.id).toBe('generated-primary-k03-v1')
    expect(getMain('A0', data)?.asset.id).toBe('reused-a0-k03-v1')
    expect(getMain('A1', data)?.asset.id).toBe('generated-a1-k03-v1')
    expect(getMain('A2', data)?.asset.id).toBe('generated-a2-k03-v1')
    expect(getMain('A3', data)?.asset.id).toBe('generated-a3-k03-v1')
    for (const id of ['A1-1', 'A1-2', 'A1-3', 'A2-1', 'A2-2', 'A2-3', 'A3-1', 'A3-2', 'A3-3']) {
      expect(getMain(id, data)?.asset.id).toBe(`generated-${id.toLowerCase()}-k03-v1`)
      expect(getMain(id, data)?.usage.stage).toBe('独立终局')
      expect(getMain(id, data)?.usage.acceptance).toBe('未验收')
    }
    expect(getMain('B0', data)?.asset.id).toBe('generated-b0-k03-v1')
    expect(getMain('B1', data)?.asset.id).toBe('generated-b1-k03-v1')
    expect(getMain('B2', data)?.asset.id).toBe('generated-b2-k03-v1')
    expect(getMain('B3', data)?.asset.id).toBe('generated-b3-k03-v1')
    for (const id of ['B1-1', 'B1-2', 'B1-3', 'B2-1', 'B2-2', 'B2-3', 'B3-1', 'B3-2', 'B3-3']) {
      expect(getMain(id, data)?.asset.id).toBe(`generated-${id.toLowerCase()}-k03-v1`)
      expect(getMain(id, data)?.usage.stage).toBe('独立终局')
      expect(getMain(id, data)?.usage.acceptance).toBe('未验收')
    }
    expect(getMain('C0', data)?.asset.id).toBe('generated-c0-k03-v1')
    expect(getMain('C1', data)?.asset.id).toBe('generated-c1-k03-v1')
    expect(getMain('C2', data)?.asset.id).toBe('generated-c2-k03-v1')
    expect(getMain('C3', data)?.asset.id).toBe('generated-c3-k03-v1')
    for (const id of ['C1-1', 'C1-2', 'C1-3', 'C2-1', 'C2-2', 'C2-3', 'C3-1', 'C3-2', 'C3-3']) {
      expect(getMain(id, data)?.asset.id).toBe(`generated-${id.toLowerCase()}-k03-v1`)
      expect(getMain(id, data)?.usage.stage).toBe('独立终局')
      expect(getMain(id, data)?.usage.acceptance).toBe('未验收')
    }
    expect(getMain('D0', data)?.asset.id).toBe('generated-d0-k03-v1')
    expect(getMain('D1', data)?.asset.id).toBe('legacy-c6e8059a5ca2')
    expect(getMain('D2', data)?.asset.id).toBe('generated-d2-k03-v1')
    expect(getMain('D3', data)?.asset.id).toBe('generated-d3-k03-v1')
    for (const id of ['D1-1', 'D1-2', 'D1-3', 'D2-1', 'D3-1', 'D3-2', 'D3-3']) {
      expect(getMain(id, data)?.asset.id).toBe(`generated-${id.toLowerCase()}-k03-v1`)
      expect(getMain(id, data)?.usage.stage).toBe('独立终局')
      expect(getMain(id, data)?.usage.acceptance).toBe('未验收')
    }
    expect(data.assets.every(row => /^[a-f0-9]{64}$/.test(row.sourceSha256))).toBe(true)
    const departure = data.assets.find(row => row.sourcePath.includes('山口下方整装'))!
    expect(data.usages.filter(row => row.assetId === departure.id).map(row => row.judgment)).toEqual(['仅作参考', '禁止用于该节点'])
    const crossed = data.assets.find(row => row.sourcePath.endsWith('outcome-A2.png'))!
    expect(data.usages.filter(row => row.assetId === crossed.id).every(row => row.judgment === '禁止用于该节点')).toBe(true)
    expect(getMain('A2', data)?.asset.id).toBe('generated-a2-k03-v1')
  })
  it('filters assets without duplicating them and retains common references', () => {
    const rows = getReviewAssets('B', data)
    expect(new Set(rows.map(row => row.id)).size).toBe(rows.length)
    expect(rows.some(row => row.sourcePath.endsWith('choice-primary.webp'))).toBe(true)
    expect(rows.some(row => row.sourcePath.includes('choice-X'))).toBe(false)
    expect(rows.some(row => row.sourcePath.includes('/A2_'))).toBe(false)
  })
})

it('does not infer target-frame actions or elapsed time from an input-frame directory', () => {
  for (const asset of data.assets.filter(a => a.sourcePath.includes('01_输入首帧_承接真实尾帧'))) {
    for (const usage of data.usages.filter(u => u.assetId === asset.id)) {
      expect(usage.action).toContain('承接上一镜')
      expect(usage.action).toContain('待核实')
      expect(usage.action).not.toMatch(/撤收准备|握手|出售/)
      expect(usage.conflicts).toEqual([])
      expect(usage.stageMatchesNode).toBe(false)
      expect(usage.placement).toBe('review')
    }
  }
})
