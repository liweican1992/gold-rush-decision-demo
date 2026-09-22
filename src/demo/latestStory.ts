import {
  FINAL_BRANCHES,
  FINAL_KEYFRAMES,
  FINAL_NODES,
  type FinalBranch,
  type FinalNode,
  type FinalOption,
  type FinalRoute,
} from './finalStoryMap'

export type LatestDecision = {
  nodeId: string
  optionId: string
  label: string
  reason?: string
  recordedAt?: string
}

export type LatestVirtualNode = {
  id: string
  route: FinalRoute
  title: string
  kind: '剧情' | '过渡'
  time: string
  location: string
  facts: string
  knowledge: string
  frameIds: string[]
}

const LATEST_VIDEO_BASE_URL = (import.meta.env.VITE_VIDEO_BASE_URL || '/videos/latest').replace(/\/+$/, '')

function latestVideo(filename: string) {
  return `${LATEST_VIDEO_BASE_URL}/${filename}`
}

export const LATEST_PUBLIC_VIDEO = latestVideo('public-intro.mp4')

export const LATEST_RESULT_VIDEOS = {
  day: latestVideo('sh-town-day.mp4'),
  night: latestVideo('sh-town-night.mp4'),
} as const

export type LatestArrivalOutcome = {
  image: string
  eyebrow: string
  title: string
  detail: string
  tone: 'confirmed' | 'closed' | 'safe'
}

export const LATEST_TIME_TRANSITIONS: Record<string, { title: string; detail: string }> = {
  A01: { title: '两天后 · 山路前段', detail: '离开营地后，你们沿山路赶路，已经走了两天。' },
  A03A: { title: '次日傍晚', detail: '你们顶着风雪继续推进。停下来时，阿杰再次检查你的左手。' },
  A03B: { title: '两天后', detail: '队伍在背风处暂避了两天。最强的风势过去，你们重新出发。' },
  B01: { title: '出发后 · 谷地', detail: '你们离开营地，绕开高处，沿谷地开始返程。' },
  C03: { title: '又过了一天', detail: '队伍再等了一个白天和夜晚，关于山口的消息终于传来。' },
  C04M: { title: '第三天 · 离开营地', detail: '你们带着新的天气判断出发，先沿低处的山路行进。' },
  C05: { title: '两天后 · 接近山口', detail: '队伍先在低处走过风势最强的两天，等风缓下来，再往高处走。' },
  C06: { title: '第七天 · 山路现场', detail: '队伍继续前进。到了更高处，老周再次检查前方的风势。' },
  D01: { title: '第三天 · 留守营地', detail: '队伍留在营地休整，高处的风雪开始增强。' },
}

export const LATEST_NODE_VIDEOS: Record<string, string[]> = {
  A01: [latestVideo('a-route-to-a02-choice.mp4')],
  A03A: [latestVideo('a-continue-to-a04-choice.mp4')],
  A03B: [latestVideo('a03b-shelter-restart.mp4')],
  A03R: [latestVideo('a4fb3-retreat-to-valley.mp4')],
  A4FB1: [latestVideo('a4fb1.mp4')],
  A4FB2: [latestVideo('a4fb2-slow-down.mp4')],
  A4FB3: [latestVideo('a4fb3-retreat-to-valley.mp4')],
  B01: [latestVideo('b-route-to-b02-choice.mp4')],
  B03A: [latestVideo('b-accelerate-to-b04-choice.mp4')],
  B03B: [latestVideo('b-steady-to-b04-choice.mp4')],
  B4FBDAWN: [latestVideo('b-final-dawn.mp4')],
  B4FBREST: [latestVideo('b-final-rest.mp4')],
  C01: [latestVideo('c-route-to-c02-choice.mp4')],
  C2FB1: [latestVideo('c2fb1-wait-one-more-day.mp4')],
  C2FB2: [latestVideo('c2fb2-leave-for-valley.mp4')],
  C03: [latestVideo('c03-second-information.mp4')],
  C04M: [latestVideo('c04m-low-mountain-route.mp4')],
  C04VA: [latestVideo('c04va-day3-to-valley.mp4')],
  C05: [latestVideo('c05-information-proves-useful.mp4')],
  C06: [latestVideo('c06-reality-update-choice.mp4')],
  C6FB2: [latestVideo('c6fb2-observe-and-buffer.mp4')],
  C04VB: [latestVideo('c04vb-day7-to-valley.mp4')],
  C04V: [latestVideo('sh-valley-travel.mp4')],
  D01: [latestVideo('d-route-to-d03-choice.mp4')],
  D04A: [latestVideo('d-wait-to-result.mp4')],
  D04B: [latestVideo('d-reverse-to-d05-choice.mp4')],
  D5FB1: [latestVideo('d5fb1.mp4')],
  D5FB2: [latestVideo('d5fb2.mp4')],
}

const VIRTUAL_NODES: Record<string, LatestVirtualNode> = {
  A4FB1: {
    id: 'A4FB1', route: 'A', title: '按现在的节奏继续', kind: '剧情',
    time: '约 Day 9—11', location: '山路后段→办事地点',
    facts: '队伍不再改路，继续承担当前身体与时间状态，按现有节奏完成余下路程。',
    knowledge: '保持承诺；承担既有代价', frameIds: ['A04C'],
  },
  A4FB2: {
    id: 'A4FB2', route: 'A', title: '留在山路，主动降低节奏', kind: '过渡',
    time: '约 Day 10—12', location: '山路后段→办事地点',
    facts: '路线不变，但减少强行赶路，用约一天时间换回照护与执行稳定。',
    knowledge: '保留目标；调整执行方式', frameIds: ['A4FB-2'],
  },
  A4FB3: {
    id: 'A4FB3', route: 'A', title: '趁现在还能退，撤回改走谷地', kind: '过渡',
    time: '约 Day 5—6以后', location: '山路下撤→谷地',
    facts: '队伍在最后回头点退出山路，先前已投入的时间无法收回，转入谷地后原十四天窗口基本无法恢复。',
    knowledge: '止损；已投入成本不应绑定后续选择', frameIds: ['A03R-D5', 'SH-VAL-WEB'],
  },
  B4FBDAWN: {
    id: 'B4FBDAWN', route: 'B', title: '把最后的时间追回来', kind: '剧情',
    time: 'Day 9—14', location: '谷地后段→办事地点',
    facts: '队伍继续提高强度，用几乎全部恢复余量换取最后的时间窗口。',
    knowledge: '期限优先；承担疲劳代价', frameIds: ['B4FB-DAWN'],
  },
  B4FBREST: {
    id: 'B4FBREST', route: 'B', title: '回到可持续节奏', kind: '剧情',
    time: 'Day 9以后', location: '谷地后段→安全休整',
    facts: '队伍不再继续透支体力，接受原期限可能失去，用恢复余量换取稳定完成行程。',
    knowledge: '恢复优先；接受时间代价', frameIds: ['B4FB-REST'],
  },
  C2FB2: {
    id: 'C2FB2', route: 'C', title: '不再继续等，转走山谷', kind: '过渡',
    time: 'Day 2 · 09:00以后', location: '营地→谷地方向',
    facts: '队伍停止等待山口信息，立即收拾地图与装备，按Day 2重新计算谷地行程。',
    knowledge: '信息已经够用；把决定转成行动', frameIds: ['C2FB-2'],
  },
  C2FB1: {
    id: 'C2FB1', route: 'C', title: '再等一天，买更完整的信息', kind: '剧情',
    time: 'Day 2 · 09:00以后', location: '营地',
    facts: '队伍确认再支付一天等待成本；无论明天的信息如何，都必须把判断转成行动。',
    knowledge: '继续等待的边界；为信息设止损点', frameIds: ['C2FB-1'],
  },
  C04VA: {
    id: 'C04VA', route: 'C', title: '等到第三天后转走山谷', kind: '过渡',
    time: 'Day 3 · 09:00以后', location: '营地→谷地方向',
    facts: '队伍按Day 3重新计算谷地行程，前面等待的三天不会返还，原十四天窗口已经明确失去。',
    knowledge: '信息改变行动；等待成本已经发生', frameIds: ['C04V-A'],
  },
  C6FB2: {
    id: 'C6FB2', route: 'C', title: '放慢节奏，增加观察与缓冲', kind: '剧情',
    time: '约 Day 7—13', location: '山路现场→办事地点',
    facts: '队伍不立即进入高处，继续观察天气并保留行动缓冲，最终只剩约一天时间余量。',
    knowledge: '用时间换稳定；剩余缓冲收窄', frameIds: ['C6FB-2'],
  },
  C04VB: {
    id: 'C04VB', route: 'C', title: '停止高地推进，改走谷地', kind: '过渡',
    time: '约 Day 7以后', location: '山路下撤→谷地',
    facts: '队伍根据现场新信息停止高地路线，向谷地下撤；先前等待换来的信息仍然有价值，但原十四天窗口已无法保住。',
    knowledge: '根据新证据退出旧承诺', frameIds: ['C04V-B', 'SH-VAL-WEB'],
  },
  D5FB1: {
    id: 'D5FB1', route: 'D', title: '保持较快节奏，继续争取窗口', kind: '剧情',
    time: '约 Day 9—14', location: '山路后段→办事地点',
    facts: '队伍把反转执行到底，保持较快节奏前进，并承担几乎没有调整余量的代价。',
    knowledge: '执行承诺；小时级缓冲', frameIds: ['D5FB-1'],
  },
  D5FB2: {
    id: 'D5FB2', route: 'D', title: '重新把人员安全放第一', kind: '剧情',
    time: '约 Day 9—14', location: '山路后段→办事地点',
    facts: '队伍根据新的身体状态降低强度，保护人员状态，同时接受原期限已经无法保住。',
    knowledge: '根据新证据再次调整', frameIds: ['D5FB-2'],
  },
}

export const LATEST_NODES_BY_ID = Object.fromEntries(FINAL_NODES.map((node) => [node.id, node])) as Record<string, FinalNode>

export function latestNode(nodeId: string): FinalNode | LatestVirtualNode | undefined {
  return LATEST_NODES_BY_ID[nodeId] ?? VIRTUAL_NODES[nodeId]
}

export function latestFrames(frameIds: string[]) {
  const ids = new Set(frameIds)
  return FINAL_KEYFRAMES.filter((frame) => ids.has(frame.id))
}

const NEXT_NODE: Record<string, string> = {
  A01: 'A02', A03A: 'A04', A03B: 'A04', A03R: 'RESULT', A4FB1: 'RESULT', A4FB2: 'RESULT', A4FB3: 'RESULT',
  B01: 'B02', B03A: 'B04', B03B: 'B04', B4FBDAWN: 'RESULT', B4FBREST: 'RESULT',
  C01: 'C02', C2FB1: 'C03', C2FB2: 'RESULT', C04M: 'C05', C05: 'C06', C6FB2: 'RESULT', C04VB: 'RESULT', C04V: 'RESULT', C04VA: 'RESULT',
  D01: 'D03', D02: 'D03', D04A: 'RESULT', D04B: 'D05', D5FB1: 'RESULT', D5FB2: 'RESULT',
}

export function nextLatestNode(nodeId: string) {
  return NEXT_NODE[nodeId]
}

export function optionTarget(option: FinalOption) {
  if (option.id === 'A4-1') return 'A4FB1'
  if (option.id === 'A4-2') return 'A4FB2'
  if (option.id === 'A4-3') return 'A4FB3'
  if (option.id === 'B4A-1' || option.id === 'B4B-1') return 'B4FBDAWN'
  if (option.id === 'B4A-2' || option.id === 'B4B-2') return 'B4FBREST'
  if (option.id === 'C2-2') return 'C2FB2'
  if (option.id === 'C2-1') return 'C2FB1'
  if (option.id === 'C3-2') return 'C04VA'
  if (option.id === 'C6-2') return 'C6FB2'
  if (option.id === 'C6-3') return 'C04VB'
  if (option.id === 'D5-1') return 'D5FB1'
  if (option.id === 'D5-2') return 'D5FB2'
  if (option.to === 'X01' || option.to === 'X02') return 'RESULT'
  return option.to
}

export function visibleOptions(node: FinalNode, decisions: LatestDecision[]) {
  if (!node.options) return []
  if (node.id !== 'B04') return node.options
  const accelerated = decisions.some((decision) => decision.optionId === 'B2-1')
  return node.options.filter((option) => accelerated ? option.id.startsWith('B4A') : option.id.startsWith('B4B'))
}

function chose(decisions: LatestDecision[], optionId: string) {
  return decisions.some((decision) => decision.optionId === optionId)
}

export function branchForDecisions(decisions: LatestDecision[]): FinalBranch | undefined {
  let branchId: string | undefined
  if (chose(decisions, 'A2-3') || chose(decisions, 'A4-3')) branchId = 'A-05'
  else if (chose(decisions, 'A2-1') && chose(decisions, 'A4-1')) branchId = 'A-01'
  else if (chose(decisions, 'A2-1') && chose(decisions, 'A4-2')) branchId = 'A-02'
  else if (chose(decisions, 'A2-2') && chose(decisions, 'A4-1')) branchId = 'A-03'
  else if (chose(decisions, 'A2-2') && chose(decisions, 'A4-2')) branchId = 'A-04'
  else if (chose(decisions, 'B2-1') && chose(decisions, 'B4A-1')) branchId = 'B-01'
  else if (chose(decisions, 'B2-1') && chose(decisions, 'B4A-2')) branchId = 'B-02'
  else if (chose(decisions, 'B2-2') && chose(decisions, 'B4B-1')) branchId = 'B-03'
  else if (chose(decisions, 'B2-2') && chose(decisions, 'B4B-2')) branchId = 'B-04'
  else if (chose(decisions, 'C2-2')) branchId = 'C-01'
  else if (chose(decisions, 'C6-1')) branchId = 'C-02'
  else if (chose(decisions, 'C6-2')) branchId = 'C-03'
  else if (chose(decisions, 'C3-2')) branchId = 'C-04'
  else if (chose(decisions, 'C3-3')) branchId = 'C-05'
  else if (chose(decisions, 'C6-3')) branchId = 'C-06'
  else if (chose(decisions, 'D3-1')) branchId = 'D-01'
  else if (chose(decisions, 'D5-1')) branchId = 'D-02'
  else if (chose(decisions, 'D5-2')) branchId = 'D-03'
  const branch = FINAL_BRANCHES.find((branch) => branch.id === branchId)
  if (branch?.id === 'A-05') return { ...branch, completion: '安全返回，原窗口已失去',
    tradeoff: chose(decisions, 'A2-3') ? '第三天退出高地；已经花掉的三天和改路时间无法收回' : '深入山路后再退出；比第三天撤回多走的山路还需要折返，退出成本更高' }
  return branch
}

export function confirmationStatus(branch: FinalBranch) {
  if (branch.deadline === '按期') return `已由本人完成最后确认 · ${branch.completion}`
  if (branch.deadline === '主动放弃') return '已主动放弃原窗口 · 未完成最后确认'
  return '原窗口已失去 · 未在期限内完成本人确认'
}

export function arrivalOutcomeForDecisions(decisions: LatestDecision[]): LatestArrivalOutcome | undefined {
  const branch = branchForDecisions(decisions)
  if (!branch) return undefined
  if (branch.deadline === '按期') return {
    image: '/images/decision-stills/arrival-confirmed.webp',
    eyebrow: `期限内抵达 · ${branch.completion}`,
    title: '最后确认已完成',
    detail: '队伍将矿样和文件送达办理点。这次机会被保住了，但人员状态和剩余缓冲由你沿途的选择共同决定。',
    tone: 'confirmed',
  }
  if (branch.deadline === '主动放弃') return {
    image: '/images/decision-stills/arrival-safe.webp',
    eyebrow: branch.completion,
    title: '队伍安全返回',
    detail: '原购买窗口已经过去，但人员、资料和后续行动能力得到了保护。这是明确的退出结果，不是过程中断。',
    tone: 'safe',
  }
  return {
    image: '/images/decision-stills/arrival-closed.webp',
    eyebrow: `抵达时间 · ${branch.completion}`,
    title: '办理窗口已关闭',
    detail: '队伍和资料最终到达，但原购买窗口已经失去。安全抵达和按期完成目标，是两个不同的结果。',
    tone: 'closed',
  }
}

export function resultVideoForDecisions(decisions: LatestDecision[]) {
  const branch = branchForDecisions(decisions)
  if (branch?.frameIds.includes('SH-TOWN-NIGHT')) return LATEST_RESULT_VIDEOS.night
  if (branch?.id === 'A-05' || branch?.frameIds.includes('SH-TOWN-DAY')) return LATEST_RESULT_VIDEOS.day
  return undefined
}
