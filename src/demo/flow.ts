import { getNode, type ChoiceNode, type StoryNodeId } from './story'

export type ChoiceRecord = {
  choiceNodeId: ChoiceNode['id']
  optionId: string
  label: string
}

export type DemoState = {
  currentNodeId: 'launch' | StoryNodeId
  decisions: ChoiceRecord[]
  failedVideoIds: string[]
}

export type DemoEvent =
  | { type: 'START' }
  | { type: 'VIDEO_ENDED' }
  | { type: 'VIDEO_FAILED' }
  | { type: 'SELECT_OPTION'; optionId: string }
  | { type: 'BACK_TO_CHOICE'; choiceNodeId: ChoiceNode['id'] }
  | { type: 'RESTART' }

export const INITIAL_DEMO_STATE: DemoState = {
  currentNodeId: 'launch',
  decisions: [],
  failedVideoIds: [],
}

export function reduceDemoState(state: DemoState, event: DemoEvent): DemoState {
  if (event.type === 'RESTART') return INITIAL_DEMO_STATE
  if (event.type === 'START' && state.currentNodeId === 'launch') {
    return { ...state, currentNodeId: 'intro' }
  }
  if (event.type === 'BACK_TO_CHOICE') {
    const choiceIndex = state.decisions.findIndex((decision) => decision.choiceNodeId === event.choiceNodeId)
    return {
      ...state,
      currentNodeId: event.choiceNodeId,
      decisions: choiceIndex >= 0 ? state.decisions.slice(0, choiceIndex) : state.decisions,
    }
  }
  if (state.currentNodeId === 'launch') return state

  const node = getNode(state.currentNodeId)
  if ((event.type === 'VIDEO_ENDED' || event.type === 'VIDEO_FAILED') && node.kind === 'video') {
    return {
      ...state,
      currentNodeId: node.next,
      failedVideoIds: event.type === 'VIDEO_FAILED'
        ? Array.from(new Set([...state.failedVideoIds, node.id]))
        : state.failedVideoIds,
    }
  }
  if (event.type === 'SELECT_OPTION' && node.kind === 'choice') {
    const option = node.options.find((candidate) => candidate.id === event.optionId)
    if (!option) return state
    const existingIndex = state.decisions.findIndex((decision) => decision.choiceNodeId === node.id)
    const decisions = existingIndex >= 0 ? state.decisions.slice(0, existingIndex) : state.decisions
    return {
      ...state,
      currentNodeId: option.target,
      decisions: [...decisions, { choiceNodeId: node.id, optionId: option.id, label: option.label }],
    }
  }
  return state
}
