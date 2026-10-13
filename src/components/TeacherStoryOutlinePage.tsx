import { useEffect } from 'react'
import './reviewedStoryMap.css'

const routes = [
  {
    id: 'A', image: '/images/decision-stills/A02.webp', title: '立即翻山', stance: '用风险换时间',
    story: '队伍抢先进入山路，却在高地遇到暴风和伤手失力。学生需要判断：继续推进、暂避，还是及时撤回；到最后回头点还要再次决定是否坚持。',
    concepts: '风险收益权衡 · 承诺升级 · 沉没成本',
    outcomes: '可能按期完成；也可能因撤回改路失去原窗口。',
  },
  {
    id: 'B', image: '/images/decision-stills/B02.webp', title: '走山谷', stance: '用可控性换速度',
    story: '谷地更稳，却天然慢于期限。学生会在第六天和第九天两次核算进度，决定是否提速，以及在疲劳出现后是否继续维持强度。',
    concepts: '战略与目标匹配 · 调整时机 · 执行代价',
    outcomes: '提早调整仍可能按期；调整太晚或保持原节奏会超期。',
  },
  {
    id: 'C', image: '/images/decision-stills/C02.webp', title: '先等天气信息', stance: '用时间购买信息',
    story: '队伍先等两天确认暴风，再决定是否多等一天了解山口。即使获得判断，进入现场后仍会出现偏差，学生仍需更新计划。',
    concepts: '信息价值 · 等待成本 · 停止规则 · 动态调整',
    outcomes: '信息用得及时可以按期；继续等待或改走谷地可能超期，也可主动退出。',
  },
  {
    id: 'D', image: '/images/decision-stills/D03.webp', title: '优先安全', stance: '先保人员与行动能力',
    story: '队伍留营等待，人员状态恢复，但期限持续流失。第五天天气出现短暂窗口，学生要判断是否推翻原安排；若重新上山，还要承担时间压力。',
    concepts: '价值排序 · 战略反转 · 退出边界',
    outcomes: '可以安全返回；也可能利用窗口按期完成，或在降速后超期。',
  },
] as const

const outcomes = [
  { id: '01', title: '按期完成确认', detail: '队长在第十四天上午九点前抵达登记所，由本人完成最后确认并取得回执。', lesson: '结果达成后，仍要复盘为速度付出的风险和人员代价。' },
  { id: '02', title: '超期抵达，进入重新拍卖', detail: '队伍安全抵达，但原购买窗口已经过去；资料和矿样未被受理，矿权进入下一轮拍卖。', lesson: '安全抵达与按期完成目标是两件事，战略要同时接受期限检验。' },
  { id: '03', title: '主动放弃，安全返回', detail: '队伍不再争取原期限，在天气稳定后安全返回，保留人员、资料和后续行动能力。', lesson: '退出不是自动等于失败，要看它保护了什么、放弃了什么。' },
] as const

export function TeacherStoryOutlinePage() {
  useEffect(() => {
    document.title = '故事大纲｜最后十四天'
  }, [])

  return (
    <main className="final-map-page teacher-story-outline">
      <header className="final-map-hero">
        <div className="final-map-eyebrow">TEACHER STORY OUTLINE · STRATEGIC DECISION EXPERIENCE</div>
        <h1>《最后十四天》故事大纲</h1>
        <p>这是一个供《战略管理》课堂使用的互动情境案例。学生每局只会经历其中一条路线，在不完整信息、时间期限和人员受伤的共同约束下，连续作出 2–4 次关键选择。</p>
        <div className="final-map-stats">
          <span><b>1</b>个共同情境</span>
          <span><b>4</b>条可选路线</span>
          <span><b>2–4</b>次关键选择</span>
          <span><b>3</b>类客观结局</span>
        </div>
        <nav aria-label="页内导航">
          <a href="#story-in-one-page">一页看懂</a>
          <a href="#why-this-design">为什么这样设计</a>
          <a href="#four-routes">四条路线</a>
          <a href="#three-outcomes">三类结局</a>
          <a href="#teaching-map">课程知识</a>
          <a href="/docs/story-map">完整剧情与关键帧</a>
          <a href="/teacher">教学说明</a>
          <a href="/">试玩游戏</a>
        </nav>
      </header>

      <section className="final-map-section final-teacher-overview" id="story-in-one-page">
        <div className="final-section-title">
          <span>01 / THE SITUATION</span>
          <h2>学生要解决的，不是“哪条路最好”</h2>
          <p>而是：在目标不变、约束不断变化的情况下，如何选择路线，并知道什么时候应该调整或退出。</p>
        </div>
        <article className="final-premise">
          <span>共同情境</span>
          <h3>疑似金矿已经找到，但购买窗口只剩最后十四天</h3>
          <p>队长必须在截止时间前亲自到登记所完成确认。翻山通常需要 7–10 天，山谷通常需要 2–3 周；天气信息尚不完整，队长左手又突然失去力量。学生作为队长，需要在机会、期限、路线风险和队伍安全之间作出选择。</p>
        </article>
        <div className="final-story-arc" aria-label="一局游戏的五个阶段">
          {[
            ['01', '发现机会', '矿样显示出价值，十四天期限开始倒计时。'],
            ['02', '识别约束', '路线、天气、伤手与本人确认要求同时出现。'],
            ['03', '选择路线', '翻山、走山谷、等待信息或优先安全。'],
            ['04', '面对反馈', '天气、进度和人员状态迫使学生再次判断。'],
            ['05', '结果与复盘', '系统给出客观结果，并用本局证据解释取舍。'],
          ].map(([step, title, detail]) => <article key={step}><span>{step}</span><strong>{title}</strong><p>{detail}</p></article>)}
        </div>
        <p className="final-teacher-note"><b>课堂阅读方式：</b>学生每局只会经历其中一条路线，其他路线用于同学之间比较或课后复盘，并不要求一个学生一次看完全部分支。</p>
      </section>

      <section className="final-map-section final-design-rationale" id="why-this-design">
        <div className="final-section-title">
          <span>02 / WHY THIS DESIGN</span>
          <h2>为什么不把它做成一道选择题？</h2>
          <p>因为战略管理不只是出发前选一个方案。真正的难点，是在行动产生代价、情况继续变化之后，判断原方案的依据是否还成立。</p>
        </div>
        <article className="final-core-concept">
          <span>本案例最终呈现的底层知识点</span>
          <h3>战略适配与动态调整</h3>
          <p>行动必须持续匹配<strong>目标与约束</strong>、<strong>外部环境</strong>和<strong>自身资源能力</strong>。天气、期限、进度或人员能力改变后，学生需要重新检验原判断：继续、改路、降速或退出，哪一个更能服务当前目标？</p>
          <div aria-label="底层逻辑">目标与约束 <b>×</b> 外部环境 <b>×</b> 资源与能力 <b>→</b> 行动选择 <b>→</b> 现实反馈 <b>→</b> 重新判断</div>
        </article>
        <div className="final-design-grid">
          <article><span>设计一</span><h3>信息分批出现</h3><p>学生不能事后拥有全部信息，只能依据当时所知作决定。</p><strong>呈现：不确定性与信息价值</strong></article>
          <article><span>设计二</span><h3>每种方案都有代价</h3><p>山路、山谷、等待和退出分别保护不同目标，没有脱离约束的最佳路线。</p><strong>呈现：战略取舍与目标排序</strong></article>
          <article><span>设计三</span><h3>选择后仍要再决策</h3><p>天气、进度和伤手持续变化，原先合理的方案可能不再适用。</p><strong>呈现：战略一致性与动态调整</strong></article>
          <article><span>设计四</span><h3>报告引用本局证据</h3><p>系统用学生自己的选择和后果解释概念，避免只凭结局倒推对错。</p><strong>呈现：过程复盘与决策质量</strong></article>
        </div>
      </section>

      <section className="final-map-section" id="four-routes">
        <div className="final-section-title">
          <span>03 / FOUR STRATEGIC ROUTES</span>
          <h2>同一目标，四种不同的行动逻辑</h2>
          <p>四条路线没有预设“标准答案”。系统通过后续反馈，让学生看到每种选择保护了什么、又牺牲了什么。</p>
        </div>
        <div className="final-route-outline-grid">
          {routes.map((route) => (
            <article className={`final-route-outline route-${route.id}`} key={route.id}>
              <img src={route.image} alt={`${route.title}路线的游戏场景`} />
              <header><span>路线 {route.id}</span><h3>{route.title}</h3><em>{route.stance}</em></header>
              <p>{route.story}</p>
              <dl><div><dt>对应知识</dt><dd>{route.concepts}</dd></div><div><dt>可能结果</dt><dd>{route.outcomes}</dd></div></dl>
            </article>
          ))}
        </div>
      </section>

      <section className="final-map-section" id="three-outcomes">
        <div className="final-section-title">
          <span>04 / THREE OBJECTIVE OUTCOMES</span>
          <h2>结局判断只看事实，不给学生贴标签</h2>
          <p>路线会产生多种过程组合，但面向学生的最终结果归纳为三类。系统先说明发生了什么，再进入战略复盘。</p>
        </div>
        <div className="final-outcome-grid">
          {outcomes.map((outcome) => <article key={outcome.id}><span>{outcome.id}</span><h3>{outcome.title}</h3><p>{outcome.detail}</p><blockquote>{outcome.lesson}</blockquote></article>)}
        </div>
      </section>

      <section className="final-map-section" id="teaching-map">
        <div className="final-section-title">
          <span>05 / COURSE CONNECTION</span>
          <h2>一个核心，四个观察角度</h2>
          <p>“战略适配与动态调整”是主线。下面四个概念用于观察学生在不同节点如何处理这条主线，而不是四组互不相干的知识点。</p>
        </div>
        <div className="final-teaching-grid">
          <article><span>目标与约束</span><h3>先定义成功，再比较方案</h3><p>“安全抵达”与“按期完成本人确认”不是同一个目标。路线选择必须同时接受期限、人员能力和外部环境的检验。</p></article>
          <article><span>信息价值</span><h3>等待可以买到信息，也会消耗窗口</h3><p>C 线让学生判断多等一天带来的判断改善，是否足以覆盖时间成本，并练习设定停止等待的规则。</p></article>
          <article><span>战略一致性与动态调整</span><h3>坚持目标，不等于重复原动作</h3><p>天气、进度或能力变化后，学生要说明原有假设是否仍成立；调整手段可能是在维护目标，而非放弃战略。</p></article>
          <article><span>沉没成本与退出边界</span><h3>已经付出的代价，不应替未来作决定</h3><p>A、D 两线设置回头点和安全退出，让学生区分“因为已经走了很远而继续”与“基于剩余收益和风险继续”。</p></article>
        </div>
      </section>

      <section className="final-outline-next">
        <div><span>需要进一步核对？</span><h2>完整节点、选择去向与关键帧仍保留在原页面</h2><p>教师看故事大纲，制作和验收人员查看完整资料，两者互不替代。</p></div>
        <a href="/docs/story-map">打开完整剧情与关键帧 <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="final-map-footer">共同情境 → 四种行动路线 → 现实反馈与再决策 → 三类客观结局 → 战略复盘</footer>
    </main>
  )
}
