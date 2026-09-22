import { latestNode, type LatestDecision } from "./latestStory"

// Times describe this scene, never the possible completion dates of other branches.
export function presentNode(id: string, decisions: LatestDecision[]) {
  const original = latestNode(id)
  if (!original) return undefined
  const node = { ...original }
  const chose = (option: string) => decisions.some(d => d.optionId === option)
  const rested = chose("A2-2")
  const times: Record<string, string> = {
    A01: "Day 2—3", A03A: "Day 4—5", A03B: "Day 5—6",
    A03R: "Day 3 · 开始下撤", A04: rested ? "Day 6" : "Day 5",
    A4FB1: rested ? "Day 6 · 继续前进" : "Day 5 · 继续前进",
    A4FB2: rested ? "Day 6 · 调整节奏" : "Day 5 · 调整节奏",
    A4FB3: rested ? "Day 6 · 开始下撤" : "Day 5 · 开始下撤",
    B01: "Day 0—6", C05: "Day 5—6", D01: "Day 3—5", B03A: "Day 6—9", B03B: "Day 6—9",
    B4FBDAWN: "Day 9 · 开始最后赶路", B4FBREST: "Day 9 · 按可持续节奏继续",
    C6FB2: "Day 7 · 开始放慢观察", D04B: "Day 5—9",
    D5FB1: "Day 9 · 继续赶路", D5FB2: "Day 9 · 调整节奏",
    D04A: "Day 5 起 · 等待至天气稳定",
  }
  node.time = times[id] ?? node.time
  let condition = "左手偶发失力"
  if (node.route === "A" && chose("A2-1")) condition = "左手受限，队友分担装备"
  if (node.route === "A" && rested) condition = "暂避后手较稳，仍需照护"
  if (node.route === "B" && chose("B2-1")) condition = "连续赶路，疲劳加重"
  if (node.route === "C" && id !== "C01") condition = "左手休息后仍未痊愈"
  if (node.route === "D" && id !== "D01") condition = "休息后手较稳，仍需照护"
  if (id === "D05" || id.startsWith("D5FB")) condition = "体力再下降，时间余量很少"
  if (id === "P06") node.facts = "截止第十四天上午九点，必须本人完成确认。翻山通常七到十天；山谷通常两到三周。等两天可确认暴风，再等一天可进一步判断山口。左手突然失力可能影响攀爬。"
  if (id === "A04") node.facts = rested
    ? "你已暂避约两天，手稳了一些，但时间余量减少。前方仍能走；这里是最后一个容易折返的位置，再深入就更难撤回。"
    : "你此前继续推进，时间还有余量，但伤手限制加重，队友已分担装备。这里是最后一个容易折返的位置，再深入就更难撤回。"
  if (id === "B04" && "question" in node) {
    node.question = chose("B2-1") ? "已经连赶三天，还要保持这个强度吗？" : "照现在走会超期，要开始冲刺吗？"
    node.facts = chose("B2-1")
      ? "三天赶路追回了约一天，队员开始疲劳，伤手负担也变重。继续赶还有机会按期到达；降速能恢复一些状态，但会少掉赶路时间。"
      : "你此前一直保持原节奏，人员状态较好，但照这个速度赶不上期限。现在提速，比三天前更集中地消耗体力。"
  }
  if (id === "D03") node.facts = "已等了五天，手和体力有所恢复。风势减弱，出现短暂窗口，但山路仍有风险；离截止只剩八天多。"
  return { node, condition }
}

// Actual end frames from the already accepted predecessor films.
export function decisionBackdrop(id: string, decisions: LatestDecision[]) {
  const suffix = id === "A04" ? (decisions.some(d => d.optionId === "A2-2") ? "rest" : "continue")
    : id === "B04" ? (decisions.some(d => d.optionId === "B2-1") ? "fast" : "steady") : ""
  return `/images/decision-stills/${id}${suffix ? "-" + suffix : ""}.jpg`
}
