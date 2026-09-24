import { useEffect, useMemo, useState } from 'react'
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
import { LATEST_ENDING_SCENES, LATEST_VIRTUAL_NODES, branchForDecisions, endingSceneIdForBranch, latestPlayablePaths, nextLatestNode, optionTarget, type LatestDecision, type LatestVirtualNode } from '../demo/latestStory'
import { decisionBackdrop, LATEST_DECISION_BACKDROPS, presentNode } from '../demo/storyPresentation'
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

function DecisionBackdropCard({ value, onOpen }: { value: (typeof LATEST_DECISION_BACKDROPS)[number]; onOpen: (value: FinalKeyframe) => void }) {
  const image: FinalKeyframe = {
    id: `背景-${value.id}`,
    route: value.route,
    title: `${value.title} · ${value.context}`,
    src: value.src,
  }
  return (
    <button className="final-frame" type="button" data-decision-background-id={value.id} onClick={() => onOpen(image)}>
      <img src={value.src} alt={`${value.nodeId} ${value.title}，${value.context}`} loading="lazy" />
      <span><b>{value.nodeId}</b><em>{value.context}</em></span>
      <small>{value.title}</small>
    </button>
  )
}

function NodeCard({ value, onOpen }: { value: FinalNode; onOpen: (value: FinalKeyframe) => void }) {
  const contextVariants = value.id === 'A04'
    ? [
        { optionId: 'A2-1', label: '此前继续推进', decision: { nodeId: 'A02', optionId: 'A2-1', label: '趁还能走，继续推进' } },
        { optionId: 'A2-2', label: '此前暂避风雪', decision: { nodeId: 'A02', optionId: 'A2-2', label: '进背风处暂避' } },
      ]
    : value.id === 'B04'
      ? [
          { optionId: 'B2-1', label: '此前已经提速', decision: { nodeId: 'B02', optionId: 'B2-1', label: '从今天开始，每天多走一段' } },
          { optionId: 'B2-2', label: '此前保持原节奏', decision: { nodeId: 'B02', optionId: 'B2-2', label: '维持现在的可持续节奏' } },
        ]
      : []
  const contextPresentations = contextVariants.map((item) => ({ ...item, node: presentNode(value.id, [item.decision as LatestDecision])?.node }))
  const currentDecisions = contextVariants.length ? [contextVariants[0].decision as LatestDecision] : []
  const current = presentNode(value.id, currentDecisions)?.node
  const question = value.id === 'B04' ? undefined : current && 'question' in current ? current.question : value.question
  const displayTitle = value.id === 'C04V' ? '谷地场景：按进入时点分成三种处境' : current?.title ?? value.title
  const displayTime = value.id === 'A04'
    ? 'Day 5（此前继续）／Day 6（此前暂避）'
    : value.id === 'B04' ? 'Day 9 · 行动状态沿用 Day 6 的选择' : current?.time ?? value.time
  const displayFacts = value.id === 'A04'
    ? '本节点会继承此前是否顶着风雪继续、或暂避了两天；两种状态下的时间与伤手情况见下方。'
    : value.id === 'B04'
      ? '当前可见的两项选择和队伍状态，取决于 Day 6 是否提速；下方分别列出两种实际页面。'
      : value.id === 'C04V'
        ? '这组画面在当前游戏中按进入时点拆成三个行动承接：Day 2 转谷地、Day 3 收到新消息后转谷地，以及 Day 7 根据现场新信息下撤。它们各自保留已经花掉的时间。'
        : current?.facts ?? value.facts
  return (
    <article className={`final-node is-${value.kind}`} id={`node-${value.id}`} data-node-id={value.id}>
      <header>
        <span>{value.id} · {value.kind}</span>
        <strong>{displayTitle}</strong>
        <small>{displayTime} · {value.location}</small>
      </header>
      <KeyframeRail ids={value.frameIds} onOpen={onOpen} />
      <p>{displayFacts}</p>
      {question && <blockquote>{question}</blockquote>}
      {contextPresentations.length > 0 && (
        <div className="final-node-contexts" aria-label="前置选择带来的实际状态">
          {contextPresentations.map((context) => (
            <article key={context.optionId}>
              <strong>{context.label} · {context.node?.time}</strong>
              {value.id === 'B04' && context.node && 'question' in context.node && context.node.question && <blockquote>{context.node.question}</blockquote>}
              <p>{context.node?.facts}</p>
            </article>
          ))}
        </div>
      )}
      {(value.id === 'A04' || value.id === 'B04') && (
        <div className="final-frame-rail" aria-label="不同前情下的实际决策画面">
          {contextVariants.map(({ optionId, label, decision }) => (
            <figure className="final-runtime-still" key={optionId}>
              <img src={decisionBackdrop(value.id, [decision as LatestDecision])} alt={`${label}后的${value.id}决策画面`} loading="lazy" />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <footer><b>教学观察</b>{value.knowledge}</footer>
      {value.id === 'C04V' && (
        <div className="final-options" aria-label="当前谷地的三个实际入口">
          {[
            ['C2FB2', 'Day 2 · 停止等待，立即转走山谷'],
            ['C04VA', 'Day 3 · 收到第二份消息后转走山谷'],
            ['C04VB', 'Day 7 · 根据现场更新改走山谷'],
          ].map(([target, label]) => <a href={`#node-${target}`} key={target}><span>{target}</span><strong>{label}</strong><em>→ {target}</em></a>)}
        </div>
      )}
      {value.options && (
        <div className="final-options" aria-label={`${value.id}选项`}>
          {value.options.map((option) => {
            const target = optionTarget(option)
            const condition = value.id === 'B04'
              ? option.id.startsWith('B4A') ? '此前已提速' : '此前保持原节奏'
              : undefined
            return <a href={target === 'RESULT' ? '#node-RESULT' : `#node-${target}`} key={option.id}>
              <span>{option.id}</span>
              <strong>{option.label}</strong>
              {condition && <small><b>前置情况：</b>{condition}</small>}
              <small><b>代价：</b>{option.cost}</small>
              <small><b>结果：</b>{option.result}</small>
              <em>→ {target === 'RESULT' ? '动态结算' : target}</em>
            </a>
          })}
        </div>
      )}
      {!value.options && value.id !== 'C04V' && nextLatestNode(value.id) && (
        <p className="final-node-next">继续后进入 <a href={`#node-${nextLatestNode(value.id)}`}>{nextLatestNode(value.id) === 'RESULT' ? '动态结算' : nextLatestNode(value.id)}</a></p>
      )}
    </article>
  )
}

const runtimeTransitionNodes = Object.values(LATEST_VIRTUAL_NODES)
const playablePathCount = latestPlayablePaths().length
const a05EarlyResult = branchForDecisions([
  { nodeId: 'P06', optionId: 'P06-A', label: '立即翻山' },
  { nodeId: 'A02', optionId: 'A2-3', label: '现在撤回，改走山谷' },
])
const a05LateResult = branchForDecisions([
  { nodeId: 'P06', optionId: 'P06-A', label: '立即翻山' },
  { nodeId: 'A02', optionId: 'A2-1', label: '继续推进' },
  { nodeId: 'A04', optionId: 'A4-3', label: '在最后回头点撤回' },
])

function currentBranch(value: (typeof FINAL_BRANCHES)[number]) {
  if (value.id !== 'A-05') return value
  return a05EarlyResult ? {
    ...a05EarlyResult,
    sequence: 'P06-A > A2-3；或 P06-A > A2-1/A2-2 > A4-3',
    people: '队伍最终安全返回；投入时间无法收回，原购买窗口已失去',
  } : value
}

function RuntimeNodeCard({ value, onOpen }: { value: LatestVirtualNode; onOpen: (value: FinalKeyframe) => void }) {
  const frames = FINAL_KEYFRAMES.filter((frame) => value.frameIds.includes(frame.id))
  const current = presentNode(value.id, [])?.node
  return (
    <article className={`final-node is-${value.kind}`} id={`node-${value.id}`} data-node-id={value.id}>
      <header>
        <span>{value.id} · 游戏中的行动承接</span>
        <strong>{current?.title ?? value.title}</strong>
        <small>{current?.time ?? value.time} · {value.location}</small>
      </header>
      {frames.length > 0 ? <KeyframeRail ids={frames.map((frame) => frame.id)} onOpen={onOpen} /> : <img className="final-runtime-fallback" src={decisionBackdrop('C02', [])} alt="此前作出决定的营地画面" loading="lazy" />}
      <p>{current?.facts ?? value.facts}</p>
      <footer><b>教学观察</b>{value.knowledge}</footer>
      {nextLatestNode(value.id) && <p className="final-node-next">继续后进入 <a href={`#node-${nextLatestNode(value.id)}`}>{nextLatestNode(value.id) === 'RESULT' ? '动态结算' : nextLatestNode(value.id)}</a></p>}
    </article>
  )
}

export function ReviewedStoryMapPage() {
  const [filter, setFilter] = useState<RouteFilter>('ALL')
  const [lightbox, setLightbox] = useState<FinalKeyframe>()
  const [galleryRoute, setGalleryRoute] = useState<FinalRoute | 'ALL'>('ALL')
  useEffect(() => {
    document.title = '剧情与关键帧总览｜最后十四天'
  }, [])
  const errors = validateFinalStoryMap()
  const publicNodes = FINAL_NODES.filter((item) => item.route === 'PUBLIC')
  const sharedNodes = FINAL_NODES.filter((item) => item.route === 'SHARED')
  const choiceCount = FINAL_NODES.reduce((total, item) => total + (item.options?.length ?? 0), 0)
  const visibleRoutes = filter === 'ALL' ? ROUTE_META : ROUTE_META.filter((item) => item.id === filter)
  const gallery = useMemo(
    () => galleryRoute === 'ALL' ? FINAL_KEYFRAMES : FINAL_KEYFRAMES.filter((item) => item.route === galleryRoute),
    [galleryRoute],
  )

  return (
    <main className="final-map-page">
      <header className="final-map-hero">
        <div className="final-map-eyebrow">TEACHER STORY MAP · NODES, PATHS &amp; KEYFRAMES</div>
        <h1>《最后十四天》剧情与关键帧总览</h1>
        <p>从共同开场出发，查看 A–D 四条路线如何由选择分叉，再汇入结算与复盘。节点卡展示剧情事实、课堂观察、实际去向和对应画面。</p>
        <div className="final-map-stats">
          <span><b>{FINAL_NODES.length}</b>剧情结构节点</span>
          <span><b>{runtimeTransitionNodes.length}</b>条件反馈节点</span>
          <span><b>{choiceCount}</b>决策选项</span>
          <span><b>{playablePathCount}</b>实际可玩路径</span>
          <span><b>{FINAL_BRANCHES.length}</b>结局分组</span>
          <span><b>{FINAL_KEYFRAMES.length}</b>剧情关键帧</span>
        </div>
        <nav aria-label="页内导航">
          <a href="#final-tree">剧情节点与分支</a>
          <a href="#ending-scenes">登记所与结局剧情</a>
          <a href="#final-branches">路径与结局</a>
          <a href="#decision-scenes">当前决策背景</a>
          <a href="#final-gallery">关键帧图库</a>
          <a href="/teacher">教学说明</a>
          <a href="/">试玩游戏</a>
        </nav>
      </header>

      <aside className="final-map-notice">
        <strong>{errors.length === 0 ? '剧情结构检查通过' : `剧情结构待检查：${errors.length} 项`}</strong>
        <p>本总览结合剧情节点与当前运行时状态，供备课、课堂讲解和课后复盘使用。当前可走通{playablePathCount}条选择路径，汇总为18类结局；A-05将第三天直接撤回与两条经A04晚撤回路线合并展示，结局不再套用固定日期。</p>
        <p>共享场景会在多条路线中再次出现，但此前花掉的时间、队员状态和选择代价会继续影响后续处境。</p>
      </aside>

      <section className="final-map-section" id="final-tree">
        <div className="final-section-title">
          <span>01 / STORY NODES</span>
          <h2>完整剧情节点与选择去向</h2>
          <p>包括33个剧情结构节点和12个按前置选择显示的行动反馈节点。选项链接指向当前游戏的实际后续状态。</p>
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
                {runtimeTransitionNodes.filter((item) => item.route === route.id).map((item) => <RuntimeNodeCard key={item.id} value={item} onOpen={setLightbox} />)}
              </div>
            </section>
          ))}
        </div>

        <div className="final-shared-flow">
          <h3>共享结算与复盘</h3>
          <div>{sharedNodes.map((item) => <NodeCard key={item.id} value={item} onOpen={setLightbox} />)}</div>
          <article className="final-node is-结算" id="node-RESULT" data-node-id="RESULT">
            <header><span>RESULT · 当前实际结算节点</span><strong>本局动态结果与战略复盘</strong><small>由本局选择、抵达时间和队伍状态生成</small></header>
            <p>抵达后先播放对应的结局视频：期限内进入登记所完成本人确认并取得回执；超期进入登记所得知原窗口已过、矿权将重新拍卖，保留资料准备下一轮；主动放弃则在小镇安全返程，不办理确认。随后显示客观结果和逐次选择报告。</p>
            <p><a href="#ending-scenes">查看五种实际结局视频与逐场剧情 →</a></p>
            <KeyframeRail ids={['SH-TOWN-DAY', 'SH-TOWN-NIGHT', 'SH-SAFE-01', 'SH-SAFE-02']} onOpen={setLightbox} />
          </article>
        </div>
      </section>

      <section className="final-map-section" id="ending-scenes">
        <div className="final-section-title">
          <span>02 / ARRIVAL & REGISTRATION</span>
          <h2>去登记所之后，故事怎样收束？</h2>
          <p>四条路线先按本局时间与选择结算，再进入以下五种影像收束。白天／夜间是同一办事地点的画面版本；安全返程不进入登记所。点击视频可直接核对成片。</p>
        </div>
        <div className="final-ending-grid">
          {LATEST_ENDING_SCENES.map((scene) => (
            <article className="final-ending-card" id={`ending-${scene.id}`} data-ending-scene={scene.id} key={scene.id}>
              <video controls playsInline preload="none" poster={scene.poster} src={scene.video} aria-label={`${scene.title}结局视频`} />
              <div>
                <small>{scene.condition}</small>
                <h3>{scene.title}</h3>
                <ol>{scene.beats.map((beat) => <li key={beat}>{beat}</li>)}</ol>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="final-map-section" id="final-branches">
        <div className="final-section-title">
          <span>03 / REPRESENTATIVE PATHS</span>
          <h2>18 类结局分组，覆盖 {playablePathCount} 条实际选择路径</h2>
          <p>路径数从当前游戏的可见选项与后续去向遍历得出。A-05合并了第三天直接撤回，以及继续或暂避后再从A04撤回这三种选择序列。</p>
        </div>
        <div className="final-branch-list">
          {FINAL_BRANCHES.filter((item) => filter === 'ALL' || item.route === filter).map((source) => {
            const item = currentBranch(source)
            return <details className={`final-branch route-${item.route}`} key={item.id} data-branch-id={item.id} open={filter !== 'ALL'}>
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
                  <p><b>实际结局视频</b><a href={`#ending-${endingSceneIdForBranch(item)}`}>{LATEST_ENDING_SCENES.find((scene) => scene.id === endingSceneIdForBranch(item))?.title}</a></p>
                  <blockquote>{item.review}</blockquote>
                </div>
                <div className="final-branch-frames">
                  <h4>{item.frameVariants ? '这条代表路径包含两个互斥撤回链' : '这条路径经过的关键帧'}</h4>
                  {branchFrameSequences(item).map((sequence, index) => (
                    <section className="final-branch-variant" key={sequence.label} data-branch-variant={sequence.label}>
                      {item.frameVariants && (
                        <h5>{index > 0 && <em>或</em>}<span>{sequence.label}</span></h5>
                      )}
                      {item.id === 'A-05' && <p className="final-branch-variant-detail">{index === 0 ? a05EarlyResult?.tradeoff : a05LateResult?.tradeoff}</p>}
                      <KeyframeRail ids={sequence.frameIds} onOpen={setLightbox} />
                    </section>
                  ))}
                </div>
              </div>
            </details>
          })}
        </div>
      </section>

      <section className="final-map-section" id="decision-scenes">
        <div className="final-section-title">
          <span>04 / LIVE DECISION BACKDROPS</span>
          <h2>当前游戏实际使用的 12 张决策背景</h2>
          <p>这里展示课堂试玩中决策页面实际使用的图片。A04 和 B04 各有两张背景，会根据此前选择切换；它们与下方55张剧情关键帧分开展示。</p>
        </div>
        <div className="final-gallery-grid">
          {LATEST_DECISION_BACKDROPS.map((item) => <DecisionBackdropCard key={item.id} value={item} onOpen={setLightbox} />)}
        </div>
      </section>

      <section className="final-map-section" id="final-gallery">
        <div className="final-section-title">
          <span>05 / STORY KEYFRAME GALLERY</span>
          <h2>关键帧图库</h2>
          <p>按共同开场、A–D 路线和共享结算筛选画面；点击任意画面可放大查看。</p>
        </div>
        <div className="final-gallery-filter" role="group" aria-label="关键帧筛选">
          {(['ALL', 'PUBLIC', 'A', 'B', 'C', 'D', 'SHARED'] as const).map((id) => (
            <button type="button" key={id} aria-pressed={galleryRoute === id} onClick={() => setGalleryRoute(id)}>
              {id === 'ALL' ? `全部 ${FINAL_KEYFRAMES.length}` : `${routeLabels[id]} ${FINAL_KEYFRAMES.filter((item) => item.route === id).length}`}
            </button>
          ))}
        </div>
        <div className="final-gallery-grid">{gallery.map((item) => <KeyframeCard key={item.id} value={item} onOpen={setLightbox} />)}</div>
      </section>

      <footer className="final-map-footer">剧情节点 → 决策分支 → 登记所结局 → 路径复盘 → 关键帧画面</footer>

      {lightbox && (
        <div className="final-lightbox" role="presentation" onMouseDown={() => setLightbox(undefined)}>
          <figure role="dialog" aria-modal="true" aria-label={`${lightbox.id} 场景画面`} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" aria-label="关闭大图" onClick={() => setLightbox(undefined)}>×</button>
            <img src={lightbox.src} alt={`${lightbox.id} ${lightbox.title}`} />
            <figcaption><b>{lightbox.id}</b>{lightbox.title}<small>{routeLabels[lightbox.route]}{lightbox.shared ? ' · 跨路线复用' : ''}</small></figcaption>
          </figure>
        </div>
      )}
    </main>
  )
}
