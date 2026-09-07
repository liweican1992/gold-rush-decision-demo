import { describe, expect, it } from 'vitest'
import { INITIAL_DEMO_STATE, reduceDemoState, type DemoState } from './flow'
import * as story from './story'
import {
  PRIMARY_CHOICE_ID,
  STORY_NODES,
  VIDEO_NODE_IDS,
  getChoiceBackdropVideo,
  getNode,
  validateStoryGraph,
} from './story'
import { replayDecisions } from './strategy'

describe('five-decision classroom story graph', () => {
  it('defines route, shared-decision, and six ending video nodes', () => {
    expect(VIDEO_NODE_IDS).toHaveLength(26)
    expect(VIDEO_NODE_IDS.filter((id) => id === 'intro')).toHaveLength(1)
    expect(VIDEO_NODE_IDS.filter((id) => /^[A-D]0$/.test(id))).toHaveLength(4)
    expect(VIDEO_NODE_IDS.filter((id) => /^[A-D][1-3]$/.test(id))).toHaveLength(12)
    expect(VIDEO_NODE_IDS.filter((id) => /^X[1-3]$/.test(id))).toHaveLength(3)
    expect(VIDEO_NODE_IDS.filter((id) => /^END-F[1-6]$/.test(id))).toHaveLength(6)
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
    expect(getChoiceBackdropVideo('choice-X1')).toBe('/videos/web/shared-x1-priority-v2.mp4')
    expect(getChoiceBackdropVideo('choice-X2')).toBe('/videos/web/shared-x2-control-v3.mp4')
    expect(getChoiceBackdropVideo('choice-X3')).toBe('/videos/web/shared-x3-final-commitment-v2.mp4')
  })

  it('maps every choice page to a real tail frame extracted from its preceding video', () => {
    const getChoiceBackdropFrame = (story as typeof story & {
      getChoiceBackdropFrame?: (choiceId: 'choice-primary' | 'choice-A' | 'choice-B' | 'choice-C' | 'choice-D') => string
    }).getChoiceBackdropFrame

    expect(getChoiceBackdropFrame).toBeTypeOf('function')
    expect(getChoiceBackdropFrame?.('choice-primary')).toBe('/images/choice-frames/choice-primary.webp')
    expect(getChoiceBackdropFrame?.('choice-A')).toBe('/images/choice-frames/choice-A.webp')
    expect(getChoiceBackdropFrame?.('choice-B')).toBe('/images/choice-frames/choice-B.webp')
    expect(getChoiceBackdropFrame?.('choice-C')).toBe('/images/choice-frames/choice-C.webp')
    expect(getChoiceBackdropFrame?.('choice-D')).toBe('/images/choice-frames/choice-D.webp')
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

  it('plays B2 and B3 with subtitles that begin after the measured speech onset', () => {
    const b2 = getNode('B2')
    const b3 = getNode('B3')

    expect(b2.kind).toBe('video')
    expect(b3.kind).toBe('video')
    if (b2.kind !== 'video' || b3.kind !== 'video') {
      throw new Error('B2 and B3 must be video nodes')
    }

    expect(b2.video).toBe('/videos/web/route-b2-detour.mp4')
    expect(b2.subtitles).toEqual([
      { start: 0.68, end: 1.76, text: '这座桥带不了重装' },
      { start: 2.78, end: 5.18, text: '走山谷，人和样本都不过河' },
      { start: 5.98, end: 6.93, text: '积雪里要八天' },
      { start: 7.97, end: 8.5, text: '更安全' },
      { start: 9.01, end: 9.95, text: '但会耗尽期限' },
    ])

    expect(b3.video).toBe('/videos/web/route-b3-drop-equipment.mp4')
    expect(b3.subtitles).toEqual([
      { start: 0.5, end: 1.68, text: '这座桥只容轻装' },
      { start: 2.78, end: 4.37, text: '核心样本和资料随人走' },
      { start: 4.88, end: 5.71, text: '重装留在这里' },
      { start: 7.68, end: 8.3, text: '换回速度' },
      { start: 8.68, end: 10.04, text: '也失去后续重勘能力' },
    ])

    expect(b2.subtitles[0].start).toBeGreaterThan(0.61)
    expect(b3.subtitles[0].start).toBeGreaterThan(0.42)
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

  it('syncs the accepted B0 subtitles after each measured speech onset', () => {
    const routeB = getNode('B0')
    if (routeB.kind !== 'video') throw new Error('B0 must be a video node')

    expect(routeB.subtitles).toEqual([
      { start: 3.2, end: 4.88, text: '上游有检修索桥' },
      { start: 5.32, end: 6.38, text: '只能走人和轻装' },
      { start: 6.68, end: 7.44, text: '重装备过不去' },
      { start: 8.21, end: 8.92, text: '我们只剩八天' },
      { start: 9.73, end: 10.56, text: '沿山谷绕行' },
      { start: 11.1, end: 12.12, text: '会把登记窗口耗尽' },
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

  it('keeps the B2 choice wording consistent with the accepted eight-day video', () => {
    const choice = getNode('choice-B')
    expect(choice.kind).toBe('choice')
    if (choice.kind !== 'choice') throw new Error('choice-B must be a choice node')

    expect(choice.prompt).toContain('只剩八天')
    expect(choice.options.find((item) => item.id === 'B2')).toEqual(expect.objectContaining({
      label: '沿山谷绕行',
      factHint: expect.stringContaining('耗尽剩余八天'),
    }))
  })

  it('makes the D-route reversal temporally explicit and ends in a full last-deadline registration', () => {
    const situation = getNode('D0')
    const choice = getNode('choice-D')

    expect(situation.kind).toBe('video')
    expect(choice.kind).toBe('choice')
    if (situation.kind !== 'video' || choice.kind !== 'choice') {
      throw new Error('D route nodes must keep their expected kinds')
    }

    expect(situation.title).toContain('等待决定后的第六天')
    expect(situation.synopsis).toContain('购买勘探资料')
    expect(choice.options.find((item) => item.id === 'D3')?.label).toBe('取消撤离，轻装抢登记')
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

  it('changes X2 wording when an earlier choice already established the partner or sale process', () => {
    const x2 = getNode('choice-X2')
    expect(x2.kind).toBe('choice')
    if (x2.kind !== 'choice') throw new Error('choice-X2 must be a choice node')

    const afterPartner = story.getChoiceOptions(x2, replayDecisions(['C', 'C3']))
    expect(afterPartner.find((item) => item.id === 'X2-STAGED-ALLIANCE')?.label).toBe('把现有合作改为分阶段安排')

    const afterOffer = story.getChoiceOptions(x2, replayDecisions(['D', 'D2']))
    expect(afterOffer.find((item) => item.id === 'X2-SALE-NEGOTIATION')?.label).toBe('继续交易尽调')
  })

  it('has no dead links and all six objective endings are reachable', () => {
    const report = validateStoryGraph()
    expect(report.errors).toEqual([])
    expect(report.reachableEndingIds).toHaveLength(6)
  })

  it('routes each route result into the shared X1 decision layer', () => {
    const intro = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
    const primaryChoice = reduceDemoState(intro, { type: 'VIDEO_ENDED' })
    const situation = reduceDemoState(primaryChoice, { type: 'SELECT_OPTION', optionId: 'A' })
    const secondaryChoice = reduceDemoState(situation, { type: 'VIDEO_ENDED' })
    const resultVideo = reduceDemoState(secondaryChoice, { type: 'SELECT_OPTION', optionId: 'A2' })
    const x1Video = reduceDemoState(resultVideo, { type: 'VIDEO_ENDED' })

    expect(intro.currentNodeId).toBe('intro')
    expect(primaryChoice.currentNodeId).toBe('choice-primary')
    expect(situation.currentNodeId).toBe('A0')
    expect(secondaryChoice.currentNodeId).toBe('choice-A')
    expect(resultVideo.currentNodeId).toBe('A2')
    expect(x1Video.currentNodeId).toBe('X1')
    expect(x1Video.decisions.map((decision) => decision.optionId)).toEqual(['A', 'A2'])
  })

  it('records every forward step so navigation can return through the actual visited path', () => {
    const intro = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
    const primaryChoice = reduceDemoState(intro, { type: 'VIDEO_ENDED' })
    const situation = reduceDemoState(primaryChoice, { type: 'SELECT_OPTION', optionId: 'A' })
    const secondaryChoice = reduceDemoState(situation, { type: 'VIDEO_ENDED' })

    expect((secondaryChoice as typeof secondaryChoice & { history?: string[] }).history).toEqual([
      'launch',
      'intro',
      'choice-primary',
      'A0',
    ])
  })

  it('returns one real step at a time from intro, route situation, and secondary choice', () => {
    const intro = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
    const launch = reduceDemoState(intro, { type: 'GO_BACK' } as never)
    expect(launch.currentNodeId).toBe('launch')

    const primaryChoice = reduceDemoState(intro, { type: 'VIDEO_ENDED' })
    const situation = reduceDemoState(primaryChoice, { type: 'SELECT_OPTION', optionId: 'A' })
    const backToPrimary = reduceDemoState(situation, { type: 'GO_BACK' } as never)
    expect(backToPrimary.currentNodeId).toBe('choice-primary')
    expect(backToPrimary.decisions).toEqual([])

    const secondaryChoice = reduceDemoState(situation, { type: 'VIDEO_ENDED' })
    const backToSituation = reduceDemoState(secondaryChoice, { type: 'GO_BACK' } as never)
    expect(backToSituation.currentNodeId).toBe('A0')
    expect(backToSituation.decisions.map((decision) => decision.optionId)).toEqual(['A'])
  })

  it('runs X1, X2, X3, resolves an ending, then opens the report', () => {
    const intro = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
    const primaryChoice = reduceDemoState(intro, { type: 'VIDEO_ENDED' })
    const situation = reduceDemoState(primaryChoice, { type: 'SELECT_OPTION', optionId: 'A' })
    const secondaryChoice = reduceDemoState(situation, { type: 'VIDEO_ENDED' })
    const resultVideo = reduceDemoState(secondaryChoice, { type: 'SELECT_OPTION', optionId: 'A2' })
    const x1 = reduceDemoState(resultVideo, { type: 'VIDEO_ENDED' })
    const choiceX1 = reduceDemoState(x1, { type: 'VIDEO_ENDED' })
    const x2 = reduceDemoState(choiceX1, { type: 'SELECT_OPTION', optionId: 'X1-PEOPLE' })
    const choiceX2 = reduceDemoState(x2, { type: 'VIDEO_ENDED' })
    const x3 = reduceDemoState(choiceX2, { type: 'SELECT_OPTION', optionId: 'X2-INDEPENDENT' })
    const choiceX3 = reduceDemoState(x3, { type: 'VIDEO_ENDED' })
    const endingVideo = reduceDemoState(choiceX3, { type: 'SELECT_OPTION', optionId: 'X3-SUBMIT-NOW' })
    const report = reduceDemoState(endingVideo, { type: 'VIDEO_ENDED' })

    expect(choiceX1.currentNodeId).toBe('choice-X1')
    expect(x2.currentNodeId).toBe('X2')
    expect(choiceX2.currentNodeId).toBe('choice-X2')
    expect(x3.currentNodeId).toBe('X3')
    expect(choiceX3.currentNodeId).toBe('choice-X3')
    expect(endingVideo.currentNodeId).toBe('END-F1')
    expect(report.currentNodeId).toBe('REPORT')
    expect(report.decisions.map((decision) => decision.optionId)).toEqual(['A', 'A2', 'X1-PEOPLE', 'X2-INDEPENDENT', 'X3-SUBMIT-NOW'])
    expect(report.strategy.evidence).toHaveLength(5)
  })

  it('reaches every F1-F6 ending through a valid five-choice path', () => {
    const play = (choices: [string, string, string, string, string]) => {
      let state = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
      state = reduceDemoState(state, { type: 'VIDEO_ENDED' })
      state = reduceDemoState(state, { type: 'SELECT_OPTION', optionId: choices[0] })
      state = reduceDemoState(state, { type: 'VIDEO_ENDED' })
      state = reduceDemoState(state, { type: 'SELECT_OPTION', optionId: choices[1] })
      state = reduceDemoState(state, { type: 'VIDEO_ENDED' })
      state = reduceDemoState(state, { type: 'VIDEO_ENDED' })
      state = reduceDemoState(state, { type: 'SELECT_OPTION', optionId: choices[2] })
      state = reduceDemoState(state, { type: 'VIDEO_ENDED' })
      state = reduceDemoState(state, { type: 'SELECT_OPTION', optionId: choices[3] })
      state = reduceDemoState(state, { type: 'VIDEO_ENDED' })
      return reduceDemoState(state, { type: 'SELECT_OPTION', optionId: choices[4] })
    }

    expect(play(['A', 'A2', 'X1-PEOPLE', 'X2-INDEPENDENT', 'X3-SUBMIT-NOW']).currentNodeId).toBe('END-F1')
    expect(play(['A', 'A1', 'X1-SPRINT', 'X2-INDEPENDENT', 'X3-SUBMIT-NOW']).currentNodeId).toBe('END-F2')
    expect(play(['C', 'C3', 'X1-CAPABILITY', 'X2-STAGED-ALLIANCE', 'X3-JOINT-SUBMIT']).currentNodeId).toBe('END-F3')
    expect(play(['D', 'D2', 'X1-EVIDENCE', 'X2-SALE-NEGOTIATION', 'X3-FINALIZE-SALE']).currentNodeId).toBe('END-F4')
    expect(play(['A', 'A2', 'X1-PEOPLE', 'X2-INDEPENDENT', 'X3-SAFE-WITHDRAW']).currentNodeId).toBe('END-F5')
    expect(play(['A', 'A3', 'X1-SPRINT', 'X2-INDEPENDENT', 'X3-LATE-FILE']).currentNodeId).toBe('END-F6')
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
      history: ['launch', 'intro', PRIMARY_CHOICE_ID] as DemoState['history'],
      decisions: [{ choiceNodeId: PRIMARY_CHOICE_ID, optionId: 'B', label: '改走山谷' }],
    }
    const next = reduceDemoState(state, { type: 'VIDEO_FAILED' })
    expect(next.currentNodeId).toBe('choice-B')
    expect(next.failedVideoIds).toEqual(['B0'])
  })

  it('returns to a secondary choice without replaying its situation video', () => {
    const state = {
      ...INITIAL_DEMO_STATE,
      currentNodeId: 'X1' as const,
      decisions: [
        { choiceNodeId: PRIMARY_CHOICE_ID, optionId: 'D', label: '等待 3–4 周安全撤离' },
        { choiceNodeId: 'choice-D' as const, optionId: 'D3', label: '取消撤离，轻装抢登记' },
      ],
      history: ['launch', 'intro', PRIMARY_CHOICE_ID, 'D0', 'choice-D', 'D3'] as DemoState['history'],
    }
    const back = reduceDemoState(state, { type: 'BACK_TO_CHOICE', choiceNodeId: 'choice-D' })
    expect(back.currentNodeId).toBe('choice-D')
    expect(back.decisions.map((decision) => decision.optionId)).toEqual(['D'])
  })
})
