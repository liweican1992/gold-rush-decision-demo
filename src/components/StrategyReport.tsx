import type { ChoiceRecord } from '../demo/flow'
import {
  ENDING_OUTCOMES,
  PROFILE_DIMENSIONS,
  buildStrategyReport,
  type ObjectiveState,
  type StrategyProgress,
} from '../demo/strategy'

const OBJECTIVE_LABELS: Record<keyof ObjectiveState, string> = {
  time_remaining: '剩余时间',
  health: '人员健康',
  execution: '执行能力',
  information: '信息质量',
  control: '控制空间',
  capital_recovery: '资本回收',
}

const PROFILE_KEYS = Object.keys(PROFILE_DIMENSIONS) as Array<keyof typeof PROFILE_DIMENSIONS>

function objectivePercent(key: keyof ObjectiveState, value: number) {
  return key === 'time_remaining' ? Math.min(100, Math.round((value / 14) * 100)) : value
}

function formatProfileEvidence(profile: Record<keyof typeof PROFILE_DIMENSIONS, number>) {
  return PROFILE_KEYS.map((key) => `${key} ${profile[key] > 0 ? '+' : ''}${profile[key]}`).join(' · ')
}

export function StrategyReport({
  progress,
  decisions,
  onRestart,
}: {
  progress: StrategyProgress
  decisions: ChoiceRecord[]
  onRestart: () => void
}) {
  const report = buildStrategyReport(progress)
  const outcome = report.outcome ? ENDING_OUTCOMES[report.outcome] : null

  return (
    <section className="strategy-report">
      <header className="strategy-report-hero">
        <div>
          <span>STRATEGY PROFILE · {report.validDecisionCount} 次有效选择 · 置信度 {report.confidence}</span>
          <h1>{outcome?.name ?? '结局尚未解析'}</h1>
          <p>{outcome?.result ?? '当前状态未命中确定性结局，请返回检查最后一次承诺。'}</p>
        </div>
        {report.confidence !== '低' && (
          <div className="strategy-style-seal">
            <small>本轮主要倾向</small>
            <strong>{report.primaryStyle}</strong>
          </div>
        )}
      </header>

      <div className="strategy-objective-grid">
        {(Object.entries(progress.objective) as Array<[keyof ObjectiveState, number]>).map(([key, value]) => (
          <div key={key}>
            <small>{OBJECTIVE_LABELS[key]}</small>
            <strong>{key === 'time_remaining' ? `${value} 天` : value}</strong>
            <i
              className="objective-state-bar"
              role="progressbar"
              aria-label={OBJECTIVE_LABELS[key]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={objectivePercent(key, value)}
            ><b style={{ width: `${objectivePercent(key, value)}%` }} /></i>
          </div>
        ))}
      </div>

      <div className="strategy-report-columns">
        {report.confidence !== '低' ? <section className="strategy-report-card">
          <span>决策画像</span>
          <h2>{report.summary}</h2>
          <div className="profile-bars">
            {(Object.entries(report.profileScores) as Array<[keyof typeof PROFILE_DIMENSIONS, number]>).map(([key, score]) => (
              <div key={key}>
                <div><small>{PROFILE_DIMENSIONS[key]}</small><strong>{score}</strong></div>
                <i
                  role="progressbar"
                  aria-label={PROFILE_DIMENSIONS[key]}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={score}
                ><b style={{ width: `${score}%` }} /></i>
              </div>
            ))}
          </div>
        </section> : <section className="strategy-report-card insufficient-profile">
          <span>画像证据不足</span>
          <h2>当前仅记录选择过程；完成至少四次有效选择后，才生成正式战略画像。</h2>
        </section>}

        <section className="strategy-report-card evidence-card">
          <span>证据校验</span>
          <h2>支持证据</h2>
          <ul>{report.supportingEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
          <h2>反向证据</h2>
          <ul>{report.counterEvidence.length > 0
            ? report.counterEvidence.map((item) => <li key={item}>{item}</li>)
            : <li>本轮没有出现明显反向证据，结论仍只适用于当前情境。</li>}
          </ul>
        </section>
      </div>

      <section className="strategy-report-card knowledge-replay">
        <span>知识点回放</span>
        <div>
          {report.knowledgeReplay.map((item, index) => (
            <article key={`${index}-${item.choice}`}>
              <b>{index + 1}</b>
              <h3>{item.choice}</h3>
              <p>{item.knowledge}</p>
              <small>
                节点：{item.nodeId}<br />
                目标：{item.goal}<br />
                取舍：{item.sacrifice}<br />
                画像证据：{formatProfileEvidence(item.profileEvidence)}<br />
                选择关联：{item.choiceConnection}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="strategy-report-card reflection-list">
        <span>课堂复盘</span>
        {report.reflectionQuestions.map((question, index) => <p key={question}><b>0{index + 1}</b>{question}</p>)}
      </section>

      {decisions.length > 0 && <p className="strategy-path">本轮路径：{decisions.map((item) => item.label).join(' → ')}</p>}
      <button className="strategy-restart" type="button" onClick={onRestart}>重新开始一轮 <span>↻</span></button>
    </section>
  )
}
