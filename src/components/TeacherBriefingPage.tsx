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
  { number: '01', title: '先独立选择', detail: '选路前，请学生写下最想保住的目标和不能突破的底线，不预先告诉他们哪条路更好。' },
  { number: '02', title: '遇到变化再问', detail: '天气、伤手或进度变化时，问一句：原计划的依据还在吗？坚持和改路各要付出什么？' },
  { number: '03', title: '拿报告举证', detail: '比较不同路径的当时信息、行动代价和概念卡，再讨论同样的问题放到企业里该怎么判断。' },
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
          <h1 id="teacher-title">先作决定，<br /><span>再讨论战略。</span></h1>
          <p className="teacher-hero-lead">学生扮演勘探队长：发现疑似金矿，但土地购买机会只剩十四天，必须赶回镇上亲自确认。翻山更快却有风险，走山谷更稳却可能误期；等待天气消息也会耗掉时间。</p>
          <div className="teacher-hero-summary" aria-label="教学速览">
            <p><b>学生做什么</b><span>选路，并随天气、伤手和进度变化重新判断。</span></p>
            <p><b>练什么</b><span>目标取舍、环境与能力匹配、动态调整。</span></p>
            <p><b>老师怎么用</b><span>先独立体验，再用结局报告讨论当时的依据。</span></p>
          </div>
          <div className="teacher-hero-actions">
            <a className="teacher-primary-link" href="/">试玩一条路线 <span aria-hidden="true">↗</span></a>
            <a className="teacher-text-link" href="#report-example">看结局报告样例 <span aria-hidden="true">↓</span></a>
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
        <p className="teacher-report-context">示例：先等天气，五天后改走山路，再放慢速度。下面四张卡直接取自这局的结局报告。</p>
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
          <h2 id="teacher-thesis-title">每次选择，都只能依据当时知道的事。</h2>
          <div>
            <p>出发时，学生只知道期限、路线风险和左手伤情。天气、进度和体力随后变化，他们要不断判断原计划是否还合适。报告按每次选择当时已知的信息复盘，避免只凭结局倒推对错。</p>
          </div>
        </div>
        <ol className="teacher-causal-loop" aria-label="互动剧情的因果循环">
          <li><b>先选择</b><span>按已知信息选路</span></li>
          <li><b>情况变化</b><span>天气、伤手和进度改变</span></li>
          <li><b>再选择</b><span>坚持、放慢、改路或退出</span></li>
          <li><b>看报告</b><span>用当时证据解释行动</span></li>
        </ol>
      </section>

      <section className="teacher-world teacher-section" aria-labelledby="teacher-world-title">
        <div className="teacher-section-label"><span>03 / 为什么有四条路线</span><i aria-hidden="true" /></div>
        <div className="teacher-world-panel">
          <div className="teacher-world-intro">
            <p className="teacher-kicker">统一天气 · 不同处境</p>
            <h2 id="teacher-world-title">同一场暴风，<br />四条路遇到的问题不同。</h2>
            <p>暴风发生在同一时间，但队伍所在位置、伤手状态和剩余时间不同。先前的选择，决定了他们这次需要解决什么问题。</p>
          </div>
          <div className="teacher-world-positions">
            <p><b>A</b><span>已在山路，直接面对风雪、伤手与撤回成本。</span></p>
            <p><b>B</b><span>位于谷地，高地风险较低，期限压力继续累积。</span></p>
            <p><b>C</b><span>留在营地获得天气信息，也支付了等待时间。</span></p>
            <p><b>D</b><span>留营避开暴风；天气后来改善，又出现重新判断的机会。</span></p>
          </div>
          <p className="teacher-world-memory"><b>走到同一地点，也不是同一起点。</b>过去花掉的时间、队员状态和回头成本，仍会影响下一步选择。</p>
        </div>
      </section>

      <section className="teacher-map teacher-section" id="teaching-map" aria-labelledby="teaching-map-title">
        <div className="teacher-section-label"><span>04 / 四条路径的课程映射</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">路线 · 代价 · 知识点</p><h2 id="teaching-map-title">四条路线，各自练什么？</h2></div>
          <p>每条路都有先得到的好处和后来遇到的难题。A–D 是路径，不是学生能力评分。</p>
        </div>
        <div className="teacher-route-list">
          {routes.map((route) => (
            <article className="teacher-route" key={route.mark}>
              <div className="teacher-route-image"><img src={route.image} alt={`${route.title}路线的游戏画面`} loading="lazy" /></div>
              <div className="teacher-route-name"><span>{route.mark}</span><h3>{route.title}</h3></div>
              <div className="teacher-route-causality"><p><b>先得到</b><span>{route.benefit}</span></p><p><b>后付出</b><span>{route.echo}</span></p></div>
              <div className="teacher-route-learning"><b>课件核心</b><p>{route.core}</p><b>互动延伸</b><p>{route.extension}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="teacher-classroom teacher-section" id="classroom" aria-labelledby="teacher-classroom-title">
        <div className="teacher-section-label"><span>05 / 课堂使用</span><i aria-hidden="true" /></div>
        <div className="teacher-section-heading">
          <div><p className="teacher-kicker">独立体验 → 举证讨论</p><h2 id="teacher-classroom-title">老师可以这样带一轮。</h2></div>
          <p>先让学生各玩一条路径，再比较报告。重点问：当时知道什么、接受了什么代价、何时有理由改变计划？</p>
        </div>
        <div className="teacher-steps">
          {teachingSteps.map((step) => (
            <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p></article>
          ))}
        </div>
        <div className="teacher-evidence">
          <div><span className="teacher-kicker">课堂讨论材料</span><h3>一份报告，留下可讨论的证据。</h3></div>
          <ul>
            <li>学生自己写下的选择理由；未填写时不推断动机</li>
            <li>每次选择时已知的信息、行动与代价</li>
            <li>对应的课程概念卡和企业情境题</li>
          </ul>
        </div>
      </section>

      <section className="teacher-boundary teacher-section" aria-labelledby="teacher-boundary-title">
        <div className="teacher-section-label"><span>06 / 使用边界</span><i aria-hidden="true" /></div>
        <div className="teacher-boundary-grid">
          <h2 id="teacher-boundary-title">结局用于复盘，不给学生打分。</h2>
          <p>人物、天气、到达时间和具体办理流程是互动改编，不是课件给出的必然结果。A–D 路线与结局不代表能力高低；课堂评价应看学生在当时信息下的理由，以及情况变化后如何调整。</p>
        </div>
      </section>

      <footer className="teacher-footer">
        <div><span>最后十四天</span><p>战略管理互动案例 · 教师说明</p></div>
        <a href="/">打开游戏，亲自作一次选择 <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  )
}
