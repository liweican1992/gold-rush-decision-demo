import { useEffect } from 'react'
import './teacherBriefing.css'

const routes = [
  {
    mark: 'A', image: '/images/decision-stills/A02.jpg', title: '立即翻山',
    choice: '用更高的天气与伤手风险，争取较短的返程时间。',
    concept: '目标与取舍 · 环境和能力匹配 · 已投入成本',
    question: '风变大、手失力以后，原来的“快”还成立吗？',
  },
  {
    mark: 'B', image: '/images/decision-stills/B02.jpg', title: '沿山谷前进',
    choice: '降低高地暴露，但行程更长，期限逐渐变紧。',
    concept: '目标与路径匹配 · 调整时机 · 执行代价',
    question: '一路平稳，如果赶不上期限，还算达成目标吗？',
  },
  {
    mark: 'C', image: '/images/decision-stills/C02.jpg', title: '先等天气信息',
    choice: '获得更清楚的判断，同时消耗不可收回的时间。',
    concept: '不确定性 · 信息价值 · 等待成本',
    question: '多知道一天，足以改变接下来的行动吗？',
  },
  {
    mark: 'D', image: '/images/decision-stills/D03.jpg', title: '等待安全返回',
    choice: '把人员安全放在前面，保留重新判断的可能。',
    concept: '目标优先级 · 机会成本 · 动态调整',
    question: '天气出现新窗口时，坚持原安排还是重新评估？',
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
      </section>

      <section className="teacher-map teacher-section" id="teaching-map" aria-labelledby="teaching-map-title">
        <div className="teacher-section-label"><span>02 / 情境与知识点</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">四种起始策略，不是四个分数</p><h2 id="teaching-map-title">同一个目标，四种不同的取舍。</h2></div>
          <p>每条路线都保留继续、调整或退出的后续判断。下面列的是教学切口，不预告哪条路“正确”。</p>
        </div>
        <div className="teacher-route-list">
          {routes.map((route) => (
            <article className="teacher-route" key={route.mark}>
              <div className="teacher-route-image"><img src={route.image} alt={`${route.title}路线的游戏画面`} loading="lazy" /></div>
              <div className="teacher-route-name"><span>{route.mark}</span><h3>{route.title}</h3></div>
              <p className="teacher-route-choice">{route.choice}</p>
              <div className="teacher-route-learning"><b>对应概念</b><p>{route.concept}</p><b>课堂追问</b><p>{route.question}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="teacher-knowledge teacher-section" aria-labelledby="teacher-knowledge-title">
        <div className="teacher-section-label"><span>03 / 课程关系</span><i aria-hidden="true" /></div>
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
      </section>

      <section className="teacher-example teacher-section" aria-labelledby="teacher-example-title">
        <div className="teacher-section-label"><span>04 / 一个教学回合</span><i aria-hidden="true" /></div>
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
      </section>

      <section className="teacher-classroom teacher-section" id="classroom" aria-labelledby="teacher-classroom-title">
        <div className="teacher-section-label"><span>05 / 课堂使用</span><i aria-hidden="true" /></div>
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
        <div className="teacher-section-label"><span>06 / 使用边界</span><i aria-hidden="true" /></div>
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
