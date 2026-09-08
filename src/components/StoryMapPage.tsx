import { MainFrame, ReuseReview, ProcessMaterials } from './KeyframeReuse'
import { useMemo, useState } from 'react'
import {
  REDESIGNED_STORY,
  getTerminalPathCount,
  getVisibleStoryLanes,
  validateRedesignedStory,
  type StoryFinale,
  type StoryOutcome,
  type StoryRouteFilter,
  type StorySituation,
} from '../demo/redesignedStory'

type ReviewDetail = {
  id: string
  title: string
  eyebrow: string
  time?: string
  scene: string
  facts?: string[]
  dialogue?: string[]
  coursePoint?: string
  finales?: StoryFinale[]
  finalState?: string[]
  result?: string
  endingType?: string
  endingDefinition?: string
  profile?: string
  video?: string
  status?: string
}

const FILTERS: Array<{ id: StoryRouteFilter; label: string }> = [
  { id: 'ALL', label: '全部剧情' },
  { id: 'A', label: 'A 翻山' },
  { id: 'B', label: 'B 山谷' },
  { id: 'C', label: 'C 预报' },
  { id: 'D', label: 'D 撤离' },
]

function statusLabel(status: StorySituation['status'] | StoryOutcome['status']) {
  if (status === 'ready') return '已有成片 · 待按新剧情复核'
  if (status === 'partial') return '现有成片可保留 · 需补选择事实段'
  if (status === 'rebuild') return '需重做'
  return '新剧情 · 待生成'
}

function SituationCard({ node, onOpen }: { node: StorySituation; onOpen: (detail: ReviewDetail) => void }) {
  return (
    <button
      className="story-map-card story-map-situation"
      type="button"
      onClick={() => onOpen({
        id: node.id, title: node.title, eyebrow: '路线局面', time: node.time,
        scene: node.scene, facts: node.facts, dialogue: node.dialogue,
        coursePoint: node.coursePoint, status: statusLabel(node.status),
      })}
    >
      <MainFrame nodeId={node.id} scene={node.scene} />
      <span className="story-map-node-id">{node.id} · 路线局面</span>
      <strong>{node.title}</strong>
      <small>{node.time}</small>
      <p>{node.summary}</p>
    </button>
  )
}

function OutcomeCard({ node, onOpen }: { node: StoryOutcome; onOpen: (detail: ReviewDetail) => void }) {
  return (
    <button
      className={`story-map-card story-map-outcome deadline-${node.deadline}`}
      type="button"
      onClick={() => onOpen({
        id: node.id, title: node.title, eyebrow: '二级行动与直接后果', time: node.time,
        scene: node.scene, facts: node.facts, coursePoint: node.coursePoint,
        finales: node.finales, status: statusLabel(node.status),
      })}
    >
      <MainFrame nodeId={node.id} scene={node.scene} />
      <span className="story-map-node-id">{node.id} · 二级行动</span>
      <strong>{node.title}</strong>
      <small>{node.time}</small>
      <p>{node.directResult}</p>
      <div className="story-map-tags">
        <span>{node.deadline === 'expired' ? '期限已失' : node.deadline === 'resolved' ? '主动退出' : '期限尚在'}</span>
        <span>{node.finales.length === 1 ? '自动进入专属结果' : `${node.finales.length} 个专属结果`}</span>
      </div>
    </button>
  )
}

function FinaleCard({ node, onOpen }: { node: StoryFinale; onOpen: (detail: ReviewDetail) => void }) {
  const ending = REDESIGNED_STORY.endingTypes.find((item) => item.id === node.endingType)!

  return (
    <button
      className="story-map-finale"
      type="button"
      data-finale-id={node.id}
      onClick={() => onOpen({
        id: node.id,
        title: node.label,
        eyebrow: node.mode === 'automatic' ? '自动结果' : '第三次选择',
        scene: node.scene,
        facts: node.requiredFacts,
        finalState: node.finalState,
        result: node.result,
        coursePoint: node.coursePoint,
        endingType: node.endingType,
        endingDefinition: ending.definition,
        profile: ending.profile,
        video: node.video,
        status: '剧本已锁定 · 关键帧待生成',
      })}
    >
      <span>{node.mode === 'automatic' ? '自动结果' : '第三次选择'} · {node.id}</span>
      <strong>{node.label}</strong>
      <div className="story-map-finale-result"><small>确定结尾剧情</small><p>{node.result}</p></div>
      <div className="story-map-finale-states">{node.finalState.map((item) => <small key={item}>{item}</small>)}</div>
      <div className="story-map-finale-profile"><small>用户画像倾向</small><strong>{ending.profile}</strong><span>{node.endingType} · {ending.title}</span></div>
      <footer><small>{node.coursePoint}</small></footer>
    </button>
  )
}

function DetailPanel({ detail, onClose }: { detail: ReviewDetail; onClose: () => void }) {
  return (
    <div className="story-map-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="story-map-detail" role="dialog" aria-modal="true" aria-labelledby="story-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="story-map-detail-close" type="button" onClick={onClose} aria-label="关闭详情">×</button>
        <span>{detail.eyebrow} · {detail.id}</span>
        <h2 id="story-detail-title">{detail.title}</h2>
        {detail.time && <strong className="story-map-detail-time">{detail.time}</strong>}
        <MainFrame key={detail.id} nodeId={detail.id} scene={detail.scene} />
        <ProcessMaterials nodeId={detail.id} onReview={onClose} />
        <section><h3>镜头与剧情</h3><p>{detail.scene}</p></section>
        {detail.facts && <section><h3>玩家在选择前已知的事实</h3><ul>{detail.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></section>}
        {detail.dialogue && <section><h3>对白与声音要点</h3>{detail.dialogue.map((line) => <p key={line}>{line}</p>)}</section>}
        {detail.finales && <section><h3>后续决策与确定结果</h3>{detail.finales.map((item) => <article key={item.id}><strong>{item.id} · {item.label} → {item.endingType}</strong><p>{item.result}</p></article>)}</section>}
        {detail.result && <section><h3>确定结尾剧情</h3><p>{detail.result}</p></section>}
        {detail.finalState && <section><h3>确定的最终状态</h3><ul>{detail.finalState.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        {detail.endingType && <section><h3>用户画像倾向</h3><p><strong>{detail.profile}</strong> · {detail.endingType}</p><p>{detail.endingDefinition} 该画像是本局行为倾向，不是对学生的永久定型。</p></section>}
        {detail.video && <section><h3>独立视频文件</h3><p>{detail.video}</p></section>}
        {detail.coursePoint && <section><h3>战略管理映射</h3><p>{detail.coursePoint}</p></section>}
        {detail.status && <footer>{detail.status}</footer>}
      </aside>
    </div>
  )
}

function AuditOverview() {
  const errors = validateRedesignedStory()
  const finales = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes.flatMap((outcome) => outcome.finales))
  const uniqueVideos = new Set(finales.map((item) => item.video)).size

  return (
    <section className="story-map-audit" aria-label="剧情验收总览">
      <header>
        <div><span>FORMAL STORY AUDIT</span><h2>剧情验收总览</h2></div>
        <strong className={errors.length === 0 ? 'passed' : 'failed'}>{errors.length === 0 ? '脚本逻辑已锁定' : '存在阻断问题'}</strong>
      </header>
      <div className="story-map-audit-metrics">
        <article><small>终局覆盖</small><strong>{finales.length} / 34</strong><span>全部列入导演地图</span></article>
        <article><small>校验错误</small><strong>{errors.length} 项</strong><span>时间、事实、确定结果</span></article>
        <article><small>独立视频路径</small><strong>{uniqueVideos} 条</strong><span>不复用公共Fx剧情</span></article>
        <article><small>正式结构</small><strong>4 × 3 → 34</strong><span>四路线、十二个二级节点</span></article>
      </div>
      <div className="story-map-production-gate">
        <strong>先补前置事实</strong>
        <p><b>A0、B0、C0、D0、A3</b>优先复核或补拍；随后完成A1—D3的十二个选择事实段，最后才放行34条结果视频。</p>
        <span>脚本通过 ≠ 成片通过 · 每条视频仍需首尾帧、人物、动作、对白与字幕校时验收</span>
        <span>该校验不覆盖图片事实和声画连续性</span>
      </div>
      {errors.length > 0 && <ul className="story-map-audit-errors">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
    </section>
  )
}

export function StoryMapPage() {
  const [filter, setFilter] = useState<StoryRouteFilter>('ALL')
  const [detail, setDetail] = useState<ReviewDetail>()
  const lanes = useMemo(() => getVisibleStoryLanes(filter), [filter])

  return (
    <main className="story-map-page">
      <header className="story-map-header">
        <div>
          <a href="/">← 返回游戏</a>
          <span>THE LAST FOURTEEN DAYS · DIRECTOR MAP</span>
          <h1>{REDESIGNED_STORY.title}</h1>
          <p>{REDESIGNED_STORY.subtitle}</p>
        </div>
        <div className="story-map-version"><strong>正式剧情树 v3.0</strong><small>{getTerminalPathCount()} 条独立因果结局</small></div>
      </header>

      <section className="story-map-warning" aria-label="版本说明">
        <strong>旧结构已废弃</strong>
        <p>{REDESIGNED_STORY.deprecatedFlow}</p>
      </section>

      <AuditOverview />
      <ReuseReview filter={filter} />

      <nav className="story-map-filters" aria-label="查看剧情路线">
        {FILTERS.map((item) => <button type="button" key={item.id} className={filter === item.id ? 'active' : ''} onClick={() => setFilter(item.id)}>{item.label}</button>)}
        <span>从左向右读 · 点击节点看完整剧本</span>
      </nav>

      <section className="story-map-common" aria-label="公共开场">
        {REDESIGNED_STORY.common.map((node, index) => (
          <button key={node.id} className="story-map-card story-map-common-card" type="button" onClick={() => setDetail({ id: node.id, title: node.title, eyebrow: index === 0 ? '序章' : '一级路线选择', time: node.time, scene: node.scene })}>
            <MainFrame nodeId={node.id} scene={node.scene} />
            <span className="story-map-node-id">0{index + 1} · {node.id}</span>
            <strong>{node.title}</strong>
            <small>{node.time}</small>
          </button>
        ))}
        <div className="story-map-common-arrow">→ 进入四条独立路线，前情不清零</div>
      </section>

      <section className="story-map-board" aria-label="正式剧情分支图">
        <div className="story-map-columns" aria-hidden="true"><span>路线局面</span><span>二级行动与直接后果</span><span>第三次选择 → 结尾剧情 → 用户画像</span></div>
        {lanes.map((route) => (
            <article key={route.id} className={`story-map-lane route-${route.id}`}>
              <header><span>{route.id}</span><div><h2>{route.label}</h2><p>{route.thesis}</p></div></header>
              <SituationCard node={route.situation} onOpen={setDetail} />
              <div className="story-map-arrow">→</div>
              <div className="story-map-branches">
                {route.outcomes.map((outcome) => (
                  <section className="story-map-branch" key={outcome.id}>
                    <OutcomeCard node={outcome} onOpen={setDetail} />
                    <div className="story-map-branch-arrow">→</div>
                    <div className="story-map-finales">{outcome.finales.map((item) => <FinaleCard key={item.id} node={item} onOpen={setDetail} />)}</div>
                  </section>
                ))}
              </div>
            </article>
        ))}
      </section>

      <footer className="story-map-report-note">
        <strong>F1–F6 · 仅作报告分类</strong>
        <p>34 条路径各自拥有独立剧情视频；报告再汇总时间、人员、证据、执行能力、控制空间和资本回收，形成玩家的战略管理画像。</p>
        <div className="story-map-ending-types">{REDESIGNED_STORY.endingTypes.map((item) => <span key={item.id}><strong>{item.id} · {item.title}</strong><small>{item.profile}</small></span>)}</div>
      </footer>
      {detail && <DetailPanel detail={detail} onClose={() => setDetail(undefined)} />}
    </main>
  )
}
