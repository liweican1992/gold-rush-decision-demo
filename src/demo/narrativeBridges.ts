import { branchForDecisions, type LatestDecision } from "./latestStory"

export type NarrativeCard = { title: string; detail: string }
export type VideoBridge = NarrativeCard & { at: number; resumeAt: number }
// Source-video seconds. Cards pause playback, so calibrated dialogue timing stays unchanged.
// The insertion points are in dialogue gaps and at inspected scene/time changes.
export const VIDEO_BRIDGES: Record<string, VideoBridge[]> = {
  "a-route-to-a02-choice.mp4": [
    {at:10.5,resumeAt:10.5,title:"第三天 · 高处的风雪",detail:"前两天赶路顺利。继续往高处走，风和雪渐渐变强。"},
  ],
  "a-continue-to-a04-choice.mp4": [
    {at:20.2,resumeAt:20.292,title:"第五天 · 山路后段",detail:"队友分担了装备，你们继续赶路，走到了最后一处容易折返的位置。"},
  ],
  "b-route-to-b02-choice.mp4": [
    {at:7.6,resumeAt:7.717,title:"第六天 · 途中休整",detail:"队伍沿谷地走了六天。停下来时，沈岚重新核对了剩余路程。"},
  ],
  "b-accelerate-to-b04-choice.mp4": [
    {at:12.15,resumeAt:12.25,title:"三天后",detail:"你们缩短午休，每天多赶一段路。现在停下来，检查进度和队员状态。"},
  ],
  "b-steady-to-b04-choice.mp4": [
    {at:12.15,resumeAt:12.25,title:"三天后",detail:"队伍按原来的节奏走到谷地后段。再次停下，核对能否赶上期限。"},
  ],
  "c-route-to-c02-choice.mp4": [
    {at:12.15,resumeAt:12.25,title:"两天后 · 营地",detail:"你们一直留在营地观察天气，等待更明确的消息。"},
  ],
  "d-route-to-d03-choice.mp4": [
    {at:16,resumeAt:16,title:"第五天 · 下午",detail:"最强的风势过去了。老周再次观察天气，沈岚重新摊开地图。"},
  ],
  "d-reverse-to-d05-choice.mp4": [
    {at:7.9,resumeAt:8,title:"离开营地后",detail:"你们收好地图和装备，沿低处山路出发，再向高处行进。"},
    {at:21.4,resumeAt:21.5,title:"第九天 · 山路后段",detail:"队伍又走了几天，有一段路比预计走得慢。你们停下来，重新核算剩余时间。"},
  ],
  "d-wait-to-result.mp4": [
    {at:9.9,resumeAt:10,title:"日子一天天过去",detail:"你们继续留在营地，等到天气真正稳定，再安排返程。"},
  ],
  "a4fb3-retreat-to-valley.mp4": [
    {at:12.15,resumeAt:12.25,title:"下到谷地后",detail:"队伍离开高处，沿较平缓的谷地继续返程。"},
  ],
  "c2fb2-leave-for-valley.mp4": [
    {at:12.15,resumeAt:12.25,title:"离开营地后",detail:"你们收好装备，放弃等待山口消息，沿谷地开始返程。"},
  ],
  "c04va-day3-to-valley.mp4": [
    {at:12.15,resumeAt:12.25,title:"离开营地后",detail:"你们收好装备，转入谷地。离开营地时，已经比最初晚了三天。"},
  ],
  "c04vb-day7-to-valley.mp4": [
    {at:12.15,resumeAt:12.25,title:"撤下山路后",detail:"你们离开高处，重新接上谷地路线，继续往镇上走。"},
  ],
}
export function bridgesForVideo(src: string) { return VIDEO_BRIDGES[src.split("/").at(-1)!] ?? [] }
export function pendingBridge(bridges: VideoBridge[], time: number, shown: ReadonlySet<number>) {
  return bridges.findIndex((bridge, index) => !shown.has(index) && time >= bridge.at)
}
export function cardDuration(card: NarrativeCard) {
  return Math.min(5600, Math.max(3400, (card.title.length + card.detail.length) * 90))
}
export function resultBridge(decisions: LatestDecision[]): NarrativeCard | undefined {
  const branch = branchForDecisions(decisions)
  if (!branch) return undefined
  const chose = (id: string) => decisions.some(d=>d.optionId === id)
  if (branch.id === "C-05") return {title:"不再追赶这次期限",detail:"队伍停止争取原窗口，转入安全返程安排。接下来，回看这次取舍。"}
  if (branch.id === "D-01") return {title:"数周后 · 安全返回",detail:"天气稳定后，队伍完成了返程。这场漫长的等待终于结束。"}
  if (branch.id === "A-05" || ["C-01","C-04","C-06"].includes(branch.id)) return {
    title:"经过多日跋涉 · 镇外",
    detail: branch.id === "A-05" ? "下撤后，你们沿谷地继续赶路。绕过山地，镇上的建筑终于出现在前方。" : "队伍沿谷地走了许多天。穿过最后一段山谷，终于看到了镇上的建筑。",
  }
  if (branch.route === "A") return {title:"几天后 · 走出山地",detail:chose("A4-2") ? "你们放慢节奏，照护伤手，继续沿山路前进。走完余下路程，镇子终于近了。" : "队伍按既定节奏走完余下的山路。眼前的雪坡渐渐让位于镇上的道路。"}
  if (branch.route === "B") return {title:"几天后 · 接近镇子",detail:chose("B4A-1") || chose("B4B-1") ? "此后的几天，你们压缩休息时间，继续赶路。漫长的谷地终于走到了尽头。" : "你们按能持续走下去的节奏返程。经过几天行进，终于走出了谷地。"}
  if (branch.route === "C") return {title:"几天后 · 走出山地",detail:chose("C6-2") ? "你们边观察天气边放慢推进，走完了余下的山路。前方终于出现镇子的轮廓。" : "你们按原计划继续推进，留意现场天气，走完余下山路，终于接近镇子。"}
  return {title:"几天后 · 走出山地",detail:chose("D5-2") ? "队伍降低了强度，按身体能承受的速度返程。走过最后一段山路，镇子就在前方。" : "队伍保持较快节奏，边赶路边留意身体状态。走过最后一段山路，镇子就在前方。"}
}
