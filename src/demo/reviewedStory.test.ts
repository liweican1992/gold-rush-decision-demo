import { describe, expect, it } from 'vitest'
import { arrivals, enumeratePaths, evaluate, endings, observations, epilogue, assessmentFeedback } from './reviewedStory'

describe('2026-09-09 修订剧本的可达链路', () => {
  it('X前反馈区分资料发现与未知，不向未评估路径补发成果', () => {
    expect(assessmentFeedback(evaluate('A2', 'S4'))).toBeUndefined()
    expect(assessmentFeedback(enumeratePaths().find(p => p.ending === 'E1')!)).toBeUndefined()
    const narrow = assessmentFeedback(evaluate('A2', 'S2', 'I1', 'X1'))!
    const broad = assessmentFeedback(evaluate('A2', 'S2', 'I2', 'X1'))!
    expect(narrow.known).toContain('观察点')
    expect(narrow.unknown).toContain('跨专业')
    expect(broad.known).toContain('衔接')
    expect(broad.unknown).toContain('储量')
    expect(narrow.changed).toContain('新排期')
    expect(broad.changed).toContain('新排期')
    expect(assessmentFeedback(evaluate('B1', 'S3', 'I1', 'X3'))).toEqual(narrow)
  })
  it('11 条返程路径中只有 4 条进入第二幕，临界办理早于截止 30 分钟', () => {
    expect(arrivals).toHaveLength(11)
    expect(arrivals.filter(a => a.budget !== undefined).map(a => a.id)).toEqual(['A1', 'A2', 'B1', 'V1'])
    expect(arrivals.find(a => a.id === 'B1')?.completedHour).toBe(14 * 24 - 0.5)
    for (const a of arrivals) expect(a.completedHour !== undefined && a.completedHour < 336).toBe(a.budget !== undefined)
    expect(arrivals.filter(a => ['D', 'C3', 'V3'].includes(a.id)).every(a => a.arrival === 'D40 15:00')).toBe(true)
  })
  it('四类结局覆盖全部 84 条可行路径，不把按期返回直接当成暂停', () => {
    const paths = enumeratePaths()
    expect(paths).toHaveLength(84)
    expect(new Set(paths.map(p => p.id)).size).toBe(84)
    expect(endings.map(e => paths.filter(p => p.ending === e.id).length)).toEqual([10, 28, 22, 24])
    expect(paths.filter(p => p.ending !== 'E1').every(p => p.s !== undefined)).toBe(true)
    expect(paths.filter(p => p.ending === 'E1').every(p => p.s === undefined && p.balance === undefined)).toBe(true)
  })
  it('C2只有四条合法尾声，只有延长合作会晚一天，不继承第二幕预算', () => {
    const c = enumeratePaths().filter(p => p.arrival.id === 'C2')
    expect(c.map(p => p.encounter)).toEqual(['independent', 'exchange', 'part', 'wait'])
    expect(c.map(p => p.arrival.arrival)).toEqual(['D18 15:00', 'D18 15:00', 'D18 15:00', 'D19 15:00'])
    expect(c.every(p => p.ending === 'E1' && p.balance === undefined && !p.s)).toBe(true)
    expect(enumeratePaths().some(p => p.id === 'C2-E1')).toBe(false)
    expect(new Set(c.map(p => epilogue(p).scene)).size).toBe(4)
    const part = observations(c[2]).join(' ')
    expect(part).toContain('已完成一段互助')
    expect(part).not.toContain('合作与后续投入未经历')
    expect(observations(c[0]).join(' ')).not.toContain('已完成一段互助')
    expect(epilogue(c[0]).scene).not.toContain('通信地址')
    expect(epilogue(c[3]).scene).toContain('通信地址')
  })
  it('非C2超期路线与第二幕具有按前情生成的尾声，不混入同行经历', () => {
    const expired = enumeratePaths().filter(p => p.ending === 'E1' && !p.encounter)
    expect(new Set(expired.map(p => epilogue(p).scene)).size).toBe(6)
    expect(expired.every(p => !epilogue(p).scene.includes('秦岑'))).toBe(true)
    expect(epilogue(evaluate('A2', 'S4')).scene).toContain('未启动')
    expect(epilogue(evaluate('A2', 'S1', 'I1', 'X3')).scene).toContain('首段')
    expect(epilogue(evaluate('A2', 'S3', 'I1', 'X2')).scene).toContain('未完成')
    expect(epilogue(evaluate('A2', 'S1', 'I1', 'X1')).scene).toContain('原始工作资料')
  })
  it('照护储备不可挪用，两条超预算原范围路径不可达', () => {
    expect(evaluate('A1', 'S1', 'I2', 'X1').balance).toBe(-6)
    expect(evaluate('A1', 'S2', 'I2', 'X1').balance).toBe(-2)
    expect(enumeratePaths().some(p => p.id === 'A1-S1-I2-X1')).toBe(false)
    expect(Math.min(...enumeratePaths().flatMap(p => p.balance === undefined ? [] : [p.balance]))).toBe(2)
    expect(() => evaluate('A3', 'S1', 'I1', 'X1')).toThrow()
  })
  it('时间和预算与文字稿关键算例一致', () => {
    expect(evaluate('A2', 'S1', 'I2', 'X1')).toMatchObject({ balance: 6, day: 15, decisionDay: 12, ending: 'E3' })
    expect(evaluate('B1', 'S2', 'I2', 'X1')).toMatchObject({ balance: 7, day: 13, decisionDay: 9 })
    expect(evaluate('V1', 'S3', 'I1', 'X2')).toMatchObject({ balance: 43, day: 16, ending: 'E4' })
    expect(evaluate('A2', 'S4')).toMatchObject({ balance: 68, day: 4, ending: 'E2', variant: '未启动评估' })
    expect(enumeratePaths().filter(p => p.x).every(p => p.decisionDay! >= 9)).toBe(true)
  })
  it('S1已付的过程组织投入带来较短响应，但不承诺总工期最快', () => {
    for (const i of ['I1', 'I2'] as const) for (const x of ['X1', 'X2'] as const) {
      const own = evaluate('A2', 'S1', i, x)
      for (const s of ['S2', 'S3'] as const) {
        const other = evaluate('A2', s, i, x)
        expect(own.day! - own.decisionDay!).toBeLessThan(other.day! - other.decisionDay!)
      }
    }
    expect(evaluate('A2', 'S1', 'I2', 'X1').day).toBeGreaterThan(evaluate('A2', 'S2', 'I2', 'X1').day!)
  })
  it('停止和缩减保留不同首段的实际成果，不能用统一尾声抹掉范围', () => {
    for (const s of ['S1', 'S2', 'S3'] as const) for (const x of ['X2', 'X3'] as const) {
      const narrow = epilogue(evaluate('A2', s, 'I1', x)).scene
      const broad = epilogue(evaluate('A2', s, 'I2', x)).scene
      expect(narrow).toContain('关键记录')
      expect(broad).toContain('并行复核')
      expect(narrow).not.toBe(broad)
      if (x === 'X2') { expect(narrow).toContain('修订'); expect(broad).toContain('修订') }
    }
  })
})
