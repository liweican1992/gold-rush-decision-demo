import { describe, expect, it } from 'vitest'
import {
  REDESIGNED_STORY,
  getTerminalPathCount,
  getVisibleStoryLanes,
  validateRedesignedStory,
} from './redesignedStory'

describe('redesigned story proposal', () => {
  it('keeps the canonical four route situations and three outcomes per route', () => {
    expect(REDESIGNED_STORY.routes.map((route) => route.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(REDESIGNED_STORY.routes.map((route) => route.outcomes.length)).toEqual([3, 3, 3, 3])
    expect(REDESIGNED_STORY.routes.map((route) => route.situation.time)).toEqual([
      '第3天 · 剩余11天',
      '第6天 · 剩余8天',
      '等待2天后 · 剩余12天 · 天气窗36小时',
      '等待决定后第6天 · 剩余8天',
    ])
  })

  it('contains exactly 34 route-specific terminal paths with unique media', () => {
    const finales = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes.flatMap((outcome) => outcome.finales))

    expect(getTerminalPathCount()).toBe(34)
    expect(new Set(finales.map((finale) => finale.id)).size).toBe(34)
    expect(new Set(finales.map((finale) => finale.video)).size).toBe(34)
    expect(finales.every((finale) => finale.video.includes(finale.id.toLowerCase()))).toBe(true)
  })

  it('never offers filing or renewed travel after the registration window expires', () => {
    const expired = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
      .filter((outcome) => outcome.deadline === 'expired')

    expect(expired.map((outcome) => outcome.id)).toEqual(['A3', 'B2', 'C2', 'D1'])
    expect(expired.every((outcome) => !outcome.finales.some((finale) => /赶路|登记|提交|抢/.test(`${finale.label}${finale.result}`)))).toBe(true)
  })

  it('restricts external actors to the routes where they were established', () => {
    const actorNodes = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
      .filter((outcome) => outcome.externalActor)
      .map((outcome) => [outcome.id, outcome.externalActor])

    expect(actorNodes).toEqual([
      ['C3', '当地运输队'],
      ['D2', '竞争者收购方'],
    ])
  })

  it('gives every direct outcome and terminal path deterministic consequences', () => {
    const outcomes = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
    const finales = outcomes.flatMap((outcome) => outcome.finales)

    expect(outcomes.every((outcome) => !/\u53ef能|\u4e5f许/.test(outcome.directResult))).toBe(true)
    expect(finales.every((finale) => !/可能|也许|或许/.test(finale.result))).toBe(true)
    expect(finales.every((finale) => finale.requiredFacts.every((fact) => {
      const parent = outcomes.find((outcome) => outcome.finales.includes(finale))!
      return parent.facts.includes(fact)
    }))).toBe(true)
    expect(validateRedesignedStory()).toEqual([])
  })

  it('preserves the irreversible route result in every downstream finale', () => {
    const outcomes = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
    const byId = (id: string) => outcomes.find((outcome) => outcome.id === id)!

    for (const id of ['B1', 'B3', 'C1', 'C3', 'D3']) {
      expect(byId(id).finales.every((finale) => /提交/.test(finale.result))).toBe(true)
    }

    expect(byId('B1').finales.every((finale) => finale.endingType === 'F2')).toBe(true)
    expect(byId('B1').finales.every((finale) => /受潮|样本覆盖|证据完整度/.test(finale.finalState.join('')))).toBe(true)
    expect(byId('C1').finales.every((finale) => finale.endingType === 'F2')).toBe(true)
    expect(byId('C1').finales.every((finale) => /样本有限|样本仍然有限/.test(finale.finalState.join('')))).toBe(true)

    expect(byId('A1').finales.every((finale) => /设备.*损失|设备能力.*下降/.test(finale.finalState.join('')))).toBe(true)
    expect(byId('B3').finales.every((finale) => /重型.*损失|重型设备.*留弃/.test(finale.finalState.join('')))).toBe(true)
    expect(byId('C3').finales.every((finale) => /未来权益.*让渡/.test(finale.finalState.join('')))).toBe(true)
    expect(byId('D3').finales.every((finale) => /重型设备.*留弃/.test(finale.finalState.join('')))).toBe(true)

    for (const id of ['A3', 'B2', 'C2', 'D1']) {
      expect(byId(id).finales.every((finale) => finale.finalState.includes('当前机会终止'))).toBe(true)
    }
  })

  it('does not invent a mining-registration evidentiary procedure', () => {
    const serialised = JSON.stringify(REDESIGNED_STORY)

    expect(serialised).not.toMatch(/样本记录链|来源链|交接记录|工作人员.*标记样本/)
  })

  it('uses F1-F6 only as report classifications instead of shared narrative nodes', () => {
    const finales = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes.flatMap((outcome) => outcome.finales))

    expect('modules' in REDESIGNED_STORY).toBe(false)
    expect(REDESIGNED_STORY.endingTypes.map((ending) => ending.id)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'F6'])
    expect(finales.every((finale) => /^F[1-6]$/.test(finale.endingType))).toBe(true)
  })

  it('filters exclusive route lanes while keeping the requested lane', () => {
    expect(getVisibleStoryLanes('ALL').map((route) => route.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(getVisibleStoryLanes('C').map((route) => route.id)).toEqual(['C'])
  })

  it('reuses the completed A-route outcome frames but requires decision-setup extensions', () => {
    const routeA = REDESIGNED_STORY.routes.find((route) => route.id === 'A')!

    expect(routeA.outcomes.map((outcome) => outcome.keyframe)).toEqual([
      '/images/choice-frames/outcome-A1.png',
      '/images/choice-frames/outcome-A2.png',
      '/images/choice-frames/outcome-A3.png',
    ])
    expect(routeA.outcomes.map((outcome) => outcome.status)).toEqual(['partial', 'partial', 'partial'])
  })

  it('keeps A2 at the morning-after-bivouac decision point', () => {
    const a2 = REDESIGNED_STORY.routes.find((route) => route.id === 'A')!
      .outcomes.find((outcome) => outcome.id === 'A2')!

    expect(a2.time).toBe('第4天 · 剩余10天')
    expect(a2.scene).toContain('背风雪台')
    expect(a2.scene).not.toContain('已经越岭')
    expect(a2.finales.find((item) => item.id === 'A2-1')!.result).toContain('第13天')
  })

  it('does not award the opportunity to the D-route buyer without evidence', () => {
    const d1 = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
      .find((outcome) => outcome.id === 'D1')!

    expect(JSON.stringify(d1)).not.toMatch(/竞争者.*取得机会|机会已被竞争者取得/)
    expect(d1.directResult).toContain('公开竞争')
  })

  it('keeps D2 transaction scope limited to exploration data', () => {
    const d2 = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
      .find((outcome) => outcome.id === 'D2')!

    expect(JSON.stringify(d2)).not.toContain('样本')
    expect(d2.facts).toContain('交易对象是完整勘探资料')
  })

  it('defines F5 for safety-first withdrawal before or after expiry', () => {
    const f5 = REDESIGNED_STORY.endingTypes.find((ending) => ending.id === 'F5')!

    expect(f5.definition).toContain('人员与可迁移能力优先')
    expect(f5.definition).not.toContain('主动放弃')
  })

  it('does not mark an incomplete route-situation video as ready', () => {
    const situations = REDESIGNED_STORY.routes.map((route) => route.situation)

    expect(situations.find((item) => item.id === 'A0')!.status).toBe('partial')
    expect(situations.find((item) => item.id === 'B0')!.status).toBe('partial')
    expect(situations.find((item) => item.id === 'C0')!.status).toBe('rebuild')
    expect(situations.find((item) => item.id === 'D0')!.status).toBe('rebuild')
  })
})
