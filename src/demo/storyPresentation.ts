import { latestNode, type LatestDecision } from "./latestStory"
import type { FinalRoute } from "./finalStoryMap"

export type LatestDecisionBackdrop = {
  id: string
  nodeId: string
  route: FinalRoute
  title: string
  context: string
  src: string
}

export const LATEST_DECISION_BACKDROPS: LatestDecisionBackdrop[] = [
  { id: 'P06', nodeId: 'P06', route: 'PUBLIC', title: '第一次路线选择', context: '共同开场', src: '/images/decision-stills/P06.webp' },
  { id: 'A02', nodeId: 'A02', route: 'A', title: '风雪中的路线选择', context: '翻山路线', src: '/images/decision-stills/A02.webp' },
  { id: 'A04-continue', nodeId: 'A04', route: 'A', title: '最后回头点', context: '此前继续推进', src: '/images/decision-stills/A04-continue.webp' },
  { id: 'A04-rest', nodeId: 'A04', route: 'A', title: '最后回头点', context: '此前暂避风雪', src: '/images/decision-stills/A04-rest.webp' },
  { id: 'B02', nodeId: 'B02', route: 'B', title: '第一次节奏选择', context: 'Day 6 进度盘点', src: '/images/decision-stills/B02.webp' },
  { id: 'B04-fast', nodeId: 'B04', route: 'B', title: '第二次节奏选择', context: '此前已提速', src: '/images/decision-stills/B04-fast.webp' },
  { id: 'B04-steady', nodeId: 'B04', route: 'B', title: '第二次节奏选择', context: '此前保持原节奏', src: '/images/decision-stills/B04-steady.webp' },
  { id: 'C02', nodeId: 'C02', route: 'C', title: '第一轮天气信息选择', context: '已等待两天', src: '/images/decision-stills/C02.webp' },
  { id: 'C03', nodeId: 'C03', route: 'C', title: '第二轮天气信息选择', context: '已等待三天', src: '/images/decision-stills/C03.webp' },
  { id: 'C06', nodeId: 'C06', route: 'C', title: '山路现场再判断', context: '风势比预想退得慢', src: '/images/decision-stills/C06.webp' },
  { id: 'D03', nodeId: 'D03', route: 'D', title: '天气窗口出现后的选择', context: '已安全等待五天', src: '/images/decision-stills/D03.webp' },
  { id: 'D05', nodeId: 'D05', route: 'D', title: '反转后的再判断', context: '时间余量已经很少', src: '/images/decision-stills/D05.webp' },
]

// Times describe this scene, never the possible completion dates of other branches.
export function presentNode(id: string, decisions: LatestDecision[]) {
  const original = latestNode(id)
  if (!original) return undefined
  const node = { ...original }
  // During play, describe the situation; reserve teaching conclusions for the report.
  const titles: Record<string, string> = {
    A01: '沿山路前进', A02: '风雪中的决定', A03A: '停下来检查伤手',
    A03B: '暂避后重新出发', A04: '最后一处容易折返的位置',
    B01: '沿谷地前进', B02: '重新核算行程', B03A: '连续三天赶路',
    B03B: '按原节奏前进', B04: '接下来怎么赶路',
    C01: '留在营地等消息', C02: '暴风消息到了', C03: '山口有了新消息',
    C04M: '先沿低处上山', C05: '接近山口', C06: '风势比预想退得慢',
    D01: '留营休整', D03: '风势减弱，重新商量', D04A: '继续留营等待',
    D04B: '收拾装备，离营上山', D05: '再次核算剩余时间',
    C2FB1: '再等一天消息', C6FB2: '放慢脚步，观察风势',
  }
  const questions: Record<string, string> = {
    P06: '你准备怎么行动？', A02: '风雪变大，左手也刚失了力。接下来怎么办？',
    A04: '继续走山路、放慢脚步，还是现在下撤？',
    C02: '再等一天，还是现在改走山谷？', C03: '有了这份消息，接下来怎么行动？',
    C06: '风比预想退得慢，还按原计划走吗？',
    D03: '趁现在出发，还是继续等？', D05: '时间所剩不多，还要保持这个速度吗？',
  }
  node.title = titles[id] ?? node.title
  if ('question' in node) node.question = questions[id] ?? node.question
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
  if (id === "P06") node.facts = "镇上的确认点全天值守，但截止第十四天上午九点，必须由你本人完成确认。翻山通常七到十天；山谷通常两到三周。等两天可确认是否有暴风，再等一天可进一步判断山口。左手突然失力可能影响攀爬。"
  if (id === "C02") node.facts = "已确认高地会受暴风影响；山口是否可通仍不确定。再等约一天可核实山口是否已封死及风势后续走向，但仍不能保证一路顺利。"
  if (id === "C03") node.facts = "新消息是：山口尚未确定封死，最强的风过去后预计会缓和。比昨天多了风势走向的判断，但仍不能保证通行；离期限还剩约十一天。"
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
  const backdropId = `${id}${suffix ? "-" + suffix : ""}`
  return LATEST_DECISION_BACKDROPS.find((item) => item.id === backdropId)?.src
    ?? `/images/decision-stills/${backdropId}.webp`
}
