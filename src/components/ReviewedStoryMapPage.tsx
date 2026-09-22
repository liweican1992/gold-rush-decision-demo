import { useMemo, useState } from 'react'
import {
  FINAL_BRANCHES,
  FINAL_KEYFRAMES,
  FINAL_NODES,
  ROUTE_META,
  branchFrameSequences,
  keyframeById,
  validateFinalStoryMap,
  type FinalKeyframe,
  type FinalNode,
  type FinalRoute,
} from '../demo/finalStoryMap'
import './reviewedStoryMap.css'

type RouteFilter = 'ALL' | 'A' | 'B' | 'C' | 'D'

const routeLabels: Record<FinalRoute, string> = {
  PUBLIC: '公共开场',
  A: 'A 翻山',
  B: 'B 山谷',
  C: 'C 等信息',
  D: 'D 安全等待',
  SHARED: '共享结算',
}

function KeyframeCard({ value, compact = false, onOpen }: { value: FinalKeyframe; compact?: boolean; onOpen: (value: FinalKeyframe) => void }) {
  return (
    <button
      className={`final-frame ${compact ? 'is-compact' : ''}`}
      type="button"
      data-keyframe-id={value.id}
      data-keyframe-src={value.src}
      onClick={() => onOpen(value)}
    >
      <img src={value.src} alt={`${value.id} ${value.title}`} loading="lazy" />
      <span><b>{value.id}</b>{value.shared && <em>共享复用</em>}</span>
      <small>{value.title}</small>
    </button>
  )
}

function KeyframeRail({ ids, onOpen }: { ids: string[]; onOpen: (value: FinalKeyframe) => void }) {
  return (
    <div className="final-frame-rail">
      {ids.map((id) => {
        const value = keyframeById(id)!
        return <KeyframeCard key={id} value={value} compact onOpen={onOpen} />
      })}
    </div>
  )
}

function NodeCard({ value, onOpen }: { value: FinalNode; onOpen: (value: FinalKeyframe) => void }) {
  return (
    <article className={`final-node is-${value.kind}`} id={`node-${value.id}`} data-node-id={value.id}>
      <header>
        <span>{value.id} · {value.kind}</span>
        <strong>{value.title}</strong>
        <small>{value.time} · {value.location}</small>
      </header>
      <KeyframeRail ids={value.frameIds} onOpen={onOpen} />
      <p>{value.facts}</p>
      {value.question && <blockquote>{value.question}</blockquote>}
      <footer><b>教学观察</b>{value.knowledge}</footer>
      {value.options && (
        <div className="final-options" aria-label={`${value.id}选项`}>
          {value.options.map((option) => (
            <a href={`#node-${option.to}`} key={option.id}>
              <span>{option.id}</span>
              <strong>{option.label}</strong>
              <small><b>代价：</b>{option.cost}</small>
              <small><b>结果：</b>{option.result}</small>
              <em>→ {option.to}</em>
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

export function ReviewedStoryMapPage() {
  const [filter, setFilter] = useState<RouteFilter>('ALL')
  const [lightbox, setLightbox] = useState<FinalKeyframe>()
  const [galleryRoute, setGalleryRoute] = useState<FinalRoute | 'ALL'>('ALL')
  const errors = validateFinalStoryMap()
  const publicNodes = FINAL_NODES.filter((item) => item.route === 'PUBLIC')
  const sharedNodes = FINAL_NODES.filter((item) => item.route === 'SHARED')
  const visibleRoutes = filter === 'ALL' ? ROUTE_META : ROUTE_META.filter((item) => item.id === filter)
  const gallery = useMemo(
    () => galleryRoute === 'ALL' ? FINAL_KEYFRAMES : FINAL_KEYFRAMES.filter((item) => item.route === galleryRoute),
    [galleryRoute],
  )

  return (
    <main className="final-map-page">
      <header className="final-map-hero">
        <div className="final-map-eyebrow">THE LAST FOURTEEN DAYS · FINAL STORYBOARD MAP</div>
        <h1>当前 FINAL 全分支与关键帧</h1>
        <p>按封版节点总表重建。先看全部因果分叉，再查每条可玩路径经过的关键帧。</p>
        <div className="final-map-stats">
          <span><b>33</b>剧情节点</span>
          <span><b>28</b>决策选项</span>
          <span><b>18</b>代表完整路径</span>
          <span><b>55</b>WebGPT 复审通过关键帧</span>
        </div>
        <nav aria-label="页内导航">
          <a href="#final-tree">全节点分叉</a>
          <a href="#final-branches">18条完整路径</a>
          <a href="#final-gallery">55张关键帧</a>
        </nav>
      </header>

      <aside className="final-map-notice">
        <strong>{errors.length === 0 ? 'WebGPT 最终映射复核：PASS · 2026-09-14' : `映射存在 ${errors.length} 项问题`}</strong>
        <p>《最后十四天》剧情与关键帧地图已封版：33个逻辑节点、28个选项／流转、18条代表路径、55张有效关键帧全部对账通过。</p>
        <p><b>下一阶段：</b>人工最终确认 → P02 单条低成本 Pavo 打样。当前 PASS 不等于视频已验收，也不授权批量生成或消耗 Pavo 积分；本页不调用 Pavo。</p>
        <p>共享环境与到达镜头可在多条路径中重复显示，但上游日期、人员状态和选择代价不会被清零。</p>
      </aside>

      <section className="final-map-section" id="final-tree">
        <div className="final-section-title">
          <span>01 / CAUSAL TREE</span>
          <h2>全节点因果分叉</h2>
          <p>每张节点卡都有关键帧；点图可放大，点选项可跳到其直接去向。</p>
        </div>

        <div className="final-public-flow">
          <h3>公共开场 · P01—P06</h3>
          <div>{publicNodes.map((item) => <NodeCard key={item.id} value={item} onOpen={setLightbox} />)}</div>
        </div>

        <div className="final-route-filter" role="group" aria-label="路线筛选">
          {(['ALL', 'A', 'B', 'C', 'D'] as RouteFilter[]).map((id) => (
            <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {id === 'ALL' ? '全部路线' : `${id} 线`}
            </button>
          ))}
        </div>

        <div className="final-route-lanes">
          {visibleRoutes.map((route) => (
            <section key={route.id} className={`final-route-lane route-${route.id}`}>
              <header><span>ROUTE {route.id}</span><h3>{route.title}</h3><p>{route.theme}</p></header>
              <div className="final-node-stack">
                {FINAL_NODES.filter((item) => item.route === route.id).map((item) => <NodeCard key={item.id} value={item} onOpen={setLightbox} />)}
              </div>
            </section>
          ))}
        </div>

        <div className="final-shared-flow">
          <h3>共享结算与复盘</h3>
          <div>{sharedNodes.map((item) => <NodeCard key={item.id} value={item} onOpen={setLightbox} />)}</div>
        </div>
      </section>

      <section className="final-map-section" id="final-branches">
        <div className="final-section-title">
          <span>02 / COMPLETE PATHS</span>
          <h2>18 条可完整走通的代表路径</h2>
          <p>这里的“18条”是封版节点总表里的代表路径，不是18个独立视频，也不是旧版的84条组合。</p>
        </div>
        <div className="final-branch-list">
          {FINAL_BRANCHES.filter((item) => filter === 'ALL' || item.route === filter).map((item) => (
            <details className={`final-branch route-${item.route}`} key={item.id} data-branch-id={item.id} open={filter !== 'ALL'}>
              <summary>
                <span>{item.id}</span>
                <strong>{item.name}</strong>
                <em className={`deadline-${item.deadline}`}>{item.deadline}</em>
                <small>{item.completion}</small>
              </summary>
              <div className="final-branch-body">
                <div className="final-branch-copy">
                  <p><b>选择序列</b>{item.sequence}</p>
                  <p><b>人员／能力</b>{item.people}</p>
                  <p><b>核心取舍</b>{item.tradeoff}</p>
                  <blockquote>{item.review}</blockquote>
                </div>
                <div className="final-branch-frames">
                  <h4>{item.frameVariants ? '这条代表路径包含两个互斥撤回链' : '这条路径经过的关键帧'}</h4>
                  {branchFrameSequences(item).map((sequence, index) => (
                    <section className="final-branch-variant" key={sequence.label} data-branch-variant={sequence.label}>
                      {item.frameVariants && (
                        <h5>{index > 0 && <em>或</em>}<span>{sequence.label}</span></h5>
                      )}
                      <KeyframeRail ids={sequence.frameIds} onOpen={setLightbox} />
                    </section>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="final-map-section" id="final-gallery">
        <div className="final-section-title">
          <span>03 / APPROVED KEYFRAMES</span>
          <h2>55 张当前有效关键帧</h2>
          <p>A线统一使用去除医疗十字后的 v02；夜间到达统一使用 SH-TOWN-NIGHT v03。</p>
        </div>
        <div className="final-gallery-filter" role="group" aria-label="关键帧筛选">
          {(['ALL', 'PUBLIC', 'A', 'B', 'C', 'D', 'SHARED'] as const).map((id) => (
            <button type="button" key={id} aria-pressed={galleryRoute === id} onClick={() => setGalleryRoute(id)}>
              {id === 'ALL' ? '全部 55' : `${routeLabels[id]} ${FINAL_KEYFRAMES.filter((item) => item.route === id).length}`}
            </button>
          ))}
        </div>
        <div className="final-gallery-grid">{gallery.map((item) => <KeyframeCard key={item.id} value={item} onOpen={setLightbox} />)}</div>
      </section>

      <footer className="final-map-footer">当前 FINAL 剧情真源 → 33节点 → 28选项 → 18代表路径 → 55张已通过关键帧</footer>

      {lightbox && (
        <div className="final-lightbox" role="presentation" onMouseDown={() => setLightbox(undefined)}>
          <figure role="dialog" aria-modal="true" aria-label={`${lightbox.id} 关键帧`} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" aria-label="关闭大图" onClick={() => setLightbox(undefined)}>×</button>
            <img src={lightbox.src} alt={`${lightbox.id} ${lightbox.title}`} />
            <figcaption><b>{lightbox.id}</b>{lightbox.title}<small>{routeLabels[lightbox.route]} · WebGPT PASS{lightbox.shared ? ' · 共享复用' : ''}</small></figcaption>
          </figure>
        </div>
      )}
    </main>
  )
}
