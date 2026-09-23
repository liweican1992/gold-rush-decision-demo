import { useEffect } from 'react'
import { buildLatestDecisionReport } from '../demo/latestReport'
import type { LatestDecision } from '../demo/latestStory'
import { StrategyConceptGrid } from './StrategyConceptGrid'
import './teacherBriefing.css'

// A fixed path through the same report builder used after a real playthrough.
const exampleReport = buildLatestDecisionReport([
  { nodeId: 'P06', optionId: 'P06-D', label: '等天气好转后安全返回' },
  { nodeId: 'D03', optionId: 'D3-2', label: '利用这次天气窗口，重新走山路' },
  { nodeId: 'D05', optionId: 'D5-2', label: '放慢脚步，按身体能承受的速度走' },
] satisfies LatestDecision[])

const routes = [
  {
    mark: 'A', image: '/images/decision-stills/A02.jpg', title: '立即翻山',
    benefit: '前段确实更快，争取到时间余量。',
    echo: '暴风与伤手叠加；走得越深，折返越贵。',
    core: '环境与自身能力匹配、不可逆性',
    extension: '承诺升级与已投入成本',
  },
  {
    mark: 'B', image: '/images/decision-stills/B02.jpg', title: '沿山谷前进',
    benefit: '高地暴露较低，队伍稳定前行。',
    echo: '正常节奏赶不上期限；提速又要压缩休息。',
    core: '目标与取舍、时间压力',
    extension: '调整时机与缓冲价值',
  },
  {
    mark: 'C', image: '/images/decision-stills/C02.jpg', title: '先等天气信息',
    benefit: '两天后确认暴风，再等一天可进一步判断山口。',
    echo: '信息仍非通行保证，等待已消耗行动时间。',
    core: '不确定性、时间与竞争压力',
    extension: '信息价值与停止等待',
  },
  {
    mark: 'D', image: '/images/decision-stills/D03.jpg', title: '等待安全返回',
    benefit: '避开最强风雪，左手与体力得到恢复。',
    echo: '天气改善时已等了五天，重新翻山的余量很少。',
    core: '目标优先级、价值观与权衡',
    extension: '战略一致性与动态调整',
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
          <a href="#report-example">报告样例</a>
          <a href="#teaching-map">路径与概念</a>
          <a href="#classroom">课堂使用</a>
          <a className="teacher-header-play" href="/">打开游戏 <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="teacher-hero" aria-labelledby="teacher-title">
        <div className="teacher-hero-copy">
          <p className="teacher-kicker">战略管理 · 互动案例教学说明</p>
          <h1 id="teacher-title">让学生先作判断，<br /><span>再讨论战略。</span></h1>
          <p className="teacher-hero-lead">把课件中的阿拉斯加土地购买期权案例，变成一场有期限、有代价的第一人称决策。玩完后，报告会将本局选择映射到课程概念、行动证据和企业情境。</p>
          <div className="teacher-hero-actions">
            <a className="teacher-primary-link" href="/">进入游戏体验 <span aria-hidden="true">↗</span></a>
            <a className="teacher-text-link" href="#report-example">看报告里的课程关联 <span aria-hidden="true">↓</span></a>
          </div>
          <p className="teacher-source-note">案例依据：蔡临宁《战略管理》课件第 9–13 页；具体人物、日期与分支结果属于互动改编。</p>
        </div>
        <figure className="teacher-hero-figure">
          <img src="/images/decision-stills/P06.jpg" alt="勘探帐篷里，三名队友等待队长作出返程决定" />
          <figcaption><b>游戏中的第一次抉择</b><span>期权还剩十四天。山路快而险，山谷稳却慢；两天后能得到更多天气信息。</span></figcaption>
        </figure>
      </section>

      <section className="teacher-report-sample teacher-section" id="report-example" aria-labelledby="teacher-report-title">
        <div className="teacher-section-label"><span>01 / 报告中的课程关联</span><i aria-hidden="true" /></div>
        <p className="teacher-report-context">示例路径：先安全等待 → 第五天天气改善后重新走山路 → 再降低赶路强度。以下四张卡直接使用这条路径最终报告的“联系课程”内容。</p>
        <div className="teacher-report-excerpt">
          <header>
            <span>02 / 联系课程</span>
            <h2 id="teacher-report-title">你刚才经历了哪些战略问题？</h2>
            <p>每个概念都对应本局行动，再延伸到企业决策。</p>
          </header>
          <StrategyConceptGrid lessons={exampleReport.lessons} />
        </div>
      </section>

      <section className="teacher-thesis teacher-section" aria-labelledby="teacher-thesis-title">
        <div className="teacher-section-label"><span>02 / 为什么这样设计</span><i aria-hidden="true" /></div>
        <div className="teacher-thesis-grid">
          <h2 id="teacher-thesis-title">战略抉择的难处，<br />发生在结果出来之前。</h2>
          <div>
            <p>选路时，学生只知道期限、路线风险、伤手和可等待的天气信息。游戏随后按时间释放进度与变化，让他们在新条件下重判。结局报告分开呈现当时信息和事后结果，避免用结果倒推“当初一定选错了”。</p>
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
        <div className="teacher-section-label"><span>03 / 同一个世界</span><i aria-hidden="true" /></div>
        <div className="teacher-world-panel">
          <div className="teacher-world-intro">
            <p className="teacher-kicker">统一天气 · 不同处境</p>
            <h2 id="teacher-world-title">暴风只有一场，<br />决策处境却不一样。</h2>
            <p>天气相同；先前的选择决定暴风来时队伍的位置、伤手状态和剩余时间。同一个外部变化，因此产生不同的战略问题。</p>
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
        <div className="teacher-section-label"><span>04 / 四条路径的课程映射</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">先兑现收益，再出现代价</p><h2 id="teaching-map-title">换一条路，就换一个战略问题。</h2></div>
          <p>报告按实际走过的路径提取概念，不把四条路线当成四档分数。</p>
        </div>
        <div className="teacher-route-list">
          {routes.map((route) => (
            <article className="teacher-route" key={route.mark}>
              <div className="teacher-route-image"><img src={route.image} alt={`${route.title}路线的游戏画面`} loading="lazy" /></div>
              <div className="teacher-route-name"><span>{route.mark}</span><h3>{route.title}</h3></div>
              <div className="teacher-route-causality"><p><b>先兑现</b><span>{route.benefit}</span></p><p><b>后回响</b><span>{route.echo}</span></p></div>
              <div className="teacher-route-learning"><b>课件核心</b><p>{route.core}</p><b>互动延伸</b><p>{route.extension}</p></div>
            </article>
          ))}
        </div>
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
