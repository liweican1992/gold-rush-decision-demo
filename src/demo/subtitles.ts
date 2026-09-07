export type SubtitleCue = {
  start: number
  end: number
  text: string
}

export const INTRO_SUBTITLES: SubtitleCue[] = [
  { start: 4.42, end: 7.0, text: '队长，化验结果出来了' },
  { start: 7.02, end: 10.0, text: '高品位金矿。我们真的找到了' },
  { start: 17.2, end: 20.02, text: '三个月的赌注，终于有了答案' },
  { start: 25.16, end: 26.82, text: '但合同只剩十四天' },
  { start: 27.46, end: 30.4, text: '迟一天，矿权就可能被公开拍卖' },
  { start: 36.3, end: 39.72, text: '翻山七到十天，走山谷至少两周' },
  { start: 43.9, end: 47.68, text: '四十八小时后，才知道风暴会不会封山' },
  { start: 54.0, end: 55.18, text: '山谷可能赶不上' },
  { start: 55.18, end: 58.66, text: '可你这只手，也未必撑得住翻山' },
  { start: 63.86, end: 65.66, text: '队长，决定吧' },
]

// Measured from the approved shared-layer clips. Cues deliberately start after
// each detected speech onset so the Web subtitles never anticipate the audio.
export const SHARED_X1_SUBTITLES: SubtitleCue[] = [
  { start: 2.29, end: 2.99, text: '照顾队员' },
  { start: 3.21, end: 4.63, text: '保住样本' },
  { start: 5.19, end: 5.97, text: '修好运载' },
  { start: 7.03, end: 8.09, text: '或者马上赶路' },
  { start: 8.79, end: 9.08, text: '时间只够选一项' },
  { start: 9.48, end: 9.79, text: '队长，你定' },
]

export const SHARED_X2_SUBTITLES: SubtitleCue[] = [
  { start: 1.89, end: 4.16, text: '可以受让资料和期权相关权益，先核验' },
  { start: 4.49, end: 5.04, text: '可以分阶段合作' },
  { start: 5.56, end: 6.68, text: '先补执行能力' },
  { start: 6.99, end: 8.01, text: '也可以独立推进' },
  { start: 9.04, end: 9.96, text: '三种方式' },
  { start: 10.34, end: 11.08, text: '你定' },
]

export const SHARED_X3_SUBTITLES: SubtitleCue[] = [
  { start: 2.52, end: 4.1, text: '时间和条件都核对过了' },
  { start: 5.79, end: 7.51, text: '这里只留现在能做的选择' },
  { start: 8.38, end: 9.02, text: '选定后' },
  { start: 9.47, end: 9.83, text: '不再改' },
]

// Measured from the approved 12.256-second shared END-F1/F2 audio track.
// Preserve the real pauses between radio confirmation and Shen Lan's response.
export const END_SUBMIT_SHARED_SUBTITLES: SubtitleCue[] = [
  { start: 2.26, end: 3.42, text: '材料已接收' },
  { start: 3.67, end: 4.89, text: '进入核验' },
  { start: 7.46, end: 8.55, text: '流程已经启动' },
  { start: 9.44, end: 10.17, text: '能走多远' },
  { start: 10.63, end: 11.85, text: '要看我们留下的基础' },
]

// Measured from the approved 10.144-second END-F3 audio track.
// Keep these cues independent from Pavo's planned script timings.
export const END_F3_SUBTITLES: SubtitleCue[] = [
  { start: 1.73, end: 3.41, text: '材料已接收' },
  { start: 3.91, end: 5.45, text: '后续节点需要共同确认' },
  { start: 6.55, end: 7.41, text: '流程已经启动' },
  { start: 7.97, end: 9.84, text: '后续安排，需要共同确认' },
]

// Measured from the approved 12.256-second END-F4 audio track.
// The pauses are intentional so subtitles never anticipate either speaker.
export const END_F4_SUBTITLES: SubtitleCue[] = [
  { start: 0.99, end: 1.58, text: '交接确认' },
  { start: 2.97, end: 5.62, text: '相关资料与期权权益进入后续流程' },
  { start: 7.37, end: 8.3, text: '约定已经落实' },
  { start: 9.13, end: 9.99, text: '我们回收投入' },
  { start: 10.39, end: 12.25, text: '也放弃这次机会的后续上行' },
]

// Measured from the approved 12.256-second END-F5 audio track.
// Keep the long action pauses clear instead of anticipating the dialogue.
export const END_F5_SUBTITLES: SubtitleCue[] = [
  { start: 4.66, end: 6.42, text: '人员和资料先走' },
  { start: 10.24, end: 11.71, text: '到这里为止，不再追加' },
]

// Measured from the approved 12.256-second END-F6 audio track.
// Split at real pauses so long sentences never appear before they are spoken.
export const END_F6_SUBTITLES: SubtitleCue[] = [
  { start: 1.16, end: 1.93, text: '窗口关闭' },
  { start: 2.35, end: 3.77, text: '原有优先时间失效' },
  { start: 5.06, end: 5.77, text: '资料还在' },
  { start: 6.3, end: 7.08, text: '但先手没了' },
  { start: 8.12, end: 8.68, text: '接下来' },
  { start: 9.16, end: 10.61, text: '只能面对公开竞争' },
  { start: 11.05, end: 11.92, text: '或补充审查' },
]

export function findSubtitle(cues: SubtitleCue[], currentTime: number) {
  return cues.find((cue) => currentTime >= cue.start && currentTime < cue.end)
}
