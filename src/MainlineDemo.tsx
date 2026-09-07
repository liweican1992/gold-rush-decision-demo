import { useReducer } from 'react'
import { DemoVideoStage } from './components/DemoVideoStage'
import { RouteChoiceOverlay } from './components/RouteChoiceOverlay'
import { StoryVideoPlaceholder } from './components/StoryVideoPlaceholder'
import { StrategyReport } from './components/StrategyReport'
import { INITIAL_DEMO_STATE, reduceDemoState } from './demo/flow'
import {
  PRIMARY_CHOICE_ID,
  getChoiceBackdropFrame,
  getChoiceBackdropVideo,
  getChoiceOptions,
  getNode,
  type StoryNode,
} from './demo/story'
import type { StrategyProgress } from './demo/strategy'

function DemoHud({ progress }: { progress: StrategyProgress }) {
  const { objective } = progress
  return (
    <div className="demo-hud" aria-label="当前状态">
      <div><span>登记期限</span><strong>剩余 {objective.time_remaining} 天</strong></div>
      <div><span>人员健康</span><strong>{objective.health}</strong></div>
      <div><span>执行能力</span><strong>{objective.execution}</strong></div>
      <div><span>信息质量</span><strong>{objective.information}</strong></div>
      <div><span>控制空间</span><strong>{objective.control}</strong></div>
      <div><span>资本回收</span><strong>{objective.capital_recovery}</strong></div>
    </div>
  )
}

function stageLabel(nodeId: string, kind?: string) {
  if (nodeId === 'launch') return '启动'
  if (nodeId === 'intro') return '共同剧情'
  if (nodeId === PRIMARY_CHOICE_ID) return '一级路线选择'
  if (nodeId === 'X1' || nodeId === 'choice-X1') return '资源优先级'
  if (nodeId === 'X2' || nodeId === 'choice-X2') return '组织边界'
  if (nodeId === 'X3' || nodeId === 'choice-X3') return '最终承诺'
  if (nodeId.startsWith('END-F')) return '客观结局'
  if (nodeId === 'REPORT') return '战略画像报告'
  if (kind === 'choice') return '路线局面决策'
  return `${nodeId} · 剧情节点`
}

export function DemoFooterActions({
  nodeKind,
  canGoBack,
  onBack,
  onSkip,
}: {
  nodeKind: StoryNode['kind']
  canGoBack: boolean
  onBack: () => void
  onSkip: () => void
}) {
  return (
    <div className="demo-footer-actions">
      {canGoBack && (
        <button className="demo-footer-back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> 返回上一步
        </button>
      )}
      {nodeKind === 'video' && (
        <button className="demo-footer-skip" type="button" onClick={onSkip}>
          跳过剧情 <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  )
}

export default function MainlineDemo() {
  const [state, dispatch] = useReducer(reduceDemoState, INITIAL_DEMO_STATE)
  const node = state.currentNodeId === 'launch' ? undefined : getNode(state.currentNodeId)

  const restart = () => {
    dispatch({ type: 'RESTART' })
  }

  if (!node) {
    return (
      <main className="mainline-launch">
        <div className="launch-shade" />
        <div className="launch-content">
          <span>STRATEGY CLASS · INTERACTIVE MOVIE</span>
          <h1>淘金决策局</h1>
          <p>五次连续决策 · 四条战略路线 · 六类客观结局</p>
          <button type="button" onClick={() => dispatch({ type: 'START' })}>开始游戏 <strong>→</strong></button>
          <small>桌面端本地演示 · 真实视频开场 · 缺失场景自动降级</small>
        </div>
        <div className="launch-corner">ALASKA<br /><strong>14 DAYS</strong></div>
      </main>
    )
  }

  return (
    <main className={`demo-shell phase-${node.kind}`}>
      <header className="demo-topbar">
        <div className="mainline-brand"><span>AU</span><div><strong>淘金决策局</strong><small>GOLD RUSH DECISION LAB</small></div></div>
        <div className="demo-stage-label"><span>当前环节</span><strong>{stageLabel(node.id, node.kind)}</strong></div>
        <div className="demo-local"><i /> 本地演示</div>
      </header>

      <DemoHud progress={state.strategy} />

      <section className="demo-stage">
        {node.kind === 'video' && node.video && (
          <DemoVideoStage
            badge={node.id === 'intro' ? 'AI剧情 · 公共开场' : node.id.startsWith('END-F') ? `${node.id} · 客观结局` : `${node.id} · 真实剧情`}
            src={node.video}
            subtitles={node.subtitles}
            captionSrc={node.captionSrc}
            onEnded={() => dispatch({ type: 'VIDEO_ENDED' })}
            onError={() => dispatch({ type: 'VIDEO_FAILED' })}
          />
        )}

        {node.kind === 'choice' && (
          <DemoVideoStage
            badge={`${node.id === PRIMARY_CHOICE_ID ? '公共开场' : `${node.id.replace('choice-', '')}路线`} · 局面停留`}
            src={getChoiceBackdropVideo(node.id)}
            freezeAtEnd
            freezeFrameSrc={getChoiceBackdropFrame(node.id)}
            onEnded={() => undefined}
            onError={() => undefined}
          >
            <RouteChoiceOverlay
              choice={{ ...node, options: getChoiceOptions(node, state.strategy) }}
              onSelect={(optionId) => dispatch({ type: 'SELECT_OPTION', optionId, timestamp: new Date().toISOString() })}
            />
          </DemoVideoStage>
        )}

        {node.kind === 'video' && !node.video && (
          <StoryVideoPlaceholder
            nodeId={node.id}
            title={node.title}
            synopsis={node.synopsis}
            expectedVideo={node.expectedVideo}
            onContinue={() => dispatch({ type: 'VIDEO_FAILED' })}
          />
        )}

        {node.kind === 'report' && (
          <StrategyReport
            progress={state.strategy}
            decisions={state.decisions}
            onRestart={restart}
          />
        )}
      </section>

      <footer className="demo-footer">
        <span><i /> 单人决策 · 5次选择 · 6类结局 · 战略画像</span>
        <DemoFooterActions
          nodeKind={node.kind}
          canGoBack={state.history.length > 0}
          onBack={() => dispatch({ type: 'GO_BACK' })}
          onSkip={() => dispatch({ type: 'VIDEO_ENDED' })}
        />
      </footer>
    </main>
  )
}
