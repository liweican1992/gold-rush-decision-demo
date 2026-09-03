import { INTRO_SUBTITLES, type SubtitleCue } from './subtitles'

export type RouteId = 'A' | 'B' | 'C' | 'D'
export type ResultId = `${RouteId}${1 | 2 | 3}`
export type SituationId = `${RouteId}0`
export type SecondaryChoiceId = `choice-${RouteId}`
export type EndingId = `ending-${ResultId}`
export type StoryNodeId = 'intro' | 'choice-primary' | SituationId | SecondaryChoiceId | ResultId | EndingId

export type StoryMetrics = {
  days: string
  people: string
  capability: string
  claim: string
}

export type VideoNode = {
  kind: 'video'
  id: 'intro' | SituationId | ResultId
  title: string
  expectedVideo: string
  video?: string
  subtitles: SubtitleCue[]
  synopsis: string
  next: 'choice-primary' | SecondaryChoiceId | EndingId
}

export type ChoiceOption = {
  id: RouteId | ResultId
  label: string
  factHint: string
  target: SituationId | ResultId
}

export type ChoiceNode = {
  kind: 'choice'
  id: 'choice-primary' | SecondaryChoiceId
  eyebrow: string
  prompt: string
  context: string
  options: ChoiceOption[]
}

export type EndingNode = {
  kind: 'ending'
  id: EndingId
  resultId: ResultId
  title: string
  summary: string
  metrics: StoryMetrics
  lesson: string
  reflectionQuestion: string
  parentChoiceId: SecondaryChoiceId
}

export type StoryNode = VideoNode | ChoiceNode | EndingNode

type ResultDefinition = {
  id: ResultId
  label: string
  factHint: string
  videoFile: string
  videoTitle: string
  videoSynopsis: string
  endingTitle: string
  endingSummary: string
  metrics: StoryMetrics
  lesson: string
}

type RouteDefinition = {
  id: RouteId
  label: string
  factHint: string
  situationTitle: string
  situationFile: string
  situationSynopsis: string
  choicePrompt: string
  reflectionQuestion: string
  results: [ResultDefinition, ResultDefinition, ResultDefinition]
}

export const INTRO_VIDEO = '/videos/web/intro.mp4'
export const PRIMARY_CHOICE_ID = 'choice-primary' as const

// These clips already include burned-in subtitles and transition cards.
// Keep every unfinished result undefined so the demo can still show its synopsis placeholder.
const COMPLETED_RESULT_VIDEOS: Partial<Record<ResultId, string>> = {
  A1: '/videos/web/route-a1-press-on.mp4',
  A2: '/videos/web/route-a2-bivouac.mp4',
  A3: '/videos/web/route-a3-switch-valley.mp4',
  B1: '/videos/web/route-b1-ford.mp4',
}

// Timings are measured against the final concatenated web clips, not the generation prompt.
const COMPLETED_RESULT_SUBTITLES: Partial<Record<ResultId, SubtitleCue[]>> = {
  A1: [
    { start: 10.14, end: 17.14, text: '山口过了' },
    { start: 17.14, end: 18.6, text: '设备丢了一箱' },
    { start: 18.6, end: 20.28, text: '你的手撑不住了' },
  ],
  A3: [
    { start: 10.14, end: 17.54, text: '折返三天' },
    { start: 17.54, end: 18.78, text: '再走山谷' },
    { start: 18.78, end: 20.24, text: '赶不上登记了' },
  ],
}

const SITUATION_SUBTITLES: Record<RouteId, SubtitleCue[]> = {
  A: [
    { start: 6.14, end: 7.26, text: '山口就在前面' },
    { start: 7.72, end: 8.48, text: '可这阵风' },
    { start: 8.94, end: 9.96, text: '比预报早了一天' },
  ],
  B: [
    { start: 5.5, end: 7.34, text: '绕过去至少再多四天' },
    { start: 8.08, end: 9.08, text: '照这个速度' },
    { start: 9.2, end: 10.14, text: '十四天不够' },
  ],
  C: [
    { start: 6.6, end: 7.44, text: '答案有了' },
    { start: 8.1, end: 9.76, text: '可窗口也只剩一天半' },
  ],
  D: [
    { start: 0, end: 4, text: '你们做好决定了吗' },
    { start: 4, end: 8.12, text: '我们已经决定保人' },
    { start: 8.12, end: 9.86, text: '但还没决定怎样退出' },
  ],
}

export const INITIAL_HUD: StoryMetrics = {
  days: '剩余 14 天',
  people: '队长左手受伤',
  capability: '设备与补给完整',
  claim: '矿权待登记',
}

export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    id: 'A',
    label: '立即翻山',
    factHint: '预计 7–10 天；速度最快，伤势与暴风风险最高',
    situationTitle: '山脊第三天：风暴提前',
    situationFile: 'route-a-situation.mp4',
    situationSynopsis: '横向暴雪提前抵达，固定绳被风拉紧，队长左手开始失力，但山口仍隐约可见。',
    choicePrompt: '山口就在前面，但左手正在失力。队伍下一步怎么办？',
    reflectionQuestion: '在什么条件下，坚持不再是勇敢，而是承诺升级？',
    results: [
      {
        id: 'A1', label: '继续冲过山口', factHint: '保住登记窗口；伤势和设备损失可能不可逆',
        videoFile: 'route-a1-press-on.mp4', videoTitle: '顶着暴雪冲过山口',
        videoSynopsis: '队伍及时越过山脊，队长左手伤势加重，部分设备在风雪中遗失。',
        endingTitle: '赶上窗口，也付出了不可逆代价', endingSummary: '速度换来了矿权机会，却把人员伤势和设备损失推到了高位。',
        metrics: { days: '剩余 5 天', people: '左手伤势严重', capability: '部分设备遗失', claim: '仍可登记' },
        lesson: '高承诺可能带来高收益，也会压缩后续调整空间。',
      },
      {
        id: 'A2', label: '原地扎营等待一天', factHint: '保住人员和设备；时间优势明显缩小',
        videoFile: 'route-a2-bivouac.mp4', videoTitle: '在背风处等待一天',
        videoSynopsis: '队伍扎营保存体力，风势减弱后通过，但登记窗口只剩很窄的余量。',
        endingTitle: '缓冲降低了风险，也消耗了速度优势', endingSummary: '团队和设备得以保全，但之后每一步都不能再延误。',
        metrics: { days: '剩余 4 天', people: '状态可控', capability: '设备完整', claim: '窗口狭窄' },
        lesson: '战略缓冲不是免费安全，它以时间和机会成本为代价。',
      },
      {
        id: 'A3', label: '撤回并转走山谷', factHint: '降低即时风险；前三天投入无法收回',
        videoFile: 'route-a3-switch-valley.mp4', videoTitle: '撤回后转向山谷',
        videoSynopsis: '队伍安全撤离山脊，但切换路线叠加返程时间，最终错过登记期限。',
        endingTitle: '及时止损保住了人，却没保住期限', endingSummary: '撤回避免了严重事故，但前期投入无法收回，矿权窗口关闭。',
        metrics: { days: '已超期', people: '全员安全', capability: '设备基本完整', claim: '矿权失去' },
        lesson: '转换成本和沉没成本会共同限制战略调整。',
      },
    ],
  },
  {
    id: 'B',
    label: '改走山谷',
    factHint: '预计 2–3 周；人员风险较低，但可能错过期限',
    situationTitle: '山谷第六天：木桥被冲断',
    situationFile: 'route-b-situation.mp4',
    situationSynopsis: '融雪让河道突然上涨，原有木桥被冲断；队伍安全，但设备拖慢了速度。',
    choicePrompt: '绕行至少再多四天，十四天已经不够。队伍如何通过河道？',
    reflectionQuestion: '一条更安全的路径，如果不能实现目标，是否仍然是好战略？',
    results: [
      {
        id: 'B1', label: '立即涉水强渡', factHint: '争取按时抵达；样本和补给存在进水风险',
        videoFile: 'route-b1-ford.mp4', videoTitle: '强渡上涨河道',
        videoSynopsis: '队伍勉强按时抵达，但部分样本和补给进水，登记证据不完整。',
        endingTitle: '局部冒险保住时间，却破坏了系统完整性', endingSummary: '路线时间被抢回来，但核心样本受损，矿权审核留下重大不确定性。',
        metrics: { days: '剩余 1 天', people: '轻度失温', capability: '样本与补给受损', claim: '审核不确定' },
        lesson: '局部最优动作可能给整个战略系统带来连锁后果。',
      },
      {
        id: 'B2', label: '绕行四天', factHint: '人员和设备最安全；矿权很可能进入公开程序',
        videoFile: 'route-b2-detour.mp4', videoTitle: '绕行河谷四天',
        videoSynopsis: '全员和设备安全抵达，但矿权已经进入公开程序。',
        endingTitle: '执行很安全，战略目标却已失配', endingSummary: '团队把沿途风险降到最低，却没有在期限内实现矿权登记。',
        metrics: { days: '已超期', people: '全员安全', capability: '设备完整', claim: '进入公开程序' },
        lesson: '执行效率不能替代对战略目标的持续校准。',
      },
      {
        id: 'B3', label: '丢弃重型设备轻装过桥', factHint: '检修索桥只容人员轻装通过；重型设备无法通过',
        videoFile: 'route-b3-drop-equipment.mp4', videoTitle: '留下设备轻装前进',
        videoSynopsis: '队伍留下无法通过检修索桥的重型设备，轻装过河并在截止前完成登记。',
        endingTitle: '赢得矿权，却削弱了兑现价值的能力', endingSummary: '短期目标达成，但未来开采要重新投入资本和时间。',
        metrics: { days: '最后 1 天', people: '全员安全', capability: '重型设备丢失', claim: '完成登记' },
        lesson: '资源取舍必须同时衡量短期目标与长期能力。',
      },
    ],
  },
  {
    id: 'C',
    label: '等待 48 小时预报',
    factHint: '先消耗两天，以时间购买天气信息和选择权',
    situationTitle: '两天后：窗口只剩三十六小时',
    situationFile: 'route-c-situation.mp4',
    situationSynopsis: '预报确认山脊即将封闭，左手略有恢复；无线电还联系到附近的当地运输队，但只剩十二天和一天半天气窗口。',
    choicePrompt: '山口只剩一天半窗口，无线电还能联系附近的当地运输队。队伍如何利用这些信息？',
    reflectionQuestion: '信息的价值，应当用准确度衡量，还是用它能否改变行动衡量？',
    results: [
      {
        id: 'C1', label: '抢在封山前轻装翻山', factHint: '利用窗口及时登记；只能携带少量样本',
        videoFile: 'route-c1-light-mountain.mp4', videoTitle: '利用窗口轻装翻山',
        videoSynopsis: '队伍赶上山口窗口并及时登记，但后续价值评估所需样本不足。',
        endingTitle: '信息改变了行动，但没有消除剩余风险', endingSummary: '团队利用预报完成了关键行动，同时牺牲了样本完整性。',
        metrics: { days: '剩余 2 天', people: '疲劳可控', capability: '样本有限', claim: '完成登记' },
        lesson: '信息只有转化为及时行动，才产生战略价值。',
      },
      {
        id: 'C2', label: '根据预报改走山谷', factHint: '避开暴风保存团队；等待叠加长路线导致超期',
        videoFile: 'route-c2-valley.mp4', videoTitle: '根据预报转走山谷',
        videoSynopsis: '队伍避开暴风并保存团队，但两天等待叠加长路线，最终错过期限。',
        endingTitle: '信息是正确的，战略却仍不可行', endingSummary: '决策降低了安全风险，却没有改变路线与期限之间的根本矛盾。',
        metrics: { days: '已超期', people: '全员安全', capability: '设备完整', claim: '矿权失去' },
        lesson: '准确预测不等于具备实现目标的可行路径。',
      },
      {
        id: 'C3', label: '引入当地运输伙伴', factHint: '获得雪地运输能力；需要让渡部分权益',
        videoFile: 'route-c3-partner.mp4', videoTitle: '与当地运输伙伴合作',
        videoSynopsis: '队伍让渡部分权益换取雪地运输能力，按时抵达并保住部分矿权。',
        endingTitle: '外部能力解决了瓶颈，也稀释了控制权', endingSummary: '合作补上了团队缺失能力，但未来收益和决策权需要共享。',
        metrics: { days: '剩余 3 天', people: '全员安全', capability: '获得运输能力', claim: '保住部分权益' },
        lesson: '能力可以通过合作获取，但控制权和收益也会重新分配。',
      },
    ],
  },
  {
    id: 'D',
    label: '等待 3–4 周安全撤离',
    factHint: '人员安全优先；主动放弃当前登记时间窗口',
    situationTitle: '撤离第六天：竞争者提出报价',
    situationFile: 'route-d-situation.mp4',
    situationSynopsis: '撤离准备进入第六天，风雪短暂减弱，同时收到竞争者购买勘探资料的报价。',
    choicePrompt: '撤离第六天，竞争者提出收购勘探资料，天气也短暂转好。继续退出，还是重新争取机会？',
    reflectionQuestion: '主动退出是失败，还是另一种资源配置决策？',
    results: [
      {
        id: 'D1', label: '坚持等待并安全撤离', factHint: '执行既定安全目标；放弃矿权和本次机会',
        videoFile: 'route-d1-withdraw.mp4', videoTitle: '等待天气改善后撤离',
        videoSynopsis: '三周后全员安全离开，矿权被其他竞争者取得。',
        endingTitle: '团队安全撤离，也彻底放弃了矿权', endingSummary: '决策与安全优先目标保持一致，但前期投入无法转化为矿权收益。',
        metrics: { days: '三周后', people: '全员安全', capability: '团队与设备保全', claim: '矿权失去' },
        lesson: '退出战略的价值取决于目标排序，而不是表面上的输赢。',
      },
      {
        id: 'D2', label: '出售勘探资料并退出', factHint: '收回大部分投入；主动放弃购买权和未来上涨收益',
        videoFile: 'route-d2-sell-information.mp4', videoTitle: '出售勘探资料并退出',
        videoSynopsis: '队伍通过无线电达成原则交易，撤离后在基地交付勘探数据和样本，并让购买期权到期。',
        endingTitle: '退出被转化为现金，也转移了未来收益', endingSummary: '团队降低了风险并回收资本，同时永久失去矿区控制权。',
        metrics: { days: '安全撤离', people: '全员安全', capability: '资本大部回收', claim: '主动放弃购买权' },
        lesson: '退出也可以创造价值，但机会成本会随未来上涨而扩大。',
      },
      {
        id: 'D3', label: '取消撤离，轻装抢登记', factHint: '剩余八天重新争取机会；设备留守且补给余量很小',
        videoFile: 'route-d3-return.mp4', videoTitle: '取消撤离后轻装抢登记',
        videoSynopsis: '队伍在撤离第六天反转战略，留下重装赶往登记地，在最后时限完成登记。',
        endingTitle: '战略反转追回机会，也耗尽了调整余量', endingSummary: '团队在最后时限完成登记，但设备留守、补给接近耗尽，所有缓冲都已消失。',
        metrics: { days: '最后时限', people: '疲劳明显', capability: '设备留守、补给将尽', claim: '完成登记' },
        lesson: '战略反转不是免费重来，转换成本会侵蚀新方案的价值。',
      },
    ],
  },
]

function createStoryNodes(): Record<StoryNodeId, StoryNode> {
  const nodes = {} as Record<StoryNodeId, StoryNode>
  nodes.intro = {
    kind: 'video', id: 'intro', title: '公共开场：最后十四天', expectedVideo: INTRO_VIDEO,
    video: INTRO_VIDEO, subtitles: INTRO_SUBTITLES,
    synopsis: '团队发现高品位金矿，并在十四天期限、天气不确定性和队长伤势之间面临路线抉择。',
    next: PRIMARY_CHOICE_ID,
  }
  nodes[PRIMARY_CHOICE_ID] = {
    kind: 'choice', id: PRIMARY_CHOICE_ID, eyebrow: '第一个战略抉择', prompt: '十四天，你选择哪条路？',
    context: '没有标准答案。请根据时间、天气、地形和团队能力作出判断。',
    options: ROUTE_DEFINITIONS.map((route) => ({ id: route.id, label: route.label, factHint: route.factHint, target: `${route.id}0` as SituationId })),
  }

  for (const route of ROUTE_DEFINITIONS) {
    const situationId = `${route.id}0` as SituationId
    const choiceId = `choice-${route.id}` as SecondaryChoiceId
    nodes[situationId] = {
      kind: 'video', id: situationId, title: route.situationTitle,
      expectedVideo: `/videos/web/${route.situationFile}`,
      video: `/videos/web/${route.situationFile}`,
      subtitles: SITUATION_SUBTITLES[route.id], synopsis: route.situationSynopsis, next: choiceId,
    }
    nodes[choiceId] = {
      kind: 'choice', id: choiceId, eyebrow: `${route.id}路线 · 局面变化`, prompt: route.choicePrompt,
      context: '前一个选择已经改变当前资源、时间与可用行动。',
      options: route.results.map((result) => ({ id: result.id, label: result.label, factHint: result.factHint, target: result.id })),
    }
    for (const result of route.results) {
      const endingId = `ending-${result.id}` as EndingId
      const completedVideo = COMPLETED_RESULT_VIDEOS[result.id]
      nodes[result.id] = {
        kind: 'video', id: result.id, title: result.videoTitle,
        expectedVideo: `/videos/web/${result.videoFile}`, video: completedVideo,
        subtitles: COMPLETED_RESULT_SUBTITLES[result.id] ?? [], synopsis: result.videoSynopsis, next: endingId,
      }
      nodes[endingId] = {
        kind: 'ending', id: endingId, resultId: result.id, title: result.endingTitle,
        summary: result.endingSummary, metrics: result.metrics, lesson: result.lesson,
        reflectionQuestion: route.reflectionQuestion, parentChoiceId: choiceId,
      }
    }
  }
  return nodes
}

export const STORY_NODES = createStoryNodes()
export const VIDEO_NODE_IDS = Object.values(STORY_NODES)
  .filter((node): node is VideoNode => node.kind === 'video')
  .map((node) => node.id)

export function getChoiceBackdropVideo(choiceId: ChoiceNode['id']) {
  if (choiceId === PRIMARY_CHOICE_ID) return INTRO_VIDEO
  const routeId = choiceId.replace('choice-', '') as RouteId
  const route = ROUTE_DEFINITIONS.find((item) => item.id === routeId)
  if (!route) throw new Error(`missing route backdrop for ${choiceId}`)
  return `/videos/web/${route.situationFile}`
}

export function getNode(id: StoryNodeId): StoryNode {
  return STORY_NODES[id]
}

export function validateStoryGraph() {
  const errors: string[] = []
  const visited = new Set<StoryNodeId>()
  const stack: StoryNodeId[] = ['intro']

  while (stack.length > 0) {
    const id = stack.pop()!
    if (visited.has(id)) continue
    const node = STORY_NODES[id]
    if (!node) {
      errors.push(`missing node: ${id}`)
      continue
    }
    visited.add(id)
    if (node.kind === 'video') stack.push(node.next)
    if (node.kind === 'choice') {
      for (const option of node.options) {
        if (!STORY_NODES[option.target]) errors.push(`dead link: ${node.id} -> ${option.target}`)
        else stack.push(option.target)
      }
    }
  }

  const endingIds = Object.values(STORY_NODES)
    .filter((node): node is EndingNode => node.kind === 'ending')
    .map((node) => node.id)
  const reachableEndingIds = endingIds.filter((id) => visited.has(id))
  for (const id of endingIds) if (!visited.has(id)) errors.push(`unreachable ending: ${id}`)

  return { errors, reachableEndingIds }
}
