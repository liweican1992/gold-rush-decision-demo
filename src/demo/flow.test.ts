import { describe, expect, it } from 'vitest'
import { INITIAL_DEMO_STATE, reduceDemoState } from './flow'
import {
  PRIMARY_CHOICE_ID,
  STORY_NODES,
  VIDEO_NODE_IDS,
  getChoiceBackdropVideo,
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
      expect(node.video).toBe(`/videos/web/route-${id[0].toLowerCase()}-situation.mp4`)
      expect(node.subtitles.length).toBeGreaterThan(0)
      expect(node.subtitles.every((cue) => cue.start < cue.end)).toBe(true)
    }
  })

  it('uses the preceding situation video as the frozen backdrop for every choice page', () => {
    expect(getChoiceBackdropVideo('choice-primary')).toBe('/videos/web/intro.mp4')
    expect(getChoiceBackdropVideo('choice-A')).toBe('/videos/web/route-a-situation.mp4')
    expect(getChoiceBackdropVideo('choice-B')).toBe('/videos/web/route-b-situation.mp4')
    expect(getChoiceBackdropVideo('choice-C')).toBe('/videos/web/route-c-situation.mp4')
    expect(getChoiceBackdropVideo('choice-D')).toBe('/videos/web/route-d-situation.mp4')
  })

  it('plays the completed A1, A2, A3, and B1 outcome clips instead of the missing-video placeholder', () => {
    const a1 = getNode('A1')
    const a2 = getNode('A2')
    const a3 = getNode('A3')
    const b1 = getNode('B1')

    expect(a1.kind).toBe('video')
    expect(a2.kind).toBe('video')
    expect(a3.kind).toBe('video')
    expect(b1.kind).toBe('video')
    if (a1.kind !== 'video' || a2.kind !== 'video' || a3.kind !== 'video' || b1.kind !== 'video') {
      throw new Error('A1, A2, A3, and B1 must be video nodes')
    }

    expect(a1.video).toBe('/videos/web/route-a1-press-on.mp4')
    expect(a2.video).toBe('/videos/web/route-a2-bivouac.mp4')
    expect(a3.video).toBe('/videos/web/route-a3-switch-valley.mp4')
    expect(b1.video).toBe('/videos/web/route-b1-ford.mp4')
    expect(a1.subtitles).toEqual([
      { start: 10.14, end: 17.14, text: '山口过了' },
      { start: 17.14, end: 18.6, text: '设备丢了一箱' },
      { start: 18.6, end: 20.28, text: '你的手撑不住了' },
    ])
    expect(a2.subtitles).toEqual([])
    expect(a3.subtitles).toEqual([
      { start: 10.14, end: 17.54, text: '折返三天' },
      { start: 17.54, end: 18.78, text: '再走山谷' },
      { start: 18.78, end: 20.24, text: '赶不上登记了' },
    ])
    expect(b1.subtitles).toEqual([])
  })

  it('syncs A, C, and the refreshed D subtitles to the spoken words in the rendered clips', () => {
    const routeA = getNode('A0')
    const routeC = getNode('C0')
    const routeD = getNode('D0')
    if (routeA.kind !== 'video' || routeC.kind !== 'video' || routeD.kind !== 'video') {
      throw new Error('A0, C0, and D0 must be video nodes')
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
    expect(routeD.subtitles).toEqual([
      { start: 0, end: 4, text: '你们做好决定了吗' },
      { start: 4, end: 8.12, text: '我们已经决定保人' },
      { start: 8.12, end: 9.86, text: '但还没决定怎样退出' },
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

  it('gives B3 a crossing mechanism that the equipment sacrifice actually enables', () => {
    const choice = getNode('choice-B')
    expect(choice.kind).toBe('choice')
    if (choice.kind !== 'choice') throw new Error('choice-B must be a choice node')

    const option = choice.options.find((item) => item.id === 'B3')
    expect(option?.factHint).toContain('检修索桥')
    expect(option?.factHint).toContain('重型设备无法通过')
  })

  it('makes the D-route reversal temporally explicit and ends in a full last-deadline registration', () => {
    const situation = getNode('D0')
    const choice = getNode('choice-D')
    const ending = getNode('ending-D3')

    expect(situation.kind).toBe('video')
    expect(choice.kind).toBe('choice')
    expect(ending.kind).toBe('ending')
    if (situation.kind !== 'video' || choice.kind !== 'choice' || ending.kind !== 'ending') {
      throw new Error('D route nodes must keep their expected kinds')
    }

    expect(situation.title).toContain('撤离第六天')
    expect(situation.synopsis).toContain('购买勘探资料')
    expect(choice.options.find((item) => item.id === 'D3')?.label).toBe('取消撤离，轻装抢登记')
    expect(ending.metrics.days).toBe('最后时限')
    expect(ending.metrics.claim).toBe('完成登记')
    expect(ending.metrics.capability).toContain('补给')
  })

  it('foreshadows the transport capability before C3 offers it as an option', () => {
    const situation = getNode('C0')
    const choice = getNode('choice-C')
    expect(situation.kind).toBe('video')
    expect(choice.kind).toBe('choice')
    if (situation.kind !== 'video' || choice.kind !== 'choice') {
      throw new Error('C route nodes must keep their expected kinds')
    }
    expect(situation.synopsis).toContain('当地运输队')
    expect(choice.prompt).toContain('当地运输队')
  })

  it('states the competitor offer on the D choice screen so the retained clip remains usable', () => {
    const choice = getNode('choice-D')
    expect(choice.kind).toBe('choice')
    if (choice.kind !== 'choice') throw new Error('choice-D must be a choice node')
    expect(choice.prompt).toContain('竞争者')
    expect(choice.prompt).toContain('收购勘探资料')
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
        { choiceNodeId: 'choice-D' as const, optionId: 'D3', label: '取消撤离，轻装抢登记' },
      ],
      failedVideoIds: [],
    }
    const back = reduceDemoState(state, { type: 'BACK_TO_CHOICE', choiceNodeId: 'choice-D' })
    expect(back.currentNodeId).toBe('choice-D')
    expect(back.decisions.map((decision) => decision.optionId)).toEqual(['D'])
  })
})
