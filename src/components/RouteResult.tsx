import type { ChoiceRecord } from '../demo/flow'
import type { EndingNode } from '../demo/story'

export function RouteResult({
  ending,
  decisions,
  videoFailed,
  onBackToRouteChoice,
  onBackToPrimaryChoice,
  onRestart,
}: {
  ending: EndingNode
  decisions: ChoiceRecord[]
  videoFailed: boolean
  onBackToRouteChoice: () => void
  onBackToPrimaryChoice: () => void
  onRestart: () => void
}) {
  return (
    <section className="route-result">
      <div className="route-result-mark">{ending.resultId}</div>
      <div className="route-result-copy">
        <span>战略结果 · {decisions.map((decision) => decision.label).join(' → ')}</span>
        <h1>{ending.title}</h1>
        <p>{ending.summary}</p>

        <div className="route-result-metrics route-result-metrics-four">
          <div><small>时间</small><strong>{ending.metrics.days}</strong></div>
          <div><small>人员状态</small><strong>{ending.metrics.people}</strong></div>
          <div><small>团队能力</small><strong>{ending.metrics.capability}</strong></div>
          <div><small>矿权状态</small><strong>{ending.metrics.claim}</strong></div>
        </div>

        <blockquote>{ending.lesson}</blockquote>
        <div className="reflection-question">
          <small>课堂复盘</small>
          <strong>{ending.reflectionQuestion}</strong>
        </div>

        {videoFailed && (
          <div className="material-notice">
            <i />
            本节点视频加载失败，已使用剧情概要继续完成演示。
          </div>
        )}

        <div className="demo-actions">
          <button className="demo-action-primary" type="button" onClick={onBackToRouteChoice}>返回本路线选择</button>
          <button className="demo-action-quiet" type="button" onClick={onBackToPrimaryChoice}>返回一级选择</button>
          <button className="demo-action-quiet" type="button" onClick={onRestart}>重新播放开场</button>
        </div>
      </div>
    </section>
  )
}
