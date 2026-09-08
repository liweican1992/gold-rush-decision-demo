import raw from './keyframeReuseManifest.json'
import { REDESIGNED_STORY } from './redesignedStory'
import { STAGES, CHECKS, JUDGMENTS, REPAIRS, ACCEPTANCES, type Asset, type Usage, type Manifest, type Placement } from './keyframeReuse.types'

const common = new Set<string>(REDESIGNED_STORY.common.map(n => n.id))
const decisions = new Set<string>(REDESIGNED_STORY.routes.flatMap(r => [r.situation.id, ...r.outcomes.map(n => n.id)]))
const endings = new Set<string>(REDESIGNED_STORY.routes.flatMap(r => r.outcomes.flatMap(n => n.finales.map(f => f.id))))
const hash = /^[a-f0-9]{64}$/
const targetPattern = /^public\/images\/choice-frames\/(legacy-candidates|review-only)\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/
const sourceAllowed = (path: string) => !path.split('/').some(part => part === '..' || part === '.') &&
  (/^public\/images\/choice-frames\/[^/]+\.(png|webp)$/i.test(path) || /^短剧制作资料\/09_路线制作包\/.+\.(png|jpe?g|webp)$/i.test(path) || /^短剧制作资料\/17_正式Pavo制作包_v3\.0\/.+\/关键帧\/[^/]+\.(png|jpe?g|webp)$/i.test(path))

export function stageCompatible(u: Usage) {
  if (common.has(u.nodeId)) return u.stage === '公共入口'
  if (endings.has(u.nodeId)) return u.stage === '独立终局'
  if (decisions.has(u.nodeId)) return ['节点决策状态', '直接后果'].includes(u.stage)
  return false
}

/** Structural checks do not certify visual facts. Unknown/pending remains review-only. */
export function validateManifest(value: unknown): Manifest {
  const fail = (why: string): never => { throw new Error(`Invalid keyframe manifest: ${why}`) }
  if (!value || typeof value !== 'object') fail('object required')
  const m = value as Manifest
  if (m.version !== 1 || !Array.isArray(m.assets) || !Array.isArray(m.usages)) fail('version or arrays')
  const ids = new Set<string>(), sources = new Set<string>(), targets = new Set<string>(), uses = new Set<string>(), mains = new Set<string>()
  for (const a of m.assets) {
    if (!a || !a.id || ids.has(a.id) || sources.has(a.sourcePath)) fail('duplicate asset/source')
    ids.add(a.id); sources.add(a.sourcePath)
    if (a.version !== 1 || !hash.test(a.sourceSha256) || !sourceAllowed(a.sourcePath)) fail(`source ${a.id}`)
    if (!['none', 'pavo', 'unknown'].includes(a.watermark) || !['target-image', 'video-frame', 'legacy-image'].includes(a.origin)) fail(`asset enum ${a.id}`)
    if (a.plannedTargetPath) {
      if (!targetPattern.test(a.plannedTargetPath) || targets.has(a.plannedTargetPath)) fail('target plan')
      targets.add(a.plannedTargetPath)
    }
    if (a.copy && (a.copy.targetPath !== a.plannedTargetPath || !hash.test(a.copy.targetSha256) || typeof a.copy.verified !== 'boolean')) fail('copy evidence')
  }
  for (const u of m.usages) {
    if (!u || !u.id || uses.has(u.id) || !ids.has(u.assetId)) fail('usage id/reference')
    uses.add(u.id)
    if (!STAGES.includes(u.stage) || !JUDGMENTS.includes(u.judgment) || !REPAIRS.includes(u.repair) || !ACCEPTANCES.includes(u.acceptance)) fail('usage enum')
    if (!['main', 'process', 'review'].includes(u.placement) || typeof u.stageMatchesNode !== 'boolean' || !u.nodeId || !u.shotId || !u.action?.trim()) fail('usage fields')
    if (!Array.isArray(u.continuityIssues) || !Array.isArray(u.conflicts) || ![...u.continuityIssues, ...u.conflicts].every(s => typeof s === 'string')) fail('issues')
    if (!CHECKS.every(k => u.checks?.[k] && ['visible', 'external', 'pending', 'conflict'].includes(u.checks[k].result) && typeof u.checks[k].evidence === 'string')) fail('eight checks')
    if (u.acceptance !== '未验收') fail('this static-image batch has no production acceptance')
    if (u.placement === 'main') {
      if (mains.has(u.nodeId) || !stageCompatible(u)) fail('main binding/stage')
      mains.add(u.nodeId)
    }
  }
  return m
}
export const data = validateManifest(raw)

export function canShow(a: Asset, u: Usage, p: Placement): boolean {
  if (u.assetId !== a.id || !a.copy?.verified || !hash.test(a.sourceSha256) || a.copy.targetSha256 !== a.sourceSha256 || a.copy.targetPath !== a.plannedTargetPath || !targetPattern.test(a.copy.targetPath)) return false
  if (p === 'review') return true
  if (u.placement !== p || a.watermark !== 'none' || u.judgment === '禁止用于该节点') return false
  if (!a.copy.targetPath.startsWith('public/images/choice-frames/legacy-candidates/')) return false
  if (u.repair !== '无需修复待验' || u.continuityIssues.length || u.conflicts.length) return false
  if (!CHECKS.every(k => ['visible', 'external'].includes(u.checks[k]?.result) && u.checks[k]?.evidence.trim())) return false
  if (p === 'process') return decisions.has(u.nodeId) && ['行动开始', '行动过程'].includes(u.stage)
  return u.judgment === '候选待审' && u.stageMatchesNode && stageCompatible(u)
}
function rows(nodeId: string, m: Manifest, placement: Placement) {
  return m.usages.flatMap(usage => {
    const asset = m.assets.find(a => a.id === usage.assetId)
    return usage.nodeId === nodeId && asset && canShow(asset, usage, placement) ? [{ asset, usage }] : []
  })
}
export function getMain(nodeId: string, m: Manifest) {
  const matches = rows(nodeId, m, 'main')
  return matches.length === 1 ? matches[0] : undefined
}
export const getProcesses = (nodeId: string, m: Manifest) => rows(nodeId, m, 'process')
export function getReviewAssets(filter: string, m: Manifest) {
  const ids = new Set(m.usages.filter(u => filter === 'ALL' || common.has(u.nodeId) || u.nodeId.startsWith(filter)).map(u => u.assetId))
  return m.assets.filter(a => ids.has(a.id))
}
