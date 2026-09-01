import { describe, expect, it } from 'vitest'
import { INITIAL_DEMO_STATE, reduceDemoState } from './flow'
import {
  PRIMARY_CHOICE_ID,
  STORY_NODES,
  VIDEO_NODE_IDS,
  getNode,
  validateStoryGraph,
} from './story'

describe('three-layer classroom story graph', () => {
  it('defines one intro, four situation clips, and twelve result clips', () => {
    expect(VIDEO_NODE_IDS).toHaveLength(17)
    expect(VIDEO_NODE_IDS.filter((id) => id === 'intro')).toHaveLength(1)
    expect(VIDEO_NODE_IDS.filter((id) => /^[A-D]0$/.test(id))).toHaveLength(4)
    expect(VIDEO_NODE_IDS.filter((id) => /^[A-D][1-3]$/.test(id))).toHaveLength(12)
  })

  it('plays all four completed route situation videos with timed subtitles', () => {
    for (const id of ['A0', 'B0', 'C0', 'D0'] as const) {
      const node = getNode(id)
      expect(node.kind).toBe('video')
      if (node.kind !== 'video') throw new Error(`${id} must be a video node`)
      expect(node.video).toBe(`/videos/demo/route-${id[0].toLowerCase()}-situation.mp4`)
      expect(node.subtitles.length).toBeGreaterThan(0)
      expect(node.subtitles.every((cue) => cue.start < cue.end)).toBe(true)
    }
  })

  it('syncs A and C subtitles to the spoken words in the rendered clips', () => {
    const routeA = getNode('A0')
    const routeC = getNode('C0')
    if (routeA.kind !== 'video' || routeC.kind !== 'video') {
      throw new Error('A0 and C0 must be video nodes')
    }

    expect(routeA.subtitles).toEqual([
      { start: 6.14, end: 7.26, text: '山口就在前面' },
      { start: 7.72, end: 8.48, text: '可这阵风' },
      { start: 8.94, end: 9.96, text: '比预报早了一天' },
    ])
    expect(routeC.subtitles).toEqual([
      { start: 6.6, end: 7.44, text: '答案有了' },
      { start: 8.1, end: 9.76, text: '可窗口也只剩一天半' },
    ])
  })

  it('keeps the approved primary route order and avoids judgement labels', () => {
    const choice = getNode(PRIMARY_CHOICE_ID)
    expect(choice.kind).toBe('choice')
    if (choice.kind !== 'choice') throw new Error('primary node must be a choice')

    expect(choice.options.map((option) => option.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(choice.options.map((option) => option.label)).toEqual([
      '立即翻山',
      '改走山谷',
      '等待 48 小时预报',
      '等待 3–4 周安全撤离',
    ])
    expect(JSON.stringify(STORY_NODES)).not.toMatch(/激进型|稳妥型|保守型|观望型/)
  })

  it('has no dead links and all twelve endings are reachable', () => {
    const report = validateStoryGraph()
    expect(report.errors).toEqual([])
    expect(report.reachableEndingIds).toHaveLength(12)
  })

  it('runs intro, primary choice, route situation, secondary choice, result video, and ending', () => {
    const intro = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
    const primaryChoice = reduceDemoState(intro, { type: 'VIDEO_ENDED' })
    const situation = reduceDemoState(primaryChoice, { type: 'SELECT_OPTION', optionId: 'A' })
    const secondaryChoice = reduceDemoState(situation, { type: 'VIDEO_ENDED' })
    const resultVideo = reduceDemoState(secondaryChoice, { type: 'SELECT_OPTION', optionId: 'A2' })
    const ending = reduceDemoState(resultVideo, { type: 'VIDEO_ENDED' })

    expect(intro.currentNodeId).toBe('intro')
    expect(primaryChoice.currentNodeId).toBe('choice-primary')
    expect(situation.currentNodeId).toBe('A0')
    expect(secondaryChoice.currentNodeId).toBe('choice-A')
    expect(resultVideo.currentNodeId).toBe('A2')
    expect(ending.currentNodeId).toBe('ending-A2')
    expect(ending.decisions.map((decision) => decision.optionId)).toEqual(['A', 'A2'])
  })

  it('uses the same deterministic route on repeated selections', () => {
    const choice = { ...INITIAL_DEMO_STATE, currentNodeId: PRIMARY_CHOICE_ID }
    const first = reduceDemoState(choice, { type: 'SELECT_OPTION', optionId: 'C' })
    const second = reduceDemoState(choice, { type: 'SELECT_OPTION', optionId: 'C' })
    expect(first).toEqual(second)
    expect(first.currentNodeId).toBe('C0')
  })

  it('continues through a missing video and records the degraded node', () => {
    const state = {
      ...INITIAL_DEMO_STATE,
      currentNodeId: 'B0' as const,
      decisions: [{ choiceNodeId: PRIMARY_CHOICE_ID, optionId: 'B', label: '改走山谷' }],
    }
    const next = reduceDemoState(state, { type: 'VIDEO_FAILED' })
    expect(next.currentNodeId).toBe('choice-B')
    expect(next.failedVideoIds).toEqual(['B0'])
  })

  it('returns to a secondary choice without replaying its situation video', () => {
    const state = {
      currentNodeId: 'ending-D3' as const,
      decisions: [
        { choiceNodeId: PRIMARY_CHOICE_ID, optionId: 'D', label: '等待 3–4 周安全撤离' },
        { choiceNodeId: 'choice-D' as const, optionId: 'D3', label: '利用天气窗口重返矿区' },
      ],
      failedVideoIds: [],
    }
    const back = reduceDemoState(state, { type: 'BACK_TO_CHOICE', choiceNodeId: 'choice-D' })
    expect(back.currentNodeId).toBe('choice-D')
    expect(back.decisions.map((decision) => decision.optionId)).toEqual(['D'])
  })
})
