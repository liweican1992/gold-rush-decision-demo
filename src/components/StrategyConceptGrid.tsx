import type { LatestDecisionReport } from '../demo/latestReport'
import './strategyReport.css'

export function StrategyConceptGrid({ lessons }: { lessons: LatestDecisionReport['lessons'] }) {
  return <div className="strategy-concept-grid">
    {lessons.map(lesson => <section className="strategy-concept" key={lesson.id}>
      <small>{lesson.origin}</small><h3>{lesson.title}</h3><p>{lesson.definition}</p>
      <div className="strategy-concept-evidence"><b>本局证据</b>{lesson.evidence.map(item => <p key={item.optionId}>{item.observation}</p>)}</div>
      <div className="strategy-transfer"><b>换到企业中</b><p>{lesson.transfer}</p></div>
    </section>)}
  </div>
}
