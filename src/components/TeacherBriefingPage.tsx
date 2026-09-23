import { useEffect } from 'react'
import './teacherBriefing.css'

const routes = [
  {
    mark: 'A', image: '/images/decision-stills/A02.jpg', title: '立即翻山',
    benefit: '前段确实更快，争取到时间余量。',
    echo: '暴风与伤手叠加；走得越深，折返越贵。',
    core: '环境与自身能力匹配、不可逆性',
    extension: '承诺升级与已投入成本',
    question: '已经走到这里，能成为继续的理由吗？',
  },
  {
    mark: 'B', image: '/images/decision-stills/B02.jpg', title: '沿山谷前进',
    benefit: '高地暴露较低，队伍稳定前行。',
    echo: '正常节奏赶不上期限；提速又要压缩休息。',
    core: '目标与取舍、时间压力',
    extension: '调整时机与缓冲价值',
    question: '如果为赶期不断牺牲稳妥，还在坚持原战略吗？',
  },
  {
    mark: 'C', image: '/images/decision-stills/C02.jpg', title: '先等天气信息',
    benefit: '两天后确认暴风，再等一天可进一步判断山口。',
    echo: '信息仍非通行保证，等待已消耗行动时间。',
    core: '不确定性、时间与竞争压力',
    extension: '信息价值与停止等待',
    question: '这条新信息会改变行动，还是只让人更安心？',
  },
  {
    mark: 'D', image: '/images/decision-stills/D03.jpg', title: '等待安全返回',
    benefit: '避开最强风雪，左手与体力得到恢复。',
    echo: '天气改善时已等了五天，重新翻山的余量很少。',
    core: '目标优先级、价值观与权衡',
    extension: '战略一致性与动态调整',
    question: '改变行动，是放弃安全目标，还是重新实现它？',
  },
] as const

const teachingSteps = [
  { number: '01', title: '先说目标', detail: '请学生选路前写一句：最想保住什么，愿意承担哪种代价。理由由学生填写，系统不替他们推断动机。' },
  { number: '02', title: '再看变化', detail: '让天气、伤手、实际进度和剩余期限逐步出现。每个新节点都问：原先判断依赖的条件还成立吗？' },
  { number: '03', title: '用证据复盘', detail: '结局报告回放当时已知的信息、选择、代价和结果，再联系战略概念与企业情境。可比较不同路径，但不按结局给学生打能力分。' },
] as const

export function TeacherBriefingPage() {
  useEffect(() => {
    document.title = '教学设计说明｜最后十四天'
  }, [])

  return (
    <main className="teacher-page">
      <header className="teacher-header">
        <a className="teacher-brand" href="/" aria-label="最后十四天游戏首页"><span>14</span><strong>最后十四天</strong></a>
        <nav aria-label="页面导航">
          <a href="#teaching-map">教学映射</a>
          <a href="#classroom">课堂使用</a>
          <a className="teacher-header-play" href="/">打开游戏 <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="teacher-hero" aria-labelledby="teacher-title">
        <div className="teacher-hero-copy">
          <p className="teacher-kicker">战略管理 · 互动案例教学说明</p>
          <h1 id="teacher-title">让学生先作判断，<br /><span>再讨论战略。</span></h1>
          <p className="teacher-hero-lead">《最后十四天》把课件中“阿拉斯加疑似金矿地块的土地购买期权”案例，改编为第一人称视频决策体验。学生在不知道后续结果时选择路线，经历天气、伤情和期限的变化，最后回看自己的判断依据。</p>
          <div className="teacher-hero-actions">
            <a className="teacher-primary-link" href="/">进入游戏体验 <span aria-hidden="true">↗</span></a>
            <a className="teacher-text-link" href="#teaching-map">看教学知识点 <span aria-hidden="true">↓</span></a>
          </div>
          <p className="teacher-source-note">案例依据：蔡临宁《战略管理》课件第 9–13 页；具体人物、日期与分支结果属于互动改编。</p>
        </div>
        <figure className="teacher-hero-figure">
          <img src="/images/decision-stills/P06.jpg" alt="勘探帐篷里，三名队友等待队长作出返程决定" />
          <figcaption><b>游戏中的第一次抉择</b><span>期权还剩十四天。山路快而险，山谷稳却慢；两天后能得到更多天气信息。</span></figcaption>
        </figure>
      </section>

      <section className="teacher-thesis teacher-section" aria-labelledby="teacher-thesis-title">
        <div className="teacher-section-label"><span>01 / 设计出发点</span><i aria-hidden="true" /></div>
        <div className="teacher-thesis-grid">
          <h2 id="teacher-thesis-title">战略抉择的难处，<br />发生在结果出来之前。</h2>
          <div>
            <p>课件案例同时给出有限期限、路线风险、伤手和可等待的天气信息。学生必须先回答“目标是什么、哪些代价能接受”，才能比较方案。</p>
            <p>因此，游戏把信息按时间释放：选路时看不到结局；行动后，环境和队伍能力可能变化；复盘时再把当时的信息与事后的结果分开。课堂讨论就有了可追问的具体决策，而不只是一句“我会选最快的路”。</p>
          </div>
        </div>
        <ol className="teacher-causal-loop" aria-label="互动剧情的因果循环">
          <li><b>判断</b><span>依据当时信息选路</span></li>
          <li><b>执行</b><span>真的出发、等待或退出</span></li>
          <li><b>回响</b><span>时间、伤情与退路被保留</span></li>
          <li><b>再判断</b><span>新条件下重估原方案</span></li>
        </ol>
      </section>

      <section className="teacher-world teacher-section" aria-labelledby="teacher-world-title">
        <div className="teacher-section-label"><span>02 / 同一个世界</span><i aria-hidden="true" /></div>
        <div className="teacher-world-panel">
          <div className="teacher-world-intro">
            <p className="teacher-kicker">统一天气 · 不同处境</p>
            <h2 id="teacher-world-title">暴风只有一场，<br />决策处境却不一样。</h2>
            <p>剧情不为每个选项重新发明天气。玩家先前的选择决定了暴风来时队伍在哪里、左手怎样、还剩多少时间。外部环境相同，战略可行性仍会不同。</p>
          </div>
          <div className="teacher-world-positions">
            <p><b>A</b><span>已在山路，直接面对风雪、伤手与撤回成本。</span></p>
            <p><b>B</b><span>位于谷地，高地风险较低，期限压力继续累积。</span></p>
            <p><b>C</b><span>留在营地获得天气信息，也支付了等待时间。</span></p>
            <p><b>D</b><span>留营避开暴风；天气后来改善，又出现重新判断的机会。</span></p>
          </div>
          <p className="teacher-world-memory"><b>场景可以汇合，历史不会清零。</b>翻山后撤回、等信息后出发、长期等待后改变主意，即使后来走到同一地点，也带着不同的日期、身体状态和已付代价。</p>
        </div>
      </section>

      <section className="teacher-map teacher-section" id="teaching-map" aria-labelledby="teaching-map-title">
        <div className="teacher-section-label"><span>03 / 情境与知识点</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">先兑现收益，再出现代价</p><h2 id="teaching-map-title">四条路线，让学生经历四种战略难题。</h2></div>
          <p>每条起始选择都先证明自己有道理。后续难题来自这次选择真正留下的状态，而不是突然加一场无关事故。</p>
        </div>
        <div className="teacher-route-list">
          {routes.map((route) => (
            <article className="teacher-route" key={route.mark}>
              <div className="teacher-route-image"><img src={route.image} alt={`${route.title}路线的游戏画面`} loading="lazy" /></div>
              <div className="teacher-route-name"><span>{route.mark}</span><h3>{route.title}</h3></div>
              <div className="teacher-route-causality"><p><b>先兑现</b><span>{route.benefit}</span></p><p><b>后回响</b><span>{route.echo}</span></p></div>
              <div className="teacher-route-learning"><b>课件核心</b><p>{route.core}</p><b>互动延伸</b><p>{route.extension}</p><b>课堂追问</b><p>{route.question}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="teacher-knowledge teacher-section" aria-labelledby="teacher-knowledge-title">
        <div className="teacher-section-label"><span>04 / 课程关系</span><i aria-hidden="true" /></div>
        <h2 id="teacher-knowledge-title">一层对应课件核心，一层来自互动延伸。</h2>
        <div className="teacher-knowledge-grid">
          <article>
            <span className="teacher-knowledge-index">课件核心 · 第 9–13 页</span>
            <h3>战略没有脱离目标的最优路线</h3>
            <p>明确目标与权衡取舍；在不确定性和时间压力下，比较外部环境与自身资源、能力是否匹配；看见选择的不可逆性。</p>
            <small>游戏中的证据：起始选路、暴风与伤手、期限变化、是否按期到达。</small>
          </article>
          <article>
            <span className="teacher-knowledge-index">互动体验 · 课程延伸</span>
            <h3>原先合理的行动，何时需要改变</h3>
            <p>等待信息有成本；越晚调整，可能越贵；已经投入的时间不能单独成为继续的理由；时间与体力缓冲也是未来选择空间。</p>
            <small>游戏中的证据：Day 2 的信息判断、Day 6 的谷地进度、山路回头点、安全等待后的新窗口。</small>
          </article>
        </div>
        <p className="teacher-knowledge-rule"><b>概念在复盘时出现。</b>剧情中的队友只谈天气、路线、手伤和时间；学生先经历取舍，再用战略管理术语解释它。这样人物说话仍像人物，课堂解释也有了具体证据。</p>
      </section>

      <section className="teacher-example teacher-section" aria-labelledby="teacher-example-title">
        <div className="teacher-section-label"><span>05 / 一个教学回合</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">以山谷路线为例</p><h2 id="teacher-example-title">同样是提速，何时决定会改变代价。</h2></div>
          <p>这段分支把“路线稳妥”与“目标可达”分开，让学生讨论调整发生的时间，而不只讨论最终有没有赶上。</p>
        </div>
        <div className="teacher-example-timeline">
          <article><span>出发时</span><h3>选择山谷</h3><p>避开高地风雪，但原本预计就要走两到三周。期限只有十四天。</p></article>
          <article><span>第六天</span><h3>进度亮起警报</h3><p>前六天没有事故；按当前节奏还需约十天，期限却只剩约八天。学生要决定是否从现在开始提高强度。</p></article>
          <article><span>第九天</span><h3>再次判断</h3><p>较早提速的队伍已经累了；一直稳走的队伍面临更急的冲刺。相同动作的可行性与成本发生变化。</p></article>
        </div>
        <p className="teacher-example-question"><b>教师可追问</b>“你在第六天掌握了什么证据？如果到第九天才改变节奏，额外代价来自哪里？”</p>
        <p className="teacher-example-transfer"><b>迁移到企业</b>一个订单项目生产稳定，但按现有产能将晚于客户截止日期。学生需要说明何时调整产能、范围或交期，以及这样调整会牺牲什么。</p>
      </section>

      <section className="teacher-classroom teacher-section" id="classroom" aria-labelledby="teacher-classroom-title">
        <div className="teacher-section-label"><span>06 / 课堂使用</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">可直接带进讨论</p><h2 id="teacher-classroom-title">从一次选择，走到一次有依据的复盘。</h2></div>
          <p>教师可以先让学生独立玩一条路径，再让不同路径的小组比较。讨论的重点是当时掌握什么、接受什么代价、何时更新判断。</p>
        </div>
        <div className="teacher-steps">
          {teachingSteps.map((step) => (
            <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p></article>
          ))}
        </div>
        <div className="teacher-evidence">
          <div><span className="teacher-kicker">可观察的学习证据</span><h3>老师能看到学生怎么想，<br />不只看到走到了哪里。</h3></div>
          <ul>
            <li>学生在选择前填写的理由（如有）与最终报告中的目标陈述</li>
            <li>各决策点当时已知的信息、选择和代价</li>
            <li>最终报告中的战略概念联系与企业情境迁移题</li>
          </ul>
        </div>
      </section>

      <section className="teacher-boundary teacher-section" aria-labelledby="teacher-boundary-title">
        <div className="teacher-section-label"><span>07 / 使用边界</span><i aria-hidden="true" /></div>
        <div className="teacher-boundary-grid">
          <h2 id="teacher-boundary-title">结果用于追问，不用于给人贴标签。</h2>
          <p>游戏的具体天气、到达时间、角色与办理细节是互动叙事设定，不是教师原案给定的概率或真实法律规则。结局只说明本局条件下发生了什么；一次按期到达不能证明决策普遍正确，一次超期也不能直接判定学生能力。教师仍需结合学生写下的理由和课堂讨论作判断。</p>
        </div>
      </section>

      <footer className="teacher-footer">
        <div><span>最后十四天</span><p>战略管理互动案例 · 教师说明</p></div>
        <a href="/">打开游戏，亲自作一次选择 <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  )
}
