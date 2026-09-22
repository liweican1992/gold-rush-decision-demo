export type FinalRoute = 'PUBLIC' | 'A' | 'B' | 'C' | 'D' | 'SHARED'

export type FinalKeyframe = {
  id: string
  route: FinalRoute
  title: string
  src: string
  shared?: boolean
}

export type FinalOption = {
  id: string
  label: string
  cost: string
  result: string
  to: string
}

export type FinalNode = {
  id: string
  route: FinalRoute
  title: string
  kind: '剧情' | '决策' | '过渡' | '结算' | '报告'
  time: string
  location: string
  facts: string
  question?: string
  knowledge: string
  frameIds: string[]
  options?: FinalOption[]
}

export type FinalBranch = {
  id: string
  route: Exclude<FinalRoute, 'PUBLIC' | 'SHARED'>
  name: string
  sequence: string
  completion: string
  deadline: '按期' | '超期' | '主动放弃'
  people: string
  tradeoff: string
  review: string
  frameIds: string[]
  frameVariants?: FinalBranchFrameVariant[]
}

export type FinalBranchFrameVariant = {
  label: string
  frameIds: string[]
}

const base = '/images/final-story-keyframes'
const frame = (id: string, route: FinalRoute, file: string, title: string, shared = false): FinalKeyframe => ({
  id,
  route,
  title,
  src: `${base}/${file}`,
  shared,
})

export const FINAL_KEYFRAMES: FinalKeyframe[] = [
  frame('PUB01A', 'PUBLIC', '公共/PUB01A_沈岚携含矿岩石进入帐篷_target_v03.png', '沈岚携含矿岩石进入帐篷'),
  frame('PUB01B', 'PUBLIC', '公共/PUB01B_含矿岩石落桌与伤手建立_target_v03.png', '含矿岩石落桌，建立伤手事实'),
  frame('PUB02A', 'PUBLIC', '公共/PUB02A_沈岚抬眼_期权文件_target_v02.png', '期权文件与十四天'),
  frame('PUB02B', 'PUBLIC', '公共/PUB02B_轻点文件强调本人到场_target_v02.png', '持有人本人必须到场'),
  frame('PUB02C', 'PUBLIC', '公共/PUB02C_望向门口_target_v02.png', '期限与返程目标'),
  frame('PUB03A', 'PUBLIC', '公共/PUB03A_老周说明两条路线_target_v02.png', '老周说明翻山与谷地'),
  frame('PUB04A', 'PUBLIC', '公共/PUB04A_老周观察未定天气_target_v03.png', '当前天气尚未确定'),
  frame('PUB04B', 'PUBLIC', '公共/PUB04B_沈岚补充第二层天气判断_target_v03.png', '两级天气信息'),

  frame('A01', 'A', 'A路线/A01_山路初段还有余量_target_v02.png', '山路初段获得时间优势'),
  frame('A02A', 'A', 'A路线/A02A_Day3高地风雪增强_target_v02.png', 'Day 3 高地风雪增强'),
  frame('A02B', 'A', 'A路线/A02B_左手失力后队友扶稳_target_v02.png', '左手失力后队友扶稳'),
  frame('A02C', 'A', 'A路线/A02C_前路背风处与退路_target_v02.png', '前路、背风处与退路'),
  frame('A03A1', 'A', 'A路线/A03A1_强推后的伤手复查_target_v02.png', '强推后的伤手复查'),
  frame('A03A2', 'A', 'A路线/A03A2_重新分工继续前行_target_v02.png', '重新分工继续前行'),
  frame('A03B', 'A', 'A路线/A03B_暂避后重新出发_target_v02.png', '暂避两天后重新出发'),
  frame('A03R-D3', 'A', 'A路线/A03R-D3_Day3撤回改走低处_target_v02.png', 'Day 3 撤回改走低处'),
  frame('A03R-D5', 'A', 'A路线/A03R-D5_Day5至6晚阶段下撤_target_v02.png', 'Day 5—6 晚阶段下撤'),
  frame('A04C', 'A', 'A路线/A04C_最后可以明显折返的位置_target_v02.png', '最后可以明显折返的位置'),
  frame('A2FB-S1', 'A', 'A路线/A2FB-S1_岩壁后暂避暴风_target_v02.png', '岩壁后暂避暴风'),
  frame('A4FB-2', 'A', 'A路线/A4FB-2_留在山路主动降低节奏_target_v02.png', '留在山路主动降低节奏'),

  frame('B01-VALLEY', 'B', 'B路线/B01_稳定谷地_target_v02.png', '稳定谷地推进'),
  frame('B01-CAMP', 'B', 'B路线/B01_正常扎营_target_v02.png', '谷地正常扎营'),
  frame('B02-CHECK', 'B', 'B路线/B02_进度盘点_target_v02.png', 'Day 6 进度盘点'),
  frame('B03A-FATIGUE', 'B', 'B路线/B03A_疲劳检查_target_v01.png', '早提速后的疲劳检查'),
  frame('B04A-DECISION', 'B', 'B路线/B04A_疲劳决策_target_v01.png', '早提速路径的第二次决策'),
  frame('B04B-DECISION', 'B', 'B路线/B04B_稳态决策_target_v01.png', '稳走路径的第二次决策'),
  frame('B4FB-REST', 'B', 'B路线/B4FB_恢复休整_target_v01.png', '把节奏降回可持续状态'),
  frame('B4FB-DAWN', 'B', 'B路线/B4FB_天亮前出发_target_v01.png', '天亮前出发做最后冲刺'),

  frame('C01A', 'C', 'C路线/C01A_等待观察_target_v01.png', '两天等待与观察'),
  frame('C01B', 'C', 'C路线/C01B_左手休息与新信息_target_v01.png', '左手休息与新信息'),
  frame('C02', 'C', 'C路线/C02_第一轮信息选择_target_v01.png', '第一轮信息选择'),
  frame('C03', 'C', 'C路线/C03_第二轮信息选择_target_v01.png', '第二轮信息选择'),
  frame('C2FB-2', 'C', 'C路线/C2FB-2_收装转谷地_target_v01.png', '收装转谷地'),
  frame('C04M', 'C', 'C路线/C04M_低处山路出发_target_v01.png', 'Day 3 先从低处山路出发'),
  frame('C05', 'C', 'C路线/C05_改善窗口山路推进_target_v01.png', 'Day 5—6 改善窗口中的山路推进'),
  frame('C04V-A', 'C', 'C路线/C04V-A_等待后转谷地_target_v01.png', '等待后转入谷地'),
  frame('C06', 'C', 'C路线/C06_现场更新选择_target_v01.png', '现场证据更新后再选择'),
  frame('C6FB-2', 'C', 'C路线/C6FB-2_增加观察缓冲_target_v01.png', '增加观察与缓冲'),
  frame('C04V-B', 'C', 'C路线/C04V-B_停止高地下撤_target_v01.png', '现场更新后停止高地推进'),

  frame('D01A', 'D', 'D路线/D01A_暴风留营_target_v01.png', '暴风发生时队伍留营'),
  frame('D01B', 'D', 'D路线/D01B_左手恢复_target_v01.png', '安全等待中左手恢复'),
  frame('D02-D03', 'D', 'D路线/D02_短暂窗口新判断_target_v01.png', '天气出现短暂改善窗口'),
  frame('D3FB-1', 'D', 'D路线/D3FB-1_收图继续等待_target_v01.png', '收起地图继续安全等待'),
  frame('D3FB-2', 'D', 'D路线/D3FB-2_摊图整装反转_target_v01.png', '摊图整装，战略反转'),
  frame('D04A2', 'D', 'D路线/D04A2_窗口已过安全兑现_target_v02.png', '窗口已过，安全收益兑现'),
  frame('D04B', 'D', 'D路线/D04B_晚状态山路_target_v01.png', '等待5天后进入晚状态山路'),
  frame('D05', 'D', 'D路线/D05_普通延误再判断_target_v01.png', '反转后的普通延误与再判断'),
  frame('D5FB-1', 'D', 'D路线/D5FB-1_较快节奏继续_target_v01.png', '保持较快节奏继续'),
  frame('D5FB-2', 'D', 'D路线/D5FB-2_降速保护状态_target_v01.png', '降速保护人员状态'),

  frame('SH-MTN-01', 'SHARED', '共享/SH-MTN-01_峰值后低处山路环境_target_v01.png', '峰值后低处山路环境', true),
  frame('SH-SAFE-01', 'SHARED', '共享/SH-SAFE-01_天气稳定后安全返程_target_v01.png', '天气稳定后安全返程', true),
  frame('SH-SAFE-02', 'SHARED', '共享/SH-SAFE-02_完整队伍安全返程尾声_target_v01.png', '完整队伍安全返程尾声', true),
  frame('SH-TOWN-NIGHT', 'SHARED', '共享/SH-TOWN-NIGHT_夜间抵达同一地点_target_v03.png', '夜间抵达办事地点', true),
  frame('SH-VAL-WEB', 'SHARED', '共享/SH-VAL-01_晚状态谷地环境_webgpt_target_v01.png', '晚状态谷地环境', true),
  frame('SH-TOWN-DAY', 'SHARED', '共享/SH-TOWN-DAY_日间抵达办事地点_webgpt_target_v01.png', '日间抵达办事地点', true),
]

const opt = (id: string, label: string, cost: string, result: string, to: string): FinalOption => ({ id, label, cost, result, to })
const node = (value: FinalNode) => value

export const FINAL_NODES: FinalNode[] = [
  node({ id: 'P01', route: 'PUBLIC', title: '找到了', kind: '剧情', time: 'Day 0 · 09:00', location: '勘探营地帐篷', facts: '发现看来质量很高的含矿岩石；玩家左手受伤、偶尔无力。', knowledge: '初始机会、能力边界', frameIds: ['PUB01A', 'PUB01B'] }),
  node({ id: 'P02', route: 'PUBLIC', title: '十四天', kind: '剧情', time: 'Day 0 · 09:00', location: '勘探营地帐篷', facts: '土地尚未买下；购买期权只剩14天；持有人本人必须在截止前到指定办事地点完成最后确认；超期后地主可能重新处置。', knowledge: '目标、期限、机会成本', frameIds: ['PUB02A', 'PUB02B', 'PUB02C'] }),
  node({ id: 'P03', route: 'PUBLIC', title: '两条路', kind: '剧情', time: 'Day 0 · 09:00', location: '勘探营地帐篷', facts: '翻山通常7—10天，快但危险；谷地通常2—3周，风险较低但慢且疲惫。', knowledge: '初始方案比较', frameIds: ['PUB03A'] }),
  node({ id: 'P04', route: 'PUBLIC', title: '还不知道的天气', kind: '剧情', time: 'Day 0 · 09:00', location: '勘探营地帐篷', facts: '当前天气尚可；48小时内可确认暴风；若有暴风，再等约1天可进一步判断山路。', knowledge: '信息价值、等待成本', frameIds: ['PUB04A', 'PUB04B'] }),
  node({ id: 'P05', route: 'PUBLIC', title: '左手', kind: '剧情', time: 'Day 0 · 09:00', location: '勘探营地帐篷', facts: '左手不是持续失能，但真失力时无法控制。', knowledge: '自身能力、生命价值', frameIds: ['PUB01B'] }),
  node({ id: 'P06', route: 'PUBLIC', title: '第一次决定', kind: '决策', time: 'Day 0 · 09:00', location: '勘探营地帐篷', facts: '机会、期限、路线、天气、伤手均已知。', question: '你最想保住什么？', knowledge: '最初想保什么；初始假设', frameIds: ['PUB03A', 'PUB04B'], options: [
    opt('P06-A', '立即翻山', '高地风险、伤手暴露', 'Day 0出发', 'A01'),
    opt('P06-B', '走山谷', '期限风险从一开始就存在', 'Day 0出发', 'B01'),
    opt('P06-C', '先等天气信息', '直接消耗2天行动空间', 'Day 2进入信息节点', 'C01'),
    opt('P06-D', '等天气好转后安全返回', '主动降低原期限目标优先级', '进入长期等待', 'D01'),
  ] }),

  node({ id: 'A01', route: 'A', title: '这次下注真的有回报', kind: '剧情', time: 'Day 2 · 上午', location: '山路前段', facts: '前两天推进顺利，明显获得时间优势。', knowledge: '风险换时间', frameIds: ['A01'] }),
  node({ id: 'A02', route: 'A', title: '风险变了', kind: '决策', time: 'Day 3 · 12:00左右', location: '高地雪坡／背风岩壁附近', facts: '高地暴风增强；山口仍可见；左手刚失力；附近有可避风位置。', question: '原来的风险已经变了，现在怎么做？', knowledge: '原风险假设是否仍成立', frameIds: ['A02A', 'A02B', 'A02C'], options: [
    opt('A2-1', '趁还能走，继续推进', '左手可能进一步限制行动', '承诺升级', 'A03A'),
    opt('A2-2', '进背风处，等最差天气过去', '花掉约两天时间缓冲', '人员状态更稳', 'A03B'),
    opt('A2-3', '现在撤回，改走山谷', '已花三天无法收回', '原窗口基本失去', 'A03R'),
  ] }),
  node({ id: 'A03A', route: 'A', title: '继续后的账单', kind: '剧情', time: 'Day 4 · 18:00左右', location: '山路中后段', facts: '时间优势仍在；左手已不能再按“偶尔失力”处理，队伍必须重新分工。', knowledge: '承诺升级、执行能力', frameIds: ['A03A1', 'A03A2'] }),
  node({ id: 'A03B', route: 'A', title: '暂避后的账单', kind: '剧情', time: 'Day 5 · 12:00左右', location: '背风处→山路中后段', facts: '最差天气已过；人员状态更稳；约两天时间缓冲已经花掉。', knowledge: '缓冲价值、风险调整', frameIds: ['A2FB-S1', 'A03B'] }),
  node({ id: 'A03R', route: 'A', title: '撤回转谷地', kind: '过渡', time: 'Day 3或Day 5—6后', location: '山路撤回→谷地', facts: '已投入时间无法收回；转谷地不是重置为B线开头；原14天窗口基本不可恢复。', knowledge: '止损、不可逆性、已投入成本', frameIds: ['A03R-D3', 'A03R-D5', 'SH-VAL-WEB'] }),
  node({ id: 'A04', route: 'A', title: '最后的回头点', kind: '决策', time: '约Day 5—6', location: '山路后段', facts: '强推者伤手更差但时间更宽；暂避者身体更稳但时间更紧；撤回代价已显著上升。', question: '继续当前山路，还是调整／撤回？', knowledge: '已投入很多是否构成继续理由', frameIds: ['A04C', 'A4FB-2'], options: [
    opt('A4-1', '按现在的节奏继续', '继续承担当前身体／缓冲状态', 'Day 9 18:00或Day 11 12:00', 'X01'),
    opt('A4-2', '继续走山路，但把节奏降下来', '预计多花约1天', 'Day 10 18:00或Day 12 12:00', 'X01'),
    opt('A4-3', '趁现在还能退，撤回改走山谷', '前面投入拿不回来', '原窗口基本无法保住', 'A03R'),
  ] }),

  node({ id: 'B01', route: 'B', title: '这条路确实更稳', kind: '剧情', time: 'Day 0—5', location: '谷地前段', facts: '谷地推进稳定；高地暴风影响较小；伤手不需高强度攀爬。', knowledge: '可控性、行动风险', frameIds: ['B01-VALLEY', 'B01-CAMP'] }),
  node({ id: 'B02', route: 'B', title: '没有事故，但时间不对了', kind: '决策', time: 'Day 6 · 09:00左右', location: '谷地休整点', facts: '前六天没出问题，速度也没比正常节奏慢；按当前节奏大概还需10天，窗口只剩8天。', question: '现在开始提速，还是继续按可持续节奏走？', knowledge: '路径与目标是否仍匹配', frameIds: ['B02-CHECK'], options: [
    opt('B2-1', '从今天开始，每天多走一段', '疲劳与恢复余量下降', 'Day 9追回约1天', 'B03A'),
    opt('B2-2', '维持现在的可持续节奏', '期限风险继续扩大', 'Day 9原窗口基本保不住', 'B03B'),
  ] }),
  node({ id: 'B03A', route: 'B', title: '早提速：时间追回来了，人开始欠账', kind: '剧情', time: 'Day 9', location: '谷地后段休整点', facts: '连续三天缩短休整、傍晚多走；追回约一天；疲劳和伤手负担可见。', knowledge: '早调整的代价', frameIds: ['B03A-FATIGUE'] }),
  node({ id: 'B03B', route: 'B', title: '一直稳走：人没垮，时间先没了', kind: '剧情', time: 'Day 9', location: '谷地后段休整点', facts: '人员状态较好；若继续当前节奏，原窗口基本保不住。', knowledge: '选择空间随时间收缩', frameIds: ['B04B-DECISION'] }),
  node({ id: 'B04', route: 'B', title: '第二次判断：现在还要不要改变节奏', kind: '决策', time: 'Day 9', location: '谷地后段休整点', facts: '前情决定可见状态；同一个“提速”在Day 6与Day 9成本不同。', question: '根据Day 6的选择：继续／恢复，或最后冲刺／继续稳走？', knowledge: '越晚调整为什么越贵', frameIds: ['B04A-DECISION', 'B04B-DECISION', 'B4FB-REST', 'B4FB-DAWN'], options: [
    opt('B4A-1', '保持这几天的强度，继续赶', '几乎不留恢复余量', 'Day 13 19:00', 'X01'),
    opt('B4A-2', '把节奏降回可持续状态', '恢复节奏会减少最后赶路时间', 'Day 14 21:00', 'X01'),
    opt('B4B-1', '现在开始最后冲刺', '几乎没有恢复余量', 'Day 14 01:00', 'X01'),
    opt('B4B-2', '继续按现在的节奏走完', '不再用体力换取时间', 'Day 16 09:00', 'X01'),
  ] }),

  node({ id: 'C01', route: 'C', title: '等待不是空白', kind: '剧情', time: 'Day 0—2', location: '营地', facts: '两天过去；天气逐渐变化；队伍观察；左手休息但未痊愈；剩12天。', knowledge: '等待成本', frameIds: ['C01A', 'C01B'] }),
  node({ id: 'C02', route: 'C', title: '第一份信息只解决了一半', kind: '决策', time: 'Day 2 · 09:00', location: '营地', facts: '已确认高地会受暴风影响；山口是否可通仍不确定；再等约1天可获得更可靠判断。', question: '第三天的信息值不值得再买？', knowledge: '信息价值、停止等待', frameIds: ['C02', 'C2FB-2'], options: [
    opt('C2-1', '再等一天，拿到更完整的山路判断', '再花1天；只剩约11天', 'Day 3进入第二次信息决策', 'C03'),
    opt('C2-2', '现在转山谷，不再继续等', '从Day 2才开始慢路线', '约Day 18返回，原窗口基本失去', 'C04V'),
  ] }),
  node({ id: 'C03', route: 'C', title: '买到的是依据，不是答案', kind: '决策', time: 'Day 3 · 09:00', location: '营地', facts: '山口未确认完全封死；最差天气后有改善趋势；仍无人保证一路顺利；只剩约11天。', question: '信息已经到这里，现在怎么行动？', knowledge: '更多信息 vs 足够行动的信息', frameIds: ['C03'], options: [
    opt('C3-1', '按这份判断走山路', '仍有剩余不确定性', 'Day 3进入低处山路', 'C04M'),
    opt('C3-2', '改走山谷', 'Day 3才进入谷地', '约Day 19返回，明确超期', 'C04V'),
    opt('C3-3', '不再争这十四天，转向安全安排', '主动放弃原窗口', '进入安全返程结算', 'X02'),
  ] }),
  node({ id: 'C04M', route: 'C', title: '进入共享山路：带着信息行动', kind: '过渡', time: 'Day 3起', location: '低处山路／山脊远景', facts: '已用3天换来判断；Day 3—4先留在低处，不直接进入高地最差天气；山口是否顺利仍有不确定性。', knowledge: '信息转化为行动', frameIds: ['C04M', 'SH-MTN-01'] }),
  node({ id: 'C04V', route: 'C', title: '进入较晚状态谷地', kind: '过渡', time: 'Day 2／Day 3／Day 7以后', location: '谷地行进空间', facts: '这是带着等待或现场更新历史的谷地，不是B线Day 0开局；期限已显著恶化。', knowledge: '信息改变行动；未来选择空间缩小', frameIds: ['C04V-A', 'C04V-B', 'SH-VAL-WEB'] }),
  node({ id: 'C05', route: 'C', title: '信息第一次证明自己有用', kind: '剧情', time: 'Day 3—7', location: '共享山路前中段', facts: 'Day 3—4在低处推进，Day 5—6随天气改善进入更高路线；行动总体符合Day 3判断，但仍不等于一路安全。', knowledge: '信息不是白买', frameIds: ['C05', 'SH-MTN-01'] }),
  node({ id: 'C06', route: 'C', title: '现实继续更新', kind: '决策', time: '约Day 7', location: '山路现场', facts: '大趋势基本正确，但局部风势比预想慢；山口仍可考虑但更紧。', question: '旧判断还应该占多大权重？', knowledge: '旧信息权重、更新判断', frameIds: ['C06', 'C6FB-2', 'C04V-B'], options: [
    opt('C6-1', '继续按原计划推进', '继续承担现场剩余风险', 'Day 11 21:00', 'X01'),
    opt('C6-2', '把节奏放慢，增加观察和缓冲', '吃掉大部分剩余时间', 'Day 13 09:00', 'X01'),
    opt('C6-3', '停止继续走高地，改走更低风险路线', '下撤并改路会额外耗时', '原窗口已失去', 'C04V'),
  ] }),

  node({ id: 'D01', route: 'D', title: '安全选择真的买到了东西', kind: '剧情', time: 'Day 0—5', location: '营地', facts: '玩家未进入山地；暴风真实发生；左手、体力和人员状态得到恢复。', knowledge: '安全与价值排序', frameIds: ['D01A', 'D01B'] }),
  node({ id: 'D02', route: 'D', title: '世界后来变了', kind: '剧情', time: 'Day 5 · 下午', location: '营地', facts: '风比前几天小多了，出现短暂改善窗口；这不代表比Day 0更安全，也不是绝对安全；只剩约8天半。', knowledge: '环境变化、假设更新', frameIds: ['D02-D03'] }),
  node({ id: 'D03', route: 'D', title: '还坚持原计划吗', kind: '决策', time: 'Day 5 · 下午', location: '营地', facts: '前期安全收益已兑现；天气依据变化；时间已经花掉。', question: '继续安全等待，还是利用新窗口重新走山路？', knowledge: '战略一致性、反转证据', frameIds: ['D02-D03', 'D3FB-1', 'D3FB-2'], options: [
    opt('D3-1', '继续按安全等待的安排走', '剩余行动时间会继续流失', '约Day 40安全返回', 'D04A'),
    opt('D3-2', '利用这次天气窗口，重新走山路', '已花约5天；后期容错极低', 'Day 5—6进入晚状态山路', 'D04B'),
  ] }),
  node({ id: 'D04A', route: 'D', title: '把安全等待真正兑现', kind: '剧情', time: 'Day 5以后→约Day 40', location: '长期等待／安全返程', facts: '人员与身体持续恢复；原购买窗口明确过去；最终安全返回。', knowledge: '退出／安全不是失败', frameIds: ['D04A2', 'SH-SAFE-01', 'SH-SAFE-02'] }),
  node({ id: 'D04B', route: 'D', title: '反转：进入共享山路', kind: '过渡', time: 'Day 5—6', location: '低处山路／暴风峰值后', facts: '身体比Day 0稳；天气比峰值好；但只剩极窄时间窗口。', knowledge: '反转成本、同动作不同状态', frameIds: ['D04B', 'SH-MTN-01'] }),
  node({ id: 'D05', route: 'D', title: '反转后的再判断', kind: '决策', time: '约Day 8—9', location: '山路后段', facts: '山路总体顺利；伤手、疲劳、局部天气造成普通小减速；因为前面等了5天，这点减速变得很贵。', question: '把反转执行到底，还是重新把人员安全放第一？', knowledge: '反转理由是否仍成立', frameIds: ['D05', 'D5FB-1', 'D5FB-2'], options: [
    opt('D5-1', '保持较快节奏，继续争取窗口', '几乎没有新的调整余量', 'Day 14 03:00', 'X01'),
    opt('D5-2', '把节奏降下来，重新把人员安全放第一', '降低强度会消耗最后余量', 'Day 14 18:00', 'X01'),
  ] }),

  node({ id: 'X01', route: 'SHARED', title: '期限与确认结算', kind: '结算', time: '按路径动态', location: '镇／相关办事地点', facts: '显示本人完成最后确认的实际时间、期限是否仍开放、人员状态以及哪次选择造成关键代价；抵达镜头本身不等于完成确认。', knowledge: '客观结局；保住／失去什么', frameIds: ['SH-TOWN-DAY', 'SH-TOWN-NIGHT'] }),
  node({ id: 'X02', route: 'SHARED', title: '安全返回／主动放弃结算', kind: '结算', time: '按路径动态', location: '营地→安全返程／尾声', facts: '明确原窗口被主动放弃或已过去，同时人员与能力得到保护。', knowledge: '退出保护了什么；放弃了什么', frameIds: ['SH-SAFE-01', 'SH-SAFE-02'] }),
  node({ id: 'R01', route: 'SHARED', title: '战略经历复盘', kind: '报告', time: '游戏结束', location: 'Web结果页', facts: '回放初始目标、关键假设、现实变化、再判断与最终取舍；不把一局行为定性为永久人格。', knowledge: '完整学生报告', frameIds: ['SH-TOWN-DAY', 'SH-SAFE-02'] }),
]

const branch = (value: FinalBranch) => value
export const FINAL_BRANCHES: FinalBranch[] = [
  branch({ id: 'A-01', route: 'A', name: 'A翻山→继续→保持节奏', sequence: 'P06-A > A2-1 > A4-1', completion: 'Day 9 18:00', deadline: '按期', people: '伤手受限、时间余量仍较大', tradeoff: '时间换风险；承诺升级', review: '已投入很多是不是继续的理由？', frameIds: ['A01', 'A02A', 'A02B', 'A02C', 'A03A1', 'A03A2', 'A04C', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'A-02', route: 'A', name: 'A翻山→继续→主动降速', sequence: 'P06-A > A2-1 > A4-2', completion: 'Day 10 18:00', deadline: '按期', people: '伤手受限，但执行更可持续', tradeoff: '保目标但调整执行', review: '战略一致性是否允许降速？', frameIds: ['A01', 'A02A', 'A02B', 'A02C', 'A03A1', 'A03A2', 'A04C', 'A4FB-2', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'A-03', route: 'A', name: 'A翻山→暂避→保持节奏', sequence: 'P06-A > A2-2 > A4-1', completion: 'Day 11 12:00', deadline: '按期', people: '身体更稳、时间缓冲明显变窄', tradeoff: '安全换时间', review: '保留缓冲是不是战略资源？', frameIds: ['A01', 'A02A', 'A02B', 'A02C', 'A2FB-S1', 'A03B', 'A04C', 'SH-TOWN-DAY'] }),
  branch({ id: 'A-04', route: 'A', name: 'A翻山→暂避→再降速', sequence: 'P06-A > A2-2 > A4-2', completion: 'Day 12 12:00', deadline: '按期', people: '身体最好但余量最小', tradeoff: '两次降低风险都会花时间', review: '降低一种风险会不会放大另一种？', frameIds: ['A01', 'A02A', 'A02B', 'A02C', 'A2FB-S1', 'A03B', 'A04C', 'A4FB-2', 'SH-TOWN-DAY'] }),
  branch({ id: 'A-05', route: 'A', name: 'A翻山→中途撤回转谷地', sequence: 'P06-A > A2-3 或 A4-3', completion: '约Day 21—23', deadline: '超期', people: '人员风险下降，但机会窗口失去', tradeoff: '止损 vs 已投入成本', review: '已经投入很多，是继续的理由吗？', frameIds: ['A01', 'A02A', 'A02B', 'A02C'], frameVariants: [
    { label: 'Day 3直接撤回', frameIds: ['A03R-D3', 'SH-VAL-WEB', 'SH-TOWN-DAY'] },
    { label: '到A04后晚撤回（中间可来自继续或暂避，省略互斥前序）', frameIds: ['A04C', 'A03R-D5', 'SH-VAL-WEB', 'SH-TOWN-DAY'] },
  ] }),

  branch({ id: 'B-01', route: 'B', name: 'B山谷→Day 6提速→继续高强度', sequence: 'P06-B > B2-1 > B4A-1', completion: 'Day 13 19:00', deadline: '按期', people: '疲劳高、缓冲很低', tradeoff: '较早调整换回期限', review: '为什么越晚调整越贵？', frameIds: ['B01-VALLEY', 'B01-CAMP', 'B02-CHECK', 'B03A-FATIGUE', 'B04A-DECISION', 'B4FB-DAWN', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'B-02', route: 'B', name: 'B山谷→Day 6提速→Day 9恢复节奏', sequence: 'P06-B > B2-1 > B4A-2', completion: 'Day 14 21:00', deadline: '超期', people: '人员状态得到保护', tradeoff: '先追回时间，再主动停止透支', review: '执行稳定和完成目标是一回事吗？', frameIds: ['B01-VALLEY', 'B02-CHECK', 'B03A-FATIGUE', 'B04A-DECISION', 'B4FB-REST', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'B-03', route: 'B', name: 'B山谷→一直稳走→Day 9最后冲刺', sequence: 'P06-B > B2-2 > B4B-1', completion: 'Day 14 01:00', deadline: '按期', people: '疲劳极高、几乎无缓冲', tradeoff: '晚调整仍能救，但成本暴涨', review: '同一个动作为什么晚做更贵？', frameIds: ['B01-VALLEY', 'B01-CAMP', 'B02-CHECK', 'B04B-DECISION', 'B4FB-DAWN', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'B-04', route: 'B', name: 'B山谷→始终稳走', sequence: 'P06-B > B2-2 > B4B-2', completion: 'Day 16 09:00', deadline: '超期', people: '人员状态最好', tradeoff: '稳妥路径与目标失配', review: '更稳的路径如果实现不了目标，还算好战略吗？', frameIds: ['B01-VALLEY', 'B01-CAMP', 'B02-CHECK', 'B04B-DECISION', 'B4FB-REST', 'SH-TOWN-DAY'] }),

  branch({ id: 'C-01', route: 'C', name: 'C等2天→转谷地', sequence: 'P06-C > C2-2', completion: '约Day 18', deadline: '超期', people: '高地风险降低', tradeoff: '2天信息足以改变路线，但时间成本已发生', review: '什么时候信息已经够用？', frameIds: ['C01A', 'C01B', 'C02', 'C2FB-2', 'C04V-A', 'SH-VAL-WEB', 'SH-TOWN-DAY'] }),
  branch({ id: 'C-02', route: 'C', name: 'C等3天→山路→按原计划', sequence: 'P06-C > C2-1 > C3-1 > C6-1', completion: 'Day 11 21:00', deadline: '按期', people: '避开最差暴风，仍承担剩余风险', tradeoff: '信息改善行动条件，但消耗3天', review: '信息的价值会不会被等待时间抵消？', frameIds: ['C01A', 'C02', 'C03', 'C04M', 'SH-MTN-01', 'C05', 'C06', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'C-03', route: 'C', name: 'C等3天→山路→现场再调整', sequence: 'P06-C > C2-1 > C3-1 > C6-2', completion: 'Day 13 09:00', deadline: '按期', people: '更稳、只剩约24小时缓冲', tradeoff: '信息+谨慎执行进一步消耗时间', review: '更多信息一定意味着更好吗？', frameIds: ['C01A', 'C02', 'C03', 'C04M', 'C05', 'C06', 'C6FB-2', 'SH-TOWN-DAY'] }),
  branch({ id: 'C-04', route: 'C', name: 'C等3天→转谷地', sequence: 'P06-C > C2-1 > C3-2', completion: '约Day 19', deadline: '超期', people: '高地暴露低', tradeoff: '信息支持了放弃山路，但慢路线更晚', review: '信息改变行动的价值是什么？', frameIds: ['C01A', 'C02', 'C03', 'C04V-A', 'SH-VAL-WEB', 'SH-TOWN-DAY'] }),
  branch({ id: 'C-05', route: 'C', name: 'C等3天→不再争期限', sequence: 'P06-C > C2-1 > C3-3', completion: '主动放弃', deadline: '主动放弃', people: '人员与安全优先', tradeoff: '停止追机会', review: '主动退出是失败吗？', frameIds: ['C01A', 'C02', 'C03', 'SH-SAFE-01', 'SH-SAFE-02'] }),
  branch({ id: 'C-06', route: 'C', name: 'C等3天→山路→现场证据推翻旧判断', sequence: 'P06-C > C2-1 > C3-1 > C6-3', completion: '安全返回，原窗口已失去', deadline: '超期', people: '风险下降但机会失去', tradeoff: '根据新证据退出旧承诺', review: '为一个判断付过成本后还能推翻它吗？', frameIds: ['C02', 'C03', 'C04M', 'C05', 'C06', 'C04V-B', 'SH-VAL-WEB', 'SH-TOWN-DAY'] }),

  branch({ id: 'D-01', route: 'D', name: 'D安全等待→继续等待', sequence: 'P06-D > D3-1', completion: '约Day 40安全返回', deadline: '主动放弃', people: '人员状态最好', tradeoff: '安全收益兑现；原窗口失去', review: '一个决定后来没改，可能是纪律还是僵化？', frameIds: ['D01A', 'D01B', 'D02-D03', 'D3FB-1', 'D04A2', 'SH-SAFE-01', 'SH-SAFE-02'] }),
  branch({ id: 'D-02', route: 'D', name: 'D安全等待→反转→保持较快节奏', sequence: 'P06-D > D3-2 > D5-1', completion: 'Day 14 03:00', deadline: '按期', people: '前期恢复好，后期容错极低', tradeoff: '前期安全换后期小时级缓冲', review: '同一个翻山为什么Day 0和Day 5不同？', frameIds: ['D01A', 'D01B', 'D02-D03', 'D3FB-2', 'D04B', 'SH-MTN-01', 'D05', 'D5FB-1', 'SH-TOWN-NIGHT'] }),
  branch({ id: 'D-03', route: 'D', name: 'D安全等待→反转→后续降速', sequence: 'P06-D > D3-2 > D5-2', completion: 'Day 14 18:00', deadline: '超期', people: '人员风险重新降低', tradeoff: '反转后仍允许根据新证据再调整', review: '后来修改决定是否说明原决定错了？', frameIds: ['D01A', 'D01B', 'D02-D03', 'D3FB-2', 'D04B', 'D05', 'D5FB-2', 'SH-TOWN-NIGHT'] }),
]

export const ROUTE_META = [
  { id: 'A' as const, title: '立即翻山', theme: '风险换时间 · 承诺升级 · 沉没成本' },
  { id: 'B' as const, title: '立即走山谷', theme: '可控性 · 路径目标匹配 · 调整时机' },
  { id: 'C' as const, title: '先等天气信息', theme: '信息价值 · 等待成本 · 更新判断' },
  { id: 'D' as const, title: '等天气好转后安全返回', theme: '价值排序 · 战略反转 · 退出边界' },
]

export function keyframeById(id: string) {
  return FINAL_KEYFRAMES.find((item) => item.id === id)
}

export function branchFrameSequences(branch: FinalBranch) {
  if (!branch.frameVariants?.length) return [{ label: '完整关键帧链', frameIds: branch.frameIds }]
  return branch.frameVariants.map((variant) => ({
    label: variant.label,
    frameIds: [...branch.frameIds, ...variant.frameIds],
  }))
}

export function validateFinalStoryMap() {
  const errors: string[] = []
  const frameIds = new Set(FINAL_KEYFRAMES.map((item) => item.id))
  const nodeIds = new Set(FINAL_NODES.map((item) => item.id))
  const usedFrameIds = new Set<string>()
  if (frameIds.size !== FINAL_KEYFRAMES.length) errors.push('关键帧ID重复')
  if (nodeIds.size !== FINAL_NODES.length) errors.push('节点ID重复')
  if (FINAL_KEYFRAMES.length !== 55) errors.push(`关键帧数量应为55，实际${FINAL_KEYFRAMES.length}`)
  if (FINAL_NODES.length !== 33) errors.push(`节点数量应为33，实际${FINAL_NODES.length}`)
  if (FINAL_BRANCHES.length !== 18) errors.push(`代表路径应为18，实际${FINAL_BRANCHES.length}`)

  for (const item of FINAL_NODES) {
    if (item.frameIds.length === 0) errors.push(`${item.id}没有关键帧`)
    for (const id of item.frameIds) {
      usedFrameIds.add(id)
      if (!frameIds.has(id)) errors.push(`${item.id}引用不存在的关键帧${id}`)
    }
    for (const option of item.options ?? []) if (!nodeIds.has(option.to)) errors.push(`${option.id}指向不存在的节点${option.to}`)
  }
  for (const item of FINAL_BRANCHES) {
    const sequences = branchFrameSequences(item)
    if (sequences.length === 0 || sequences.some((sequence) => sequence.frameIds.length === 0)) errors.push(`${item.id}没有关键帧`)
    for (const sequence of sequences) {
      for (const id of sequence.frameIds) {
        usedFrameIds.add(id)
        if (!frameIds.has(id)) errors.push(`${item.id}引用不存在的关键帧${id}`)
      }
    }
  }
  for (const id of frameIds) if (!usedFrameIds.has(id)) errors.push(`${id}未绑定到任何节点或路径`)
  return errors
}
