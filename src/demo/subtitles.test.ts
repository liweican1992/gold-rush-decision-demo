import { describe, expect, it } from 'vitest'
import {
  END_SUBMIT_SHARED_SUBTITLES,
  END_F3_SUBTITLES,
  END_F4_SUBTITLES,
  END_F5_SUBTITLES,
  END_F6_SUBTITLES,
  INTRO_SUBTITLES,
  SHARED_X1_SUBTITLES,
  SHARED_X2_SUBTITLES,
  SHARED_X3_SUBTITLES,
  findSubtitle,
} from './subtitles'

describe('shared X1-X3 subtitles', () => {
  it('starts each X1 phrase after its measured speech onset', () => {
    expect(SHARED_X1_SUBTITLES).toEqual([
      { start: 2.29, end: 2.99, text: '照顾队员' },
      { start: 3.21, end: 4.63, text: '保住样本' },
      { start: 5.19, end: 5.97, text: '修好运载' },
      { start: 7.03, end: 8.09, text: '或者马上赶路' },
      { start: 8.79, end: 9.08, text: '时间只够选一项' },
      { start: 9.48, end: 9.79, text: '队长，你定' },
    ])
    expect(findSubtitle(SHARED_X1_SUBTITLES, 2.2)).toBeUndefined()
  })

  it('preserves the real pauses between X2 radio and in-person dialogue', () => {
    expect(SHARED_X2_SUBTITLES).toEqual([
      { start: 1.89, end: 4.16, text: '可以受让资料和期权相关权益，先核验' },
      { start: 4.49, end: 5.04, text: '可以分阶段合作' },
      { start: 5.56, end: 6.68, text: '先补执行能力' },
      { start: 6.99, end: 8.01, text: '也可以独立推进' },
      { start: 9.04, end: 9.96, text: '三种方式' },
      { start: 10.34, end: 11.08, text: '你定' },
    ])
    expect(findSubtitle(SHARED_X2_SUBTITLES, 8.5)).toBeUndefined()
  })

  it('keeps X3 subtitles off before dialogue and between clauses', () => {
    expect(SHARED_X3_SUBTITLES).toEqual([
      { start: 2.52, end: 4.1, text: '时间和条件都核对过了' },
      { start: 5.79, end: 7.51, text: '这里只留现在能做的选择' },
      { start: 8.38, end: 9.02, text: '选定后' },
      { start: 9.47, end: 9.83, text: '不再改' },
    ])
    expect(findSubtitle(SHARED_X3_SUBTITLES, 2.4)).toBeUndefined()
    expect(findSubtitle(SHARED_X3_SUBTITLES, 7.8)).toBeUndefined()
  })
})

describe('END-F1/F2 shared subtitles', () => {
  it('follows the five measured speech groups in the approved 12.26-second clip', () => {
    expect(END_SUBMIT_SHARED_SUBTITLES).toEqual([
      { start: 2.26, end: 3.42, text: '材料已接收' },
      { start: 3.67, end: 4.89, text: '进入核验' },
      { start: 7.46, end: 8.55, text: '流程已经启动' },
      { start: 9.44, end: 10.17, text: '能走多远' },
      { start: 10.63, end: 11.85, text: '要看我们留下的基础' },
    ])
  })

  it('keeps subtitles off before speech, between speakers, and after the final line', () => {
    expect(findSubtitle(END_SUBMIT_SHARED_SUBTITLES, 2.2)).toBeUndefined()
    expect(findSubtitle(END_SUBMIT_SHARED_SUBTITLES, 2.3)?.text).toBe('材料已接收')
    expect(findSubtitle(END_SUBMIT_SHARED_SUBTITLES, 5.5)).toBeUndefined()
    expect(findSubtitle(END_SUBMIT_SHARED_SUBTITLES, 8.9)).toBeUndefined()
    expect(findSubtitle(END_SUBMIT_SHARED_SUBTITLES, 12)).toBeUndefined()
  })
})

describe('intro subtitles', () => {
  it('keeps all dialogue cues ordered and non-overlapping', () => {
    expect(INTRO_SUBTITLES).toHaveLength(10)

    for (const [index, cue] of INTRO_SUBTITLES.entries()) {
      expect(cue.end).toBeGreaterThan(cue.start)
      if (index > 0) expect(cue.start).toBeGreaterThanOrEqual(INTRO_SUBTITLES[index - 1].end)
    }
  })

  it('finds the active cue and clears it between lines', () => {
    expect(findSubtitle(INTRO_SUBTITLES, 5)?.text).toBe('队长，化验结果出来了')
    expect(findSubtitle(INTRO_SUBTITLES, 9.5)?.text).toBe('高品位金矿。我们真的找到了')
    expect(findSubtitle(INTRO_SUBTITLES, 15)).toBeUndefined()
    expect(findSubtitle(INTRO_SUBTITLES, 65.8)).toBeUndefined()
  })

  it('uses the detected speech boundaries from the final audio track', () => {
    expect(INTRO_SUBTITLES.map(({ start, end }) => [start, end])).toEqual([
      [4.42, 7.0],
      [7.02, 10.0],
      [17.2, 20.02],
      [25.16, 26.82],
      [27.46, 30.4],
      [36.3, 39.72],
      [43.9, 47.68],
      [54.0, 55.18],
      [55.18, 58.66],
      [63.86, 65.66],
    ])
  })
})

describe('END-F3 subtitles', () => {
  it('follows the measured speech groups in the approved 10.14-second clip', () => {
    expect(END_F3_SUBTITLES).toEqual([
      { start: 1.73, end: 3.41, text: '材料已接收' },
      { start: 3.91, end: 5.45, text: '后续节点需要共同确认' },
      { start: 6.55, end: 7.41, text: '流程已经启动' },
      { start: 7.97, end: 9.84, text: '后续安排，需要共同确认' },
    ])
  })

  it('does not show the first subtitle before speech starts or during pauses', () => {
    expect(findSubtitle(END_F3_SUBTITLES, 1.6)).toBeUndefined()
    expect(findSubtitle(END_F3_SUBTITLES, 1.8)?.text).toBe('材料已接收')
    expect(findSubtitle(END_F3_SUBTITLES, 3.6)).toBeUndefined()
    expect(findSubtitle(END_F3_SUBTITLES, 9.95)).toBeUndefined()
  })
})

describe('END-F4 subtitles', () => {
  it('follows the measured speech groups in the approved 12.26-second clip', () => {
    expect(END_F4_SUBTITLES).toEqual([
      { start: 0.99, end: 1.58, text: '交接确认' },
      { start: 2.97, end: 5.62, text: '相关资料与期权权益进入后续流程' },
      { start: 7.37, end: 8.3, text: '约定已经落实' },
      { start: 9.13, end: 9.99, text: '我们回收投入' },
      { start: 10.39, end: 12.25, text: '也放弃这次机会的后续上行' },
    ])
  })

  it('keeps subtitles off before speech and during the long speaker pause', () => {
    expect(findSubtitle(END_F4_SUBTITLES, 0.9)).toBeUndefined()
    expect(findSubtitle(END_F4_SUBTITLES, 1.1)?.text).toBe('交接确认')
    expect(findSubtitle(END_F4_SUBTITLES, 2.2)).toBeUndefined()
    expect(findSubtitle(END_F4_SUBTITLES, 6.5)).toBeUndefined()
  })
})

describe('END-F5 subtitles', () => {
  it('follows the measured speech groups in the approved 12.26-second clip', () => {
    expect(END_F5_SUBTITLES).toEqual([
      { start: 4.66, end: 6.42, text: '人员和资料先走' },
      { start: 10.24, end: 11.71, text: '到这里为止，不再追加' },
    ])
  })

  it('keeps subtitles off before each spoken line and after the final line', () => {
    expect(findSubtitle(END_F5_SUBTITLES, 4.5)).toBeUndefined()
    expect(findSubtitle(END_F5_SUBTITLES, 4.8)?.text).toBe('人员和资料先走')
    expect(findSubtitle(END_F5_SUBTITLES, 8)).toBeUndefined()
    expect(findSubtitle(END_F5_SUBTITLES, 10.3)?.text).toBe('到这里为止，不再追加')
    expect(findSubtitle(END_F5_SUBTITLES, 11.8)).toBeUndefined()
  })
})

describe('END-F6 subtitles', () => {
  it('follows each measured phrase in the approved 12.26-second clip', () => {
    expect(END_F6_SUBTITLES).toEqual([
      { start: 1.16, end: 1.93, text: '窗口关闭' },
      { start: 2.35, end: 3.77, text: '原有优先时间失效' },
      { start: 5.06, end: 5.77, text: '资料还在' },
      { start: 6.3, end: 7.08, text: '但先手没了' },
      { start: 8.12, end: 8.68, text: '接下来' },
      { start: 9.16, end: 10.61, text: '只能面对公开竞争' },
      { start: 11.05, end: 11.92, text: '或补充审查' },
    ])
  })

  it('does not anticipate speech across the measured pauses', () => {
    expect(findSubtitle(END_F6_SUBTITLES, 1)).toBeUndefined()
    expect(findSubtitle(END_F6_SUBTITLES, 1.2)?.text).toBe('窗口关闭')
    expect(findSubtitle(END_F6_SUBTITLES, 4.5)).toBeUndefined()
    expect(findSubtitle(END_F6_SUBTITLES, 7.5)).toBeUndefined()
    expect(findSubtitle(END_F6_SUBTITLES, 12)).toBeUndefined()
  })
})
