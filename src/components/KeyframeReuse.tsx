import { useState } from 'react'
import { canShow, data, getMain, getProcesses, getReviewAssets } from '../demo/keyframeReuse'
import { CHECKS, type Manifest, type Usage } from '../demo/keyframeReuse.types'

const imageUrl = (path: string) => path.replace(/^public/, '')
function usageDisplay(u: Usage, manifest: Manifest) {
  if (getMain(u.nodeId, manifest)?.usage.id === u.id) return { label: '候选已绑定·未验收', binding: '节点主图' }
  if (getProcesses(u.nodeId, manifest).some(row => row.usage.id === u.id)) return { label: '过程素材·仅参考', binding: '过程素材区' }
  return { label: u.judgment === '候选待审' ? '候选待审·未绑定' : u.judgment, binding: '仅审查·未绑定' }
}

export function ReviewImage({ src, alt, failed = false, onFailed }: { src: string; alt: string; failed?: boolean; onFailed?: () => void }) {
  return failed ? <p role="status">素材无法加载·仍未验收：{alt}</p> :
    <img src={src} alt={alt} loading="lazy" onError={onFailed} />
}
function SafeImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return <ReviewImage src={src} alt={alt} failed={failed} onFailed={() => setFailed(true)} />
}
export function MainFrame({ nodeId, scene, manifest = data }: { nodeId: string; scene: string; manifest?: Manifest }) {
  const row = getMain(nodeId, manifest)
  const [failed, setFailed] = useState(false)
  const hasLegacy = manifest.usages.some(u => u.nodeId === nodeId)
  return <div data-main-node={nodeId} className="reuse-main">
    {row && !failed ? <>
      <img className="story-map-frame" src={imageUrl(row.asset.copy!.targetPath)}
        alt={`${nodeId} ${row.usage.stage}：候选已绑定·未验收；${row.usage.action}`}
        onError={() => setFailed(true)} />
      <span className="reuse-candidate">候选已绑定·未验收</span>
    </> : <div className="story-map-frame story-map-frame-missing">
      <strong>{failed ? '素材无法加载·仍未验收' : '未绑定合格帧'}</strong>
      <span>{hasLegacy ? '有旧素材待审' : '暂无已登记旧素材'}</span><span>{scene}</span>
    </div>}
  </div>
}
export function InheritedInputFrame({ nodeId, parentNodeId, scene, manifest = data }: { nodeId: string; parentNodeId: string; scene: string; manifest?: Manifest }) {
  const independent = getMain(nodeId, manifest)
  const row = independent ?? getMain(parentNodeId, manifest)
  const [failed, setFailed] = useState(false)
  return <div data-finale-frame={nodeId} className={`reuse-main ${independent ? 'reuse-finale' : 'reuse-inherited'}`}>
    {row && !failed ? <>
      <img className="story-map-frame" src={imageUrl(row.asset.copy!.targetPath)}
        alt={independent
          ? `${nodeId} 独立K03结果帧待验收：${row.usage.action}`
          : `${nodeId} K01输入首帧待验收：继承 ${parentNodeId} K03候选；${scene}`}
        onError={() => setFailed(true)} />
      <span className="reuse-candidate">{independent ? '独立K03结果帧待验收' : <>继承 {parentNodeId} K03 · K01输入帧待验收</>}</span>
    </> : <div className="story-map-frame story-map-frame-missing">
      <strong>{failed ? (independent ? '独立K03候选加载失败' : '父节点候选加载失败') : '父节点K03尚未绑定'}</strong>
      <span>{independent ? `${nodeId} 的K03结果帧待修复` : `${nodeId} 的K01输入帧待补`}</span><span>{scene}</span>
    </div>}
  </div>
}
export function ProcessMaterials({ nodeId, manifest = data, onReview }: { nodeId: string; manifest?: Manifest; onReview?: () => void }) {
  const rows = getProcesses(nodeId, manifest)
  const hasLegacy = manifest.usages.some(u => u.nodeId === nodeId)
  return <section className="reuse-process" aria-label={`${nodeId}过程素材`}>
    <h3>过程素材</h3><p>历史过程参考·未验收，不代表本节点完成状态</p>
    {rows.length ? rows.map(({ asset, usage }) => <figure key={usage.id} data-process-asset={asset.id}>
      <SafeImage key={asset.id} src={imageUrl(asset.copy!.targetPath)} alt={`${nodeId} ${usage.stage}：过程素材·仅参考；${usage.action}`} />
      <figcaption>{usage.stage} · {usage.action} · 过程素材·仅参考 · 未验收</figcaption>
    </figure>) : <p>暂无通过过程展示初审的图片</p>}
    {hasLegacy && <a href="#reuse-review" onClick={onReview}>查看历史素材审查</a>}
  </section>
}
export function ReuseReview({ filter, manifest = data }: { filter: string; manifest?: Manifest }) {
  const assets = getReviewAssets(filter, manifest)
  return <section id="reuse-review" tabIndex={-1} className="reuse-review" aria-labelledby="reuse-review-title">
    <h2 id="reuse-review-title">历史关键帧复用审查</h2>
    <p>共{assets.length}份历史资产 · 未验收。Pavo水印仅限本审查区，原图保留；水印未知也不得进入主图或过程区。</p>
    <p>legacy-candidates/与review-only/均非Pavo生产输入目录。复制验证仅证明字节一致，不代表剧情、人物或制作验收通过。</p>
    <details><summary>展开审查清单与图片（{assets.length}份）</summary>
      <div className="reuse-review-grid">{assets.map(asset => {
        const usages = manifest.usages.filter(u => u.assetId === asset.id)
        const label = usages.map(u => `${u.nodeId} ${u.stage}：${usageDisplay(u, manifest).label}；${u.action}`).join(' / ')
        const viewable = usages.some(u => canShow(asset, u, 'review'))
        return <article key={asset.id} data-review-asset={asset.id}>
          <h3>{usages.map(u => u.nodeId).filter((id, i, ids) => ids.indexOf(id) === i).join(' / ')} · 审查素材</h3>
          <p>{asset.watermark === 'pavo' ? 'Pavo水印·仅审查' : asset.watermark === 'unknown' ? '水印待核实·仅审查' : '无水印·仍未验收'}</p>
          {viewable ? <SafeImage key={asset.id} src={imageUrl(asset.copy!.targetPath)} alt={`${label}；未验收，仅审查`} /> : <p>未复制·仅清单（或副本验证未通过）</p>}
          {usages.map(u => <section key={u.id} aria-label={`${u.nodeId}用途`}>
            <h4 className={u.judgment === '禁止用于该节点' ? 'reuse-denied' : ''}>{u.nodeId} · {usageDisplay(u, manifest).label}</h4>
            <p>镜头阶段：{u.stage} · 动作：{u.action}</p>
            <p>修复方式：{u.repair} · 制作验收：{u.acceptance}</p>
            <p>此处为审查副本 · 用途绑定：{usageDisplay(u, manifest).binding} · 制作未验收</p>
            <details><summary>八项核对及连续性问题</summary><dl>{CHECKS.map(k => <div key={k}><dt>{k} · {u.checks[k].result}</dt><dd>{u.checks[k].evidence}</dd></div>)}</dl>
              {[...u.conflicts, ...u.continuityIssues].map((issue, i) => <p key={i}>{issue}</p>)}
            </details>
          </section>)}
          <details><summary>来源与副本核验</summary><dl>
            <dt>源路径</dt><dd>{asset.sourcePath}</dd><dt>源SHA-256</dt><dd>{asset.sourceSha256}</dd>
            <dt>目标路径</dt><dd>{asset.copy?.targetPath ?? asset.plannedTargetPath ?? '未计划复制'}</dd>
            <dt>目标SHA-256</dt><dd>{asset.copy?.targetSha256 ?? '尚未复制，暂无目标哈希'}</dd>
            <dt>来源证据</dt><dd>{asset.provenanceNote ?? '来源待核实'}</dd>
          </dl></details>
        </article>
      })}</div>
    </details>
  </section>
}
