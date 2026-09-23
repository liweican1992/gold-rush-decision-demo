import { useEffect, useState } from 'react'
import { buildLatestDecisionReport, EMPTY_REFLECTION, exportLatestReport, type ReportReflection } from '../demo/latestReport'
import type { LatestDecision } from '../demo/latestStory'
import './strategyReport.css'
import { branchForDecisions } from '../demo/latestStory'
import type { AttemptRecord } from '../demo/storySession'
import { StrategyConceptGrid } from './StrategyConceptGrid'

export function LatestDecisionReport({ decisions, onRestart, attemptId = "preview", archives = [], explored = false }: { decisions: LatestDecision[]; onRestart: () => void; attemptId?: string; archives?: AttemptRecord[]; explored?: boolean }) {
  const report = buildLatestDecisionReport(decisions)
  return <ReportBody key={attemptId + report.pathKey} report={report} onRestart={onRestart} attemptId={attemptId} archives={archives} explored={explored} />
}

function ReportBody({ report, onRestart, attemptId, archives, explored }: { report: ReturnType<typeof buildLatestDecisionReport>; onRestart: () => void; attemptId: string; archives: AttemptRecord[]; explored: boolean }) {
  const storageKey = 'gold-strategy-reflection-v2:' + attemptId + ':' + report.pathKey
  const [reflection, setReflection] = useState<ReportReflection>(() => {
    try {
      if (typeof window === 'undefined') return { ...EMPTY_REFLECTION }
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')
      return Object.fromEntries(Object.keys(EMPTY_REFLECTION).map(key => [key, typeof saved?.[key] === 'string' ? saved[key] : ''])) as ReportReflection
    } catch { return { ...EMPTY_REFLECTION } }
  })
  const [notice, setNotice] = useState('')
  useEffect(() => {
    try {
      if (Object.values(reflection).some(Boolean)) {
        window.localStorage.setItem(storageKey, JSON.stringify(reflection))
        setNotice('复盘草稿已保存在此浏览器')
      } else {
        window.localStorage.removeItem(storageKey)
        setNotice('')
      }
    } catch { setNotice('浏览器暂时无法保存，请下载学习复盘保留回答。') }
  }, [reflection, storageKey])

  const download = () => {
    const blob = new Blob([exportLatestReport(report, reflection), `\n\n## 尝试记录\n${explored ? '本次为对照探索，曾返回或重选。' : '本次为首次行动。'}\n`, ...archives.map((a, i) => `\n### 保留记录 ${i + 1}${a.completed ? '（已见结局）' : '（中途返回）'}\n${a.decisions.map(d => `${d.label}；选择前记录：${d.reason || '未填写'}`).join('\n')}\n${a.completed ? branchForDecisions(a.decisions)?.completion ?? '' : ''}\n`)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '最后十四天_战略学习复盘.md'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const input = (key: keyof ReportReflection, label: string, placeholder: string) => (
    <label className="strategy-reflection-field" htmlFor={'reflection-' + key}>
      <strong>{label}</strong>
      <textarea id={'reflection-' + key} value={reflection[key]} placeholder={placeholder} rows={3}
        onChange={event => setReflection(previous => ({ ...previous, [key]: event.target.value }))} />
    </label>
  )

  return (
    <article id="latest-decision-report" className="latest-decision-report strategy-learning-report" aria-label="战略管理学习复盘">
      <header className="strategy-report-intro">
        <span>走完这一路，你学到了什么</span>
        <h2>{report.title}</h2>
        <p>{report.summary}</p>
        <p className="strategy-attempt-label">{explored ? '再次尝试 · 你曾返回或重选，之前的选择已保留' : '首次行动记录'}</p>
      </header>
      <nav className="strategy-report-nav" aria-label="复盘章节">
        <a href="#strategy-evidence">选择与判断</a><a href="#strategy-concepts">课程知识联系</a>
        <a href="#strategy-comparison">换一种选择</a><a href="#strategy-reflection">写下我的复盘</a>
      </nav>

      <section className="strategy-section" id="strategy-evidence" aria-labelledby="evidence-heading">
        <header><span>01 / 回到当时</span><h2 id="evidence-heading">你的选择，依据是什么？</h2><p>回到作决定的那一刻：你知道什么，又为什么这样选？</p></header>
        <ol className="strategy-evidence-list">
          {report.decisionEvidence.map((item, index) => <li key={item.optionId}>
            <header><span>{String(index + 1).padStart(2, '0')}</span><div><small>{item.stage}</small><h3>{item.choice}</h3></div></header>
            <dl>
              <div><dt>当时信息</dt><dd>{item.known}</dd></div>
              <div><dt>选择前记录</dt><dd>{item.reason}</dd></div>
              <div><dt>行动观察</dt><dd>{item.observation}</dd></div>
              <div><dt>战略分析</dt><dd>{item.analysis}</dd></div>
              {item.outcome && <div><dt>事后结果</dt><dd>{item.outcome}</dd></div>}
            </dl>
            <p className="strategy-discuss"><b>值得追问</b>{item.question}</p>
          </li>)}
        </ol>
      </section>

      <section className="strategy-section" id="strategy-concepts" aria-labelledby="concepts-heading">
        <header><span>02 / 联系课程</span><h2 id="concepts-heading">你刚才经历了哪些战略问题？</h2><p>每个概念都对应本局行动，再延伸到企业决策。</p></header>
        <StrategyConceptGrid lessons={report.lessons} />
      </section>

      <section className="strategy-section" id="strategy-comparison" aria-labelledby="comparison-heading">
        <header><span>03 / 检验判断</span><h2 id="comparison-heading">结果之外，还有哪些代价？</h2></header>
        <p className="strategy-evaluation">{report.evaluation}</p>
        {report.alternatives.length > 0 ? <details className="strategy-alternatives">
          <summary>保留前面的选择，只改变最后一步，会怎样？</summary>
          <p>以下比较采用游戏既定剧情。它展示取舍，不代表现实中一定发生，也不意味着其中一项是标准答案。</p>
          <div className="strategy-comparison-scroll"><table>
            <caption>相同前情下，最后一次选择的对照</caption>
            <thead><tr><th scope="col">最后的行动</th><th scope="col">剧情完成时间</th><th scope="col">人员状态与取舍</th></tr></thead>
            <tbody>
              <tr><th scope="row">{report.decisionEvidence.at(-1)?.choice}<small>你的本局选择</small></th><td>{report.branch.completion}</td><td>{report.branch.people}<br />{report.branch.tradeoff}</td></tr>
              {report.alternatives.map(item => <tr key={item.choice}><th scope="row">{item.choice}</th><td>{item.completion}</td><td>{item.people}<br />{item.tradeoff}</td></tr>)}
            </tbody>
          </table></div>
        </details> : <p className="strategy-comparison-note">其他选择还会进入新的决策，无法只改最后一步就直接对照结局。可以重新体验，再比较不同的判断过程。</p>}
        <div className="strategy-behavior">
          <h3>本局行动回顾</h3>
          <ul>{report.profile.observations.map(item => <li key={item}>{item}</li>)}</ul>
          <p>{report.profile.boundary}</p>
        </div>
      </section>

      {archives.length > 0 && <section className="strategy-section">
        <header><h2>首次选择与后续探索</h2><p>返回不会抹去之前的选择。以下记录保留当时填写的理由。</p></header>
        {archives.map((attempt, index) => <details className="strategy-alternatives" key={`${attempt.id}-${index}`}>
          <summary>保留记录 {index + 1} · {attempt.completed ? '已查看结局' : '中途返回'}</summary>
          <ol>{attempt.decisions.map(d => <li key={d.optionId}><strong>{d.label}</strong><p>选择前记录：{d.reason || '未填写'}</p></li>)}</ol>
          {attempt.completed && <p>该次结果：{branchForDecisions(attempt.decisions)?.completion}</p>}
        </details>)}
      </section>}
      <section className="strategy-section strategy-reflection" id="strategy-reflection" aria-labelledby="reflection-heading">
        <header><span>04 / 形成你的判断</span><h2 id="reflection-heading">下次遇到类似问题，你会怎么判断？</h2><p>用自己的话补足选择理由。回答按本次尝试保存在此浏览器，也可下载用于课堂讨论。</p></header>
        <div className="strategy-reflection-grid">
          {input('priority', '这一路，我最想保住什么？', '明确目标和不能突破的底线，并说明愿意放弃什么。')}
          {input('reason', '回头看，哪次决定最值得再想一想？', report.decisionEvidence.at(-1)?.question ?? '请引用当时的一条信息。')}
          {input('trigger', '出现什么情况，我会改变计划？', '如果出现……，我会在……之前改为……。')}
        </div>
        <div className="strategy-transfer-exercise"><small>迁移练习 · 不再是雪山</small><p>{report.scenario}</p>
          {input('transfer', report.transferPrompt, '用本局的目标、能力、信息或时间约束来解释，不只写“继续／退出”。')}
        </div>
        <div className="strategy-reflection-actions"><button type="button" onClick={download}>下载学习复盘 ↓</button><span role="status">{notice || '回答可选填；空白部分会保留为待讨论问题。'}</span></div>
      </section>
      <p className="latest-report-disclaimer">{report.disclaimer}</p>
      <button className="latest-report-restart" type="button" onClick={onRestart}>换一种选择，再比较 <span>↻</span></button>
    </article>
  )
}
