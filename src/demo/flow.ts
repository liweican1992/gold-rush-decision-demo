import { getChoiceOptions, getNode, type ChoiceNode, type StoryNodeId } from './story'
import {
  INITIAL_STRATEGY_PROGRESS,
  applyDecision,
  resolveEnding,
  type EndingOutcomeId,
  type StrategyProgress,
} from './strategy'

export type ChoiceRecord = {
  choiceNodeId: ChoiceNode['id']
  optionId: string
  label: string
  timestamp?: string
}

export type DemoState = {
  currentNodeId: 'launch' | StoryNodeId
  history: Array<'launch' | StoryNodeId>
  decisions: ChoiceRecord[]
  failedVideoIds: string[]
  strategy: StrategyProgress
  outcomeId: EndingOutcomeId | null
}

export type DemoEvent =
  | { type: 'START' }
  | { type: 'VIDEO_ENDED' }
  | { type: 'VIDEO_FAILED' }
  | { type: 'SELECT_OPTION'; optionId: string; timestamp?: string }
  | { type: 'BACK_TO_CHOICE'; choiceNodeId: ChoiceNode['id'] }
  | { type: 'GO_BACK' }
  | { type: 'RESTART' }

export const INITIAL_DEMO_STATE: DemoState = {
  currentNodeId: 'launch',
  history: [],
  decisions: [],
  failedVideoIds: [],
  strategy: INITIAL_STRATEGY_PROGRESS,
  outcomeId: null,
}

function moveForward(
  state: DemoState,
  currentNodeId: DemoState['currentNodeId'],
  changes: Partial<Pick<DemoState, 'decisions' | 'failedVideoIds' | 'strategy' | 'outcomeId'>> = {},
): DemoState {
  return {
    ...state,
    ...changes,
    currentNodeId,
    history: [...state.history, state.currentNodeId],
  }
}

function trimDecisionsForChoice(decisions: ChoiceRecord[], nodeId: DemoState['currentNodeId']) {
  if (nodeId === 'launch') return decisions
  const node = getNode(nodeId)
  if (node.kind !== 'choice') return decisions
  const choiceIndex = decisions.findIndex((decision) => decision.choiceNodeId === node.id)
  return choiceIndex >= 0 ? decisions.slice(0, choiceIndex) : decisions
}

function rebuildStrategy(decisions: ChoiceRecord[]) {
  return decisions.reduce(
    (progress, decision, index) => applyDecision(
      progress,
      decision.optionId,
      decision.timestamp ?? new Date(index * 1000).toISOString(),
    ),
    INITIAL_STRATEGY_PROGRESS,
  )
}

export function reduceDemoState(state: DemoState, event: DemoEvent): DemoState {
  if (event.type === 'RESTART') return INITIAL_DEMO_STATE
  if (event.type === 'START' && state.currentNodeId === 'launch') {
    return moveForward(state, 'intro')
  }
  if (event.type === 'GO_BACK') {
    const previousNodeId = state.history.at(-1)
    if (!previousNodeId) return state
    const decisions = trimDecisionsForChoice(state.decisions, previousNodeId)
    const strategy = rebuildStrategy(decisions)
    return {
      ...state,
      currentNodeId: previousNodeId,
      history: state.history.slice(0, -1),
      decisions,
      strategy,
      outcomeId: resolveEnding(strategy),
    }
  }
  if (event.type === 'BACK_TO_CHOICE') {
    const choiceIndex = state.decisions.findIndex((decision) => decision.choiceNodeId === event.choiceNodeId)
    const historyIndex = state.history.lastIndexOf(event.choiceNodeId)
    const decisions = choiceIndex >= 0 ? state.decisions.slice(0, choiceIndex) : state.decisions
    const strategy = rebuildStrategy(decisions)
    return {
      ...state,
      currentNodeId: event.choiceNodeId,
      history: historyIndex >= 0 ? state.history.slice(0, historyIndex) : state.history,
      decisions,
      strategy,
      outcomeId: resolveEnding(strategy),
    }
  }
  if (state.currentNodeId === 'launch') return state

  const node = getNode(state.currentNodeId)
  if ((event.type === 'VIDEO_ENDED' || event.type === 'VIDEO_FAILED') && node.kind === 'video') {
    return moveForward(state, node.next, {
      failedVideoIds: event.type === 'VIDEO_FAILED'
        ? Array.from(new Set([...state.failedVideoIds, node.id]))
        : state.failedVideoIds,
    })
  }
  if (event.type === 'SELECT_OPTION' && node.kind === 'choice') {
    const option = getChoiceOptions(node, state.strategy).find((candidate) => candidate.id === event.optionId)
    if (!option) return state
    const existingIndex = state.decisions.findIndex((decision) => decision.choiceNodeId === node.id)
    const decisions = existingIndex >= 0 ? state.decisions.slice(0, existingIndex) : state.decisions
    const previousStrategy = rebuildStrategy(decisions)
    const timestamp = event.timestamp ?? new Date(decisions.length * 1000).toISOString()
    const strategy = applyDecision(previousStrategy, option.id, timestamp)
    const outcomeId = node.id === 'choice-X3' ? resolveEnding(strategy) : null
    const target = node.id === 'choice-X3' ? outcomeId : option.target
    if (!target) return state
    return moveForward(state, target, {
      decisions: [...decisions, { choiceNodeId: node.id, optionId: option.id, label: option.label, timestamp }],
      strategy,
      outcomeId,
    })
  }
  return state
}
