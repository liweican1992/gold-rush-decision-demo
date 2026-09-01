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

export function findSubtitle(cues: SubtitleCue[], currentTime: number) {
  return cues.find((cue) => currentTime >= cue.start && currentTime < cue.end)
}
