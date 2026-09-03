import { useReducer } from 'react'
import { DemoVideoStage } from './components/DemoVideoStage'
import { RouteChoiceOverlay } from './components/RouteChoiceOverlay'
import { RouteResult } from './components/RouteResult'
import { StoryVideoPlaceholder } from './components/StoryVideoPlaceholder'
import { INITIAL_DEMO_STATE, reduceDemoState } from './demo/flow'
import {
  INITIAL_HUD,
  INTRO_VIDEO,
  PRIMARY_CHOICE_ID,
  getChoiceBackdropVideo,
  getNode,
  type StoryMetrics,
} from './demo/story'

function DemoHud({ metrics = INITIAL_HUD }: { metrics?: StoryMetrics }) {
  return (
    <div className="demo-hud" aria-label="当前状态">
      <div><span>矿权期限</span><strong>{metrics.days}</strong></div>
      <div><span>人员状态</span><strong>{metrics.people}</strong></div>
      <div><span>团队能力</span><strong>{metrics.capability}</strong></div>
      <div><span>矿权状态</span><strong>{metrics.claim}</strong></div>
    </div>
  )
}

function stageLabel(nodeId: string, kind?: string) {
  if (nodeId === 'launch') return '启动'
  if (nodeId === 'intro') return '共同剧情'
  if (nodeId === PRIMARY_CHOICE_ID) return '一级路线选择'
  if (kind === 'choice') return '路线局面决策'
  if (kind === 'ending') return '战略复盘'
  return `${nodeId} · 剧情节点`
}

export default function MainlineDemo() {
  const [state, dispatch] = useReducer(reduceDemoState, INITIAL_DEMO_STATE)
  const node = state.currentNodeId === 'launch' ? undefined : getNode(state.currentNodeId)
  const ending = node?.kind === 'ending' ? node : undefined

  const restart = () => {
    dispatch({ type: 'RESTART' })
  }

  const backToPrimaryChoice = () => {
    dispatch({ type: 'BACK_TO_CHOICE', choiceNodeId: PRIMARY_CHOICE_ID })
  }

  if (!node) {
    return (
      <main className="mainline-launch">
        <div className="launch-shade" />
        <div className="launch-content">
          <span>STRATEGY CLASS · INTERACTIVE MOVIE</span>
          <h1>淘金决策局</h1>
          <p>一段共同剧情 · 四条战略路线 · 十二种可比较结果</p>
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

      <DemoHud metrics={ending?.metrics} />

      <section className="demo-stage">
        {node.id === 'intro' && (
          <DemoVideoStage
            badge="AI剧情 · 公共开场"
            src={INTRO_VIDEO}
            subtitles={node.kind === 'video' ? node.subtitles : []}
            onEnded={() => dispatch({ type: 'VIDEO_ENDED' })}
            onError={() => dispatch({ type: 'VIDEO_FAILED' })}
          >
          </DemoVideoStage>
        )}

        {node.kind === 'choice' && (
          <DemoVideoStage
            badge={`${node.id === PRIMARY_CHOICE_ID ? '公共开场' : `${node.id.replace('choice-', '')}路线`} · 局面停留`}
            src={getChoiceBackdropVideo(node.id)}
            freezeAtEnd
            onEnded={() => undefined}
            onError={() => undefined}
          >
            <RouteChoiceOverlay
              choice={node}
              onSelect={(optionId) => dispatch({ type: 'SELECT_OPTION', optionId })}
            />
          </DemoVideoStage>
        )}

        {node.kind === 'video' && node.id !== 'intro' && node.video && (
          <DemoVideoStage
            badge={`${node.id} · 真实剧情`}
            src={node.video}
            subtitles={node.subtitles}
            onEnded={() => dispatch({ type: 'VIDEO_ENDED' })}
            onError={() => dispatch({ type: 'VIDEO_FAILED' })}
          />
        )}

        {node.kind === 'video' && node.id !== 'intro' && !node.video && (
          <StoryVideoPlaceholder
            nodeId={node.id}
            title={node.title}
            synopsis={node.synopsis}
            expectedVideo={node.expectedVideo}
            onContinue={() => dispatch({ type: 'VIDEO_FAILED' })}
          />
        )}

        {ending && (
          <RouteResult
            ending={ending}
            decisions={state.decisions}
            videoFailed={state.failedVideoIds.includes(ending.resultId)}
            onBackToRouteChoice={() => dispatch({ type: 'BACK_TO_CHOICE', choiceNodeId: ending.parentChoiceId })}
            onBackToPrimaryChoice={backToPrimaryChoice}
            onRestart={restart}
          />
        )}
      </section>

      <footer className="demo-footer">
        <span><i /> 固定两层分支 · 4条路线 · 12种结果</span>
        {node.id !== PRIMARY_CHOICE_ID && (
          <button type="button" onClick={backToPrimaryChoice}>直接看一级选择</button>
        )}
      </footer>
    </main>
  )
}
