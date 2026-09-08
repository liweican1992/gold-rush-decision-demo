import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { MainFrame, ReuseReview, ProcessMaterials, ReviewImage } from './KeyframeReuse'
import { data, getProcesses } from '../demo/keyframeReuse'
import type { Manifest } from '../demo/keyframeReuse.types'

describe('keyframe review displays', () => {
  it.each(['INTRO', 'PRIMARY', 'A0', 'A1', 'A2', 'A3', 'B0', 'C0', 'D0'])('removes the old %s main image without falling back', nodeId => {
    const html = renderToStaticMarkup(<MainFrame nodeId={nodeId} scene="正式状态" />)
    expect(html).toContain(`data-main-node="${nodeId}"`)
    expect(html).toContain('未绑定合格帧')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('本节点已有关键帧')
  })
  it('discloses audit limits, four dimensions, paths and all evidence', () => {
    const html = renderToStaticMarkup(<ReuseReview filter="ALL" />)
    expect(html).toContain('历史关键帧复用审查')
    expect(html).toContain('Pavo水印')
    expect(html).toContain('均非Pavo生产输入目录')
    expect(html).toContain('未验收')
    expect(html).toContain('样本/资料')
    expect(html).toContain('源SHA-256')
    expect(html).toContain('禁止用于该节点')
    expect((html.match(/data-review-asset=/g) ?? []).length).toBe(69)
    expect(html).not.toContain('本节点已有关键帧')
  })
  it.each(['A2', 'A3', 'B1', 'B3', 'C3', 'D1'])('does not embed rejected %s material in the process area', nodeId => {
    const html = renderToStaticMarkup(<ProcessMaterials nodeId={nodeId} />)
    expect(html).toContain('暂无通过过程展示初审的图片')
    expect(html).toContain('不代表本节点完成状态')
    expect(html).not.toContain('<img')
    expect(html).toContain('href="#reuse-review"')
    const allowed = new Set(getProcesses(nodeId, data).map(r => r.asset.id))
    for (const asset of data.assets.filter(a => !allowed.has(a.id))) expect(html).not.toContain(`data-process-asset="${asset.id}"`)
  })
  it('never loads an unverified source as a fallback', () => {
    const manifest: Manifest = { ...data, assets: data.assets.map(a => ({ ...a, copy: undefined })) }
    const html = renderToStaticMarkup(<ReuseReview filter="A" manifest={manifest} />)
    expect(html).toContain('未复制·仅清单')
    expect(html).not.toContain('<img')
  })
  it('shows error state without retrying a legacy URL', () => {
    const html = renderToStaticMarkup(<ReviewImage src="/images/choice-frames/review-only/test.png" alt="禁止用于该节点：A2越岭" failed />)
    expect(html).toContain('素材无法加载·仍未验收')
    expect(html).not.toContain('<img')
  })
  it('retains common assets but excludes unrelated routes from review', () => {
    const html = renderToStaticMarkup(<ReuseReview filter="B" />)
    expect(html).toContain('PRIMARY')
    expect(html).toContain('B1')
    expect(html).not.toContain('A2越岭')
    const a2 = data.assets.find(a => a.sourcePath.includes('山口下方整装'))!
    expect(html).not.toContain(`data-review-asset="${a2.id}"`)
  })
})
