export type StoryRouteId = 'A' | 'B' | 'C' | 'D'
export type StoryRouteFilter = 'ALL' | StoryRouteId
export type StoryEndingId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6'
export type StoryProductionStatus = 'ready' | 'partial' | 'scripted' | 'rebuild'

export type StoryFinale = {
  id: string
  label: string
  mode: 'choice' | 'automatic'
  requiredFacts: string[]
  result: string
  finalState: string[]
  scene: string
  coursePoint: string
  endingType: StoryEndingId
  video: string
  status: 'locked-script' | 'needs-keyframes' | 'existing-review'
}

export type StoryOutcome = {
  id: string
  title: string
  time: string
  deadline: 'open' | 'expired' | 'resolved'
  directResult: string
  scene: string
  facts: string[]
  coursePoint: string
  status: StoryProductionStatus
  externalActor?: string
  finales: StoryFinale[]
  keyframe?: string
}

export type StorySituation = {
  id: string
  title: string
  time: string
  summary: string
  scene: string
  facts: string[]
  dialogue: string[]
  coursePoint: string
  status: StoryProductionStatus
  keyframe?: string
}

export type StoryRouteLane = {
  id: StoryRouteId
  label: string
  thesis: string
  situation: StorySituation
  outcomes: StoryOutcome[]
}

const finale = (
  id: string,
  label: string,
  requiredFacts: string[],
  result: string,
  finalState: string[],
  scene: string,
  coursePoint: string,
  endingType: StoryEndingId,
  mode: StoryFinale['mode'] = 'choice',
): StoryFinale => ({
  id,
  label,
  mode,
  requiredFacts,
  result,
  finalState,
  scene,
  coursePoint,
  endingType,
  video: `/videos/web/finales/${id.toLowerCase()}.mp4`,
  status: 'needs-keyframes',
})

export const REDESIGNED_STORY = {
  title: '最后十四天',
  subtitle: '正式剧情树 v3.0 · 34条独立因果结局',
  deprecatedFlow: '旧版“所有路线 → X1 → X2 → X3 → 公用Fx视频”已废弃。F1–F6只用于报告分类，不再承担剧情。',
  common: [
    {
      id: 'INTRO', title: '发现黄金，只剩十四天', time: '剩余14天',
      scene: '第一人称勘探帐篷。沈岚将高品位矿石放在地图旁，队长缠着绷带的左手出现在画面边缘。镜头确认玩家持有土地购买期权，登记窗口只剩十四天。',
      keyframe: '/images/choice-frames/choice-primary.webp',
    },
    {
      id: 'PRIMARY', title: '第一次战略选择', time: '剩余14天',
      scene: '玩家在速度、安全、信息与主动退出之间选择 A/B/C/D。沈岚、老周和阿杰只提供事实与意见，最终决定由玩家独立作出。',
      keyframe: '/images/choice-frames/choice-primary.webp',
    },
  ],
  endingTypes: [
    { id: 'F1' as const, title: '独立控制登记', definition: '按时提交，人员、证据和执行能力基本可持续。', profile: '平衡执行型' },
    { id: 'F2' as const, title: '有代价的登记', definition: '按时提交，但伤势、证据、设备或组织能力受到明确损失。', profile: '高承诺推进型' },
    { id: 'F3' as const, title: '合作控制登记', definition: '借助已建立的当地运输队按时提交，同时让渡部分未来权益或决策空间。', profile: '生态合作型' },
    { id: 'F4' as const, title: '资本回收退出', definition: '向已铺垫的竞争者交付完整勘探资料，回收大部分投入并退出。', profile: '选择权管理型' },
    { id: 'F5' as const, title: '安全撤离', definition: '人员与可迁移能力优先；无论窗口是否仍开放，都把安全撤离作为当前行动目标。', profile: '稳健韧性型' },
    { id: 'F6' as const, title: '窗口关闭后重构', definition: '窗口已经关闭，通过取舍保存知识、设备或组织能力。', profile: '复盘重构型' },
  ],
  routes: [] as StoryRouteLane[],
}

REDESIGNED_STORY.routes = [
  {
    id: 'A', label: 'A · 立即翻山', thesis: '以速度换取时间优势，检验高承诺、不可逆损失和战略缓冲。',
    situation: {
      id: 'A0', title: '暴风提前，山口仍在前方', time: '第3天 · 剩余11天',
      summary: '固定绳受风，队长左手失力，附近存在可临时扎营的背风岩壁。',
      scene: '第一人称持续上坡。山口在前方高处，横向暴风提前抵达，固定绳被拉直，队长左手明显失力；镜头同时交代侧后方可临时避风的岩壁。',
      facts: ['山口还在前方', '暴风比预报早到', '固定绳正在受风', '队长左手失力', '附近有可临时扎营的背风岩壁'],
      dialogue: ['老周：山口还在前面，风比预报早了一天。', '阿杰：你的左手撑不住这样的拉力。'],
      coursePoint: '承诺升级、不可逆性与战略缓冲', status: 'partial', keyframe: '/images/choice-frames/choice-A.webp',
    },
    outcomes: [
      {
        id: 'A1', title: '继续冲过山口', time: '第9天 · 剩余5天', deadline: 'open',
        directResult: '队伍真正越过山脊，队长伤势加重并遗失部分设备。',
        scene: '现有越岭成片后补一段路线判断：远景能看见已翻过的脊线；阿杰确认队长不能保持轻装队速度；沈岚举起防水文件袋和核心样本；老周说明轻装队四天、全队同行五天可到登记地。',
        facts: ['已越过山脊', '剩余5天', '队长左手伤势加重', '部分设备遗失', '沈岚持有防水文件袋与核心样本', '轻装队四天可达登记地', '全队同行需要五天'],
        coursePoint: '速度、不可逆能力损失与组织分工', status: 'partial', keyframe: '/images/choice-frames/outcome-A1.png',
        finales: [
          finale('A1-1', '沈岚、老周携资料先行', ['队长左手伤势加重', '沈岚持有防水文件袋与核心样本', '轻装队四天可达登记地'], '沈岚和老周在第13天提交土地购买期权登记材料；阿杰陪队长慢行，团队临时分开，已经遗失的设备无法恢复，后续现场执行能力受限。', ['剩余1天', '登记材料已提交', '队长接受照护', '设备部分损失', '团队分开'], '从背风坡直接分队。镜头跟随资料小组抵达登记窗口，再以无线电确认队长安全；不返回帐篷。', '组织分工与协调成本', 'F2'),
          finale('A1-2', '全队继续减负并共同前进', ['剩余5天', '全队同行需要五天', '部分设备遗失'], '全队在截止日共同抵达并提交材料；为维持速度又留下部分非关键物资，伤势和后续执行能力进一步下降。', ['截止日提交', '全员抵达', '伤势严重', '设备能力明显下降'], '全队在原地重新分配背包，连续行进到登记地；尾帧同时看到提交文件与空置装备位。', '团队一致性与资源牺牲', 'F2'),
          finale('A1-3', '终止推进，优先治疗并撤离', ['队长左手伤势加重', '剩余5天', '部分设备遗失'], '队长伤势得到控制，全员安全离开高风险山区；登记窗口随后关闭，本次机会终止。', ['人员安全', '登记窗口关闭', '设备部分损失', '团队能力保留'], '阿杰固定队长左手，老周带队沿背风坡撤离；以远处山脊和关闭的期限提示结束。', '止损纪律与目标排序', 'F5'),
        ],
      },
      {
        id: 'A2', title: '背风处扎营等待一天', time: '第4天 · 剩余10天', deadline: 'open',
        directResult: '队伍在背风雪台安全度过一夜，人员、设备和样本完整，但已经使用一天时间。',
        scene: '保留现有背风扎营成片，补清晨路线判断：队伍仍在可封存设备的背风雪台，风势已经减弱；老周说明封存非关键设备后全队轻装九天可达，资料小组轻装先行需要八天，带齐重装继续按安全节奏前进则没有可靠的期限余量。',
        facts: ['风势已减弱', '第4天，剩余10天', '队伍仍在背风雪台', '人员状态可控', '设备与样本完整', '全队轻装九天可达登记地', '资料小组轻装先行需要八天', '重装同行没有可靠时间余量', '背风雪台可以标记并封存非关键设备'],
        coursePoint: '战略缓冲、机会成本与资源组合', status: 'partial', keyframe: '/images/choice-frames/outcome-A2.png',
        finales: [
          finale('A2-1', '封存非关键设备，全队轻装', ['全队轻装九天可达登记地', '背风雪台可以标记并封存非关键设备', '设备与样本完整'], '全队封存非关键设备后轻装前进，在第13天抵达并提交材料；核心样本、人员和关键执行能力同时保留，封存设备等待后续回收。', ['剩余1天', '登记材料已提交', '全员状态可控', '核心能力保留'], '队员在背风雪台共同封存并标记设备，随后轻装连续行进；尾帧在登记地核对人员、文件和核心样本。', '资源重组与战略匹配', 'F1'),
          finale('A2-2', '资料小组先行，医疗与设备组随后', ['第4天，剩余10天', '资料小组轻装先行需要八天', '设备与样本完整'], '沈岚和老周在第12天提交材料；阿杰陪同队长并看守设备，人员与资产保住，但临时分队增加了协调成本。', ['剩余2天', '登记材料已提交', '队长状态稳定', '设备完整', '团队暂时分开'], '队伍在背风雪台完成分工，资料小组轻装先行；以无线电交叉确认两组状态和提交结果。', '组织边界与协调风险', 'F2'),
          finale('A2-3', '保持重装，按安全节奏前进', ['重装同行没有可靠时间余量', '设备与样本完整', '人员状态可控'], '队伍带齐重装并按安全节奏前进，人员和设备保持完整，但抵达时登记窗口已经关闭；完整资源没有转化为当前机会。', ['人员安全', '设备与样本完整', '登记窗口关闭', '当前机会终止'], '队伍从背风雪台重装出发，以连续行进和日夜变化表现安全但缓慢的推进；抵达时明确期限已经结束。', '资源完整性与战略目标失配', 'F6'),
        ],
      },
      {
        id: 'A3', title: '撤回并转走山谷', time: '山谷行程结束 · 已超期', deadline: 'expired',
        directResult: '队伍规避暴风，但返程与长路耗尽期限，土地购买机会进入公开程序。',
        scene: '保留现有下撤和转入山谷成片；补充日夜行进与期限关闭段，之后明确进入损失控制，不再出现赶路或登记选项。',
        facts: ['全员离开高风险山脊', '登记窗口已经关闭', '样本与勘探资料仍在', '部分设备仍可回收', '继续回收会延长人员与资本占用'],
        coursePoint: '战略反转、转换成本与损失控制', status: 'partial', keyframe: '/images/choice-frames/outcome-A3.png',
        finales: [
          finale('A3-1', '优先人员和可携带设备', ['全员离开高风险山脊', '部分设备仍可回收'], '全员安全返回并带回可携带设备；山中耗材被放弃，组织的基本行动能力得以保留。', ['全员安全', '可携带设备保留', '耗材放弃', '当前机会终止'], '山谷撤离点重新分配负重，队伍带着可携带设备离开；尾帧为全员点名和设备清单。', '风险控制与能力保存', 'F5'),
          finale('A3-2', '优先整理样本和勘探资料', ['样本与勘探资料仍在', '登记窗口已经关闭'], '队伍放弃部分物资，把样本、地图和勘探记录完整带回；当前机会结束，但知识资产可用于复盘和后续项目。', ['知识资产完整', '部分物资放弃', '人员安全', '当前机会终止'], '沈岚在山谷营地封装样本和记录，队伍轻装撤出；尾帧突出完整资料箱。', '组织学习与知识资产', 'F6'),
          finale('A3-3', '延长撤离以回收更多设备', ['部分设备仍可回收', '继续回收会延长人员与资本占用'], '队伍回收了更多设备，但撤离周期和人员消耗继续增加；已经关闭的机会没有恢复。', ['多数设备回收', '人员疲劳增加', '资本继续占用', '当前机会终止'], '队伍沿原路多次搬运设备，以明确的日夜变化表现额外占用，最终重装离开山谷。', '资产保全与继续投入', 'F6'),
        ],
      },
    ],
  },
  {
    id: 'B', label: 'B · 改走山谷', thesis: '检验局部安全、整体目标、证据完整性与资源组合。',
    situation: {
      id: 'B0', title: '木桥冲断，索桥只能轻装通行', time: '第6天 · 剩余8天',
      summary: '河水上涨；绕行会耗尽期限；检修索桥无法承载重型设备。',
      scene: '第一人称抵达暴涨融雪河。断裂原木桥、上游狭窄检修索桥和前景重型设备箱同时可辨认。',
      facts: ['原木桥已冲断', '河水上涨', '沿山谷绕行会耗尽剩余期限', '检修索桥只容人员与轻装', '重型设备无法通过索桥'],
      dialogue: ['老周：上游有检修索桥，只能走人和轻装，重装备过不去。', '沈岚：我们只剩八天，沿山谷绕行会把登记窗口耗尽。'],
      coursePoint: '系统完整性与局部最优', status: 'partial', keyframe: '/images/choice-frames/choice-B.webp',
    },
    outcomes: [
      {
        id: 'B1', title: '立即涉水强渡', time: '第13天 · 剩余1天', deadline: 'open',
        directResult: '队伍抢回时间并抵达登记地附近，但样本和补给受潮，登记证据完整度下降。',
        scene: '现有强渡成片后补证据检查：湿透的样本袋和补给清晰可见；沈岚确认防水袋中的路线记录、照片和坐标仍完整，阿杰找出少量未受潮核心样本。',
        facts: ['已经渡河并接近登记地', '剩余1天', '部分样本与补给受潮', '防水路线记录、照片和坐标完整', '少量核心样本未受潮'],
        coursePoint: '局部冒险、证据质量与系统后果', status: 'partial',
        finales: [
          finale('B1-1', '立即提交现有全部材料', ['剩余1天', '部分样本与补给受潮'], '队伍在截止前提交材料，但受潮样本降低证据完整度，矿区控制状态仍不稳固。', ['按时提交', '证据完整度较低', '样本与补给受潮', '控制状态不稳固'], '队伍直接赶到登记窗口，将湿样本与防水文件分区摆放并完成材料交付；不表现未经案例支持的审核规则。', '速度与证据质量', 'F2'),
          finale('B1-2', '队内并行整理现有材料', ['剩余1天', '部分样本与补给受潮', '防水路线记录、照片和坐标完整', '少量核心样本未受潮'], '沈岚核对样本编号、照片和采样位置，阿杰处理受潮样本，老周整理路线；队伍在截止前提交材料，但样本受潮造成的完整度损失无法消除，成员也几乎耗尽体力。', ['按时提交', '样本受潮影响仍在', '人员高度疲劳', '执行余量很低'], '在登记地外连续展示三人并行整理现有材料，随后共同完成交付；不进入公共帐篷。', '并行组织与时间压缩', 'F2'),
          finale('B1-3', '舍弃受潮部分，只交干燥核心证据', ['剩余1天', '防水路线记录、照片和坐标完整', '少量核心样本未受潮'], '队伍按时提交干燥核心样本与完整记录；证据更干净但覆盖范围变窄，后续价值判断受到限制。', ['按时提交', '核心证据干燥', '样本覆盖有限', '后续评估受限'], '阿杰剔除受潮样本，沈岚把干燥核心样本与记录装入提交箱；尾帧显示被舍弃的湿样本。', '质量边界与范围取舍', 'F2'),
        ],
      },
      {
        id: 'B2', title: '沿山谷绕行', time: '抵达时已过截止时刻', deadline: 'expired',
        directResult: '队伍和设备安全，但长路耗尽登记期限，土地购买机会进入公开程序。',
        scene: '沿河谷连续行进和多次扎营表现时间流逝。抵达撤离节点时人员、设备与样本完整，但窗口已关闭。',
        facts: ['人员安全', '设备与样本完整', '登记窗口已经关闭', '重型设备拖慢撤离', '样本与路线数据可以独立保存'],
        coursePoint: '执行安全与战略目标失配', status: 'partial',
        finales: [
          finale('B2-1', '完整撤回人员与设备', ['人员安全', '设备与样本完整', '重型设备拖慢撤离'], '队伍以较慢速度完整撤回人员和设备，保住执行能力，但继续占用运输时间和资本。', ['人员安全', '设备完整', '资本占用增加', '当前机会终止'], '队伍沿安全路线分批运输全部设备，最终在基地完成点收。', '能力保存与资本占用', 'F5'),
          finale('B2-2', '优先封存样本和路线数据', ['样本与路线数据可以独立保存', '重型设备拖慢撤离'], '队伍带回完整知识资产并放弃部分低价值物资，缩短撤离时间，为后续项目保留判断依据。', ['知识资产完整', '低价值物资放弃', '撤离加快', '当前机会终止'], '沈岚封存样本和路线记录，其他人筛掉低价值物资，队伍随后撤出河谷。', '知识资产与资源筛选', 'F6'),
          finale('B2-3', '优先保留可复用核心设备', ['设备与样本完整', '样本与路线数据可以独立保存'], '队伍保住可迁移的核心设备，舍弃部分重复样本与耗材；未来执行能力高于信息完整度。', ['核心设备保留', '样本覆盖下降', '人员安全', '当前机会终止'], '老周和阿杰筛选可复用设备，沈岚压缩样本箱；尾帧对照保留设备与舍弃耗材。', '资源基础与未来能力', 'F6'),
        ],
      },
      {
        id: 'B3', title: '留下重装，轻装过索桥', time: '第13天 · 剩余1天', deadline: 'open',
        directResult: '全员通过索桥并接近登记地，核心资料已经过河，重型设备留在对岸。',
        scene: '现有索桥成片后补负重判断：全员和核心资料在桥的另一端，镜头回望重装；沈岚说明剩余轻装容量只能在更多样本、人员补给和速度之间取舍。',
        facts: ['全员已通过索桥', '剩余1天', '核心资料已经过河', '重型设备已经留弃在对岸', '轻装容量有限', '队长左手仍不稳定'],
        coursePoint: '短期目标、证据组合与长期能力', status: 'partial',
        finales: [
          finale('B3-1', '优先文件与最佳核心样本', ['剩余1天', '核心资料已经过河', '轻装容量有限'], '全队按时提交文件和最佳核心样本；证据足以受理，但样本覆盖有限，重型设备损失削弱后续能力。', ['按时提交', '核心证据保留', '样本覆盖有限', '重型能力损失'], '全队舍弃次要负重，携文件袋和最佳样本赶到登记地完成交接。', '关键资源识别', 'F2'),
          finale('B3-2', '优先完整样本与记录，压缩个人补给', ['核心资料已经过河', '轻装容量有限', '剩余1天'], '队伍携带更完整的样本和记录按时提交，但个人补给几乎耗尽，人员状态和后续执行余量明显下降。', ['按时提交', '证据较完整', '人员高度疲劳', '补给与重型能力损失'], '队员把个人补给留在桥头，背负样本和记录快速前进；尾帧显示空补给袋。', '证据完整性与人员韧性', 'F2'),
          finale('B3-3', '资料小组先行，阿杰陪队长后行', ['剩余1天', '核心资料已经过河', '重型设备已经留弃在对岸', '队长左手仍不稳定'], '沈岚和老周先行提交，阿杰陪队长减速跟进；登记按时完成，但团队临时分开，重型设备永久留弃，后续开采能力受损。', ['按时提交', '团队临时分开', '重型设备永久留弃', '队长得到照护'], '索桥出口明确分队，前组携资料抵达登记地，后组沿同一路线安全跟进；不返回索桥取设备。', '组织分工与不可逆能力损失', 'F2'),
        ],
      },
    ],
  },
  {
    id: 'C', label: 'C · 等待48小时预报', thesis: '检验信息价值、行动转化、能力获取与控制边界。',
    situation: {
      id: 'C0', title: '预报明确，天气窗只剩三十六小时', time: '等待2天后 · 剩余12天 · 天气窗36小时',
      summary: '山脊即将封闭；当地运输队可以提供雪地运输，但要求部分未来权益。',
      scene: '无线电和天气图确认山脊即将封闭。通话中必须完整听见当地运输队能提供雪地运输，并要求部分未来权益。',
      facts: ['预报已经明确', '山脊即将封闭', '天气窗口只剩36小时', '可以联系当地运输队', '运输队可以提供雪地运输能力', '运输队要求部分未来权益'],
      dialogue: ['老周：预报定了，三十六小时后山脊封闭。', '无线电：我们能派雪地运输车，但要拿一部分后续权益。'],
      coursePoint: '信息价值、行动窗口与交易成本', status: 'rebuild', keyframe: '/images/choice-frames/choice-C.webp',
    },
    outcomes: [
      {
        id: 'C1', title: '轻装抢在封山前翻越', time: '第12天 · 剩余2天', deadline: 'open',
        directResult: '队伍利用天气窗越岭并接近登记地，但只能携带少量样本。',
        scene: '山口在队伍身后被暴风封闭；镜头展示少量干燥核心样本、防水路线记录、照片和坐标，阿杰确认队长疲劳但可继续。',
        facts: ['已经利用天气窗口越岭', '剩余2天', '样本数量有限', '防水路线记录、照片和坐标完整', '队长疲劳但能够继续'],
        coursePoint: '信息转化与证据充分性', status: 'scripted',
        finales: [
          finale('C1-1', '立即提交有限样本与完整记录', ['剩余2天', '样本数量有限', '防水路线记录、照片和坐标完整'], '队伍提前提交材料；登记按时受理，但有限样本限制了后续价值评估。', ['按时提交', '记录完整', '样本有限', '后续评估受限'], '从封山后的背风坡连续行进至登记地，将少量样本与完整记录一并交付。', '速度与证据充分性', 'F2'),
          finale('C1-2', '用一天整理样本与路线记录', ['剩余2天', '样本数量有限', '防水路线记录、照片和坐标完整'], '沈岚用一天核对样本编号、照片和采样位置，队伍在最后一天完成提交；记录更清楚，但样本数量不足仍限制后续价值评估。', ['最后一天提交', '路线记录完整', '样本有限', '人员疲劳增加'], '沈岚在临时工作台整理照片、坐标与样本编号，次日全队完成提交。', '信息整合与证据质量', 'F2'),
          finale('C1-3', '资料小组先行，队长减速恢复', ['队长疲劳但能够继续', '剩余2天', '防水路线记录、照片和坐标完整'], '沈岚和老周先行提交，阿杰陪队长减速跟进；期限保住且人员风险下降，但队伍临时分开，有限样本仍会限制后续价值评估。', ['按时提交', '队长状态稳定', '团队临时分开', '样本仍然有限'], '路线出口明确分队，前组完成提交，后组在安全点通过无线电确认。', '分工、健康与协调成本', 'F2'),
        ],
      },
      {
        id: 'C2', title: '根据预报改走山谷', time: '抵达时已过截止时刻', deadline: 'expired',
        directResult: '队伍正确避开暴风，但等待与长路叠加后超过登记期限。',
        scene: '远处山脊被暴风封闭，证明预报正确；山谷长距离行进确认窗口归零，人员、设备、样本和天气记录仍在。',
        facts: ['正确避开暴风', '人员与设备安全', '登记窗口已经关闭', '样本与天气路线记录完整', '继续携带全部重装会延长撤离'],
        coursePoint: '预测准确与战略可行性', status: 'scripted',
        finales: [
          finale('C2-1', '优先全员和设备安全返回', ['人员与设备安全', '继续携带全部重装会延长撤离'], '队伍按安全节奏带回全部核心设备，保留执行能力，但撤离周期和资本占用较长。', ['人员安全', '核心设备保留', '撤离周期较长', '当前机会终止'], '沿山谷安全撤离，多次交替搬运设备，最终在基地完成点收。', '韧性与能力保存', 'F5'),
          finale('C2-2', '优先建立天气与路线复盘档案', ['样本与天气路线记录完整', '登记窗口已经关闭'], '队伍带回完整天气判断、路线和样本档案，放弃部分低价值物资，把正确预测未能转化为行动的原因沉淀为组织知识。', ['复盘档案完整', '部分物资放弃', '人员安全', '当前机会终止'], '沈岚在撤离点封存天气图、路线记录和样本，尾帧为完成归档的资料箱。', '组织学习与信息行动化', 'F6'),
          finale('C2-3', '保持全部资产，接受更长撤离周期', ['人员与设备安全', '继续携带全部重装会延长撤离'], '队伍保住全部设备和样本，但继续投入人员、补给和时间；信息资产最完整，资本占用也最高。', ['全部资产保留', '人员疲劳增加', '资本占用最高', '当前机会终止'], '队伍分段运输全部资产，以连续日夜变化表现延长的撤离周期。', '资产完整性与退出成本', 'F6'),
        ],
      },
      {
        id: 'C3', title: '引入当地运输伙伴', time: '第11天 · 剩余3天', deadline: 'open',
        directResult: '队伍获得雪地运输能力并接近登记地，同时已经接受让渡部分未来权益。',
        scene: '雪地运输车与队伍会合；对方再次确认部分未来权益，沈岚保管原始资料并指出双方运输、资料和后续决策边界尚需明确。',
        facts: ['当地运输队已经到场', '剩余3天', '雪地运输能力可以使用', '已接受让渡部分未来权益', '沈岚保管原始勘探资料', '双方执行与决策边界尚未明确'],
        coursePoint: '战略联盟、能力互补与控制边界', status: 'scripted', externalActor: '当地运输队',
        finales: [
          finale('C3-1', '按现有条件联合行动并提交', ['雪地运输能力可以使用', '已接受让渡部分未来权益', '剩余3天'], '双方按原条件快速行动并完成提交；运输瓶颈解除，但未来权益和部分决策空间已经让渡。', ['按时提交', '运输能力补足', '未来权益部分让渡', '协调速度最快'], '运输队装载设备和人员直达登记地，双方共同交付材料。', '能力互补与控制稀释', 'F3'),
          finale('C3-2', '先明确执行与决策边界', ['双方执行与决策边界尚未明确', '剩余3天', '沈岚保管原始勘探资料'], '双方用一天明确运输、资料保管和后续决策责任，仍在期限内提交；控制边界更清楚，但时间余量下降。', ['按时提交', '合作边界清楚', '未来权益部分让渡', '时间余量减少'], '在车辆旁完成口头分工和物资交接，再共同前往登记地；不生成可读合同文字。', '联盟治理与交易成本', 'F3'),
          finale('C3-3', '伙伴负责运输，队内保管原始资料', ['雪地运输能力可以使用', '沈岚保管原始勘探资料', '已接受让渡部分未来权益'], '运输队只承担运输执行，原始资料始终由沈岚保管；团队按时提交并保留较强流程控制，但协调负担更高。', ['按时提交', '运输能力补足', '原始资料由队内控制', '未来权益部分让渡'], '伙伴装载车辆，沈岚全程贴身保管资料箱；双方在登记地完成分工明确的联合交付。', '合作边界与流程控制', 'F3'),
        ],
      },
    ],
  },
  {
    id: 'D', label: 'D · 等待3–4周后安全撤离', thesis: '检验主动退出、资本回收、路径反转与目标一致性。',
    situation: {
      id: 'D0', title: '等待决定后第六天，竞争者提出报价', time: '等待决定后第6天 · 剩余8天',
      summary: '队伍仍在营地；天气短暂转好；竞争者愿购买完整勘探资料。',
      scene: '队伍仍在原营地整理和保护装备。无线电完整播放竞争者购买完整勘探资料、报价足以覆盖大部分前期投入；沈岚说明取消等待并轻装出发仍有八天。',
      facts: ['队伍仍在营地等待', '已经消耗6天，剩余8天', '天气短暂转好', '竞争者愿购买完整勘探资料', '报价足以覆盖大部分前期投入', '取消等待并轻装出发仍有8天'],
      dialogue: ['无线电：我们愿意购买你们的完整勘探资料，报价足够覆盖大部分前期投入。', '沈岚：如果现在取消等待、轻装出发，我们还有八天。'],
      coursePoint: '退出选择权、资本回收与转换成本', status: 'rebuild', keyframe: '/images/choice-frames/choice-D.webp',
    },
    outcomes: [
      {
        id: 'D1', title: '继续执行安全等待方案', time: '登记窗口关闭后 · 等待天气稳定', deadline: 'expired',
        directResult: '队伍继续等待，登记窗口关闭，原有土地购买机会进入公开竞争；天气稳定后可以安全撤离。',
        scene: '营地继续整理和加固，以天气变化和队内确认交代登记窗口已经关闭、原优先机会终止并进入公开竞争；天气逐渐稳定，队伍开始决定撤收顺序。',
        facts: ['登记窗口已经关闭', '原有土地购买机会进入公开竞争', '天气已经适合安全撤离', '人员与设备仍在营地', '完整撤运会延长资本占用'],
        coursePoint: '目标排序、退出执行与一致性', status: 'scripted',
        finales: [
          finale('D1-1', '按原计划完整撤出人员与设备', ['天气已经适合安全撤离', '人员与设备仍在营地', '完整撤运会延长资本占用'], '队伍和设备全部安全离开，组织能力完整保留；代价是更长的撤运周期和资本占用。', ['全员安全', '设备完整', '资本占用增加', '当前机会终止'], '按人员、样本、设备顺序系统撤营，最终在基地完成全员和设备点收。', '一致性执行与能力保存', 'F5'),
          finale('D1-2', '先封存数据与样本，放弃部分物资', ['人员与设备仍在营地', '天气已经适合安全撤离'], '队伍优先带回完整资料和样本，放弃部分低价值营地物资；撤离更快，知识资产得到保留。', ['知识资产完整', '部分物资放弃', '全员安全', '当前机会终止'], '沈岚封存资料样本，其他人筛选物资，随后快速撤出营地。', '退出中的资源优先级', 'F6'),
          finale('D1-3', '分批快速转移设备', ['天气已经适合安全撤离', '完整撤运会延长资本占用'], '队伍利用稳定天气分批转移设备，缩短总占用周期；营地防护随转运逐步拆除，执行压力集中在最后阶段。', ['设备基本保留', '撤离周期缩短', '末段执行压力增加', '当前机会终止'], '老周和阿杰先转移设备，沈岚看守资料，最后一批人员撤离空营地。', '退出节奏与执行风险', 'F5'),
        ],
      },
      {
        id: 'D2', title: '出售勘探资料并退出', time: '交易核验完成 · 主动退出', deadline: 'resolved',
        directResult: '队伍接受报价，回收大部分前期投入并永久放弃矿区控制机会与未来上涨。',
          scene: '先在营地通过无线电确认交易对象是完整勘探资料，再明确过渡到基地核验和交付；交易物只表现地图、照片、坐标与勘探记录。',
        facts: ['竞争者已经提出报价', '交易对象是完整勘探资料', '报价可以回收大部分前期投入', '交付后永久放弃未来控制机会'],
        coursePoint: '退出战略、资本回收与机会成本', status: 'scripted', externalActor: '竞争者收购方',
        finales: [
          finale('D2-1', '完成核验与资料交付', ['交易对象是完整勘探资料', '报价可以回收大部分前期投入', '交付后永久放弃未来控制机会'], '收购方完成核验，队伍交付完整勘探资料并回收大部分投入；玩家放弃土地购买期权，不再参与该矿区未来上涨收益。', ['回收大部分投入', '全员安全退出', '完整勘探资料已交付', '永久放弃未来控制'], '通过“数日后，基地核验”的明确过渡进入交付场景；资料箱核验后关闭，队伍离开。', '退出价值与机会成本', 'F4', 'automatic'),
        ],
      },
      {
        id: 'D3', title: '取消等待，轻装重返登记路线', time: '第13天 · 剩余1天', deadline: 'open',
        directResult: '队伍留下重型设备并赶到登记地最后路段，补给和调整缓冲几乎耗尽。',
        scene: '从营地轻装出发连续行进至登记地最后路段；镜头回看遥远营地并显示几乎空的补给包。沈岚确认文件和样本都在，但轻装容量与人员体力只够完成一种组织方式。',
        facts: ['重型设备留在营地', '剩余1天', '队伍已到登记地最后路段', '补给和调整缓冲几乎耗尽', '登记文件与核心样本完整', '队长体力明显下降'],
        coursePoint: '战略反转、转换成本与最后承诺', status: 'scripted',
        finales: [
          finale('D3-1', '全队只带文件和最佳核心样本', ['剩余1天', '登记文件与核心样本完整', '补给和调整缓冲几乎耗尽'], '全队放弃剩余非必要负重，在截止前共同提交文件和最佳核心样本；登记完成，但重型设备留弃、补给耗尽、样本覆盖下降。', ['按时提交', '全员抵达', '重型设备留弃', '样本覆盖有限', '执行缓冲归零'], '全队在最后路段再次减负，连续冲刺到登记地完成交接。', '目标聚焦与资源最小化', 'F2'),
          finale('D3-2', '沈岚、老周携完整证据先行', ['剩余1天', '登记文件与核心样本完整', '队长体力明显下降'], '沈岚和老周提前提交较完整证据；阿杰陪队长安全跟进。登记按时完成，但团队分开、重型设备留弃，补给与调整缓冲基本耗尽。', ['按时提交', '证据较完整', '队长得到照护', '重型设备留弃', '补给缓冲耗尽'], '最后路段明确分队，前组完成材料交接，后组在安全点回应无线电。', '组织分工与协调成本', 'F2'),
          finale('D3-3', '全队携尽可能多的样本共同冲刺', ['剩余1天', '队长体力明显下降', '补给和调整缓冲几乎耗尽'], '全员在截止前携更多样本抵达并提交，但重型设备留弃、队长伤势加重、补给耗尽，后续现场执行能力降至最低。', ['截止前提交', '样本较完整', '重型设备留弃', '队长伤势加重', '后续执行能力最低'], '全队背负更多样本完成最后冲刺；尾帧同时展示受理材料、空补给包和阿杰重新固定伤手。', '证据完整性与人员代价', 'F2'),
        ],
      },
    ],
  },
]

export function getVisibleStoryLanes(filter: StoryRouteFilter) {
  return filter === 'ALL' ? REDESIGNED_STORY.routes : REDESIGNED_STORY.routes.filter((route) => route.id === filter)
}

export function getTerminalPathCount() {
  return REDESIGNED_STORY.routes.reduce(
    (total, route) => total + route.outcomes.reduce((routeTotal, outcome) => routeTotal + outcome.finales.length, 0),
    0,
  )
}

export function validateRedesignedStory() {
  const errors: string[] = []
  const endingIds = new Set(REDESIGNED_STORY.endingTypes.map((ending) => ending.id))
  const terminalIds = new Set<string>()
  const videoPaths = new Set<string>()
  const outcomeById = new Map(REDESIGNED_STORY.routes.flatMap((route) => route.outcomes).map((outcome) => [outcome.id, outcome]))
  const situationById = new Map(REDESIGNED_STORY.routes.map((route) => [route.situation.id, route.situation] as const))
  const endingById = new Map(REDESIGNED_STORY.endingTypes.map((ending) => [ending.id, ending] as const))

  if (REDESIGNED_STORY.routes.map((route) => route.id).join('') !== 'ABCD') errors.push('routes must be A/B/C/D')

  for (const route of REDESIGNED_STORY.routes) {
    if (route.outcomes.length !== 3) errors.push(`${route.id} must have three outcomes`)
    for (const outcome of route.outcomes) {
      if (outcome.facts.length < 4) errors.push(`${outcome.id} does not establish enough decision facts`)
      if (/可能|也许|或许/.test(outcome.directResult)) errors.push(`${outcome.id} has uncertain direct result`)
      if (outcome.externalActor && outcome.id !== 'C3' && outcome.id !== 'D2') errors.push(`${outcome.id} introduces unsupported actor`)
      if (outcome.id === 'D2' && (outcome.finales.length !== 1 || outcome.finales[0].mode !== 'automatic')) errors.push('D2 must resolve automatically after accepted sale')
      if (outcome.id !== 'D2' && outcome.finales.length !== 3) errors.push(`${outcome.id} must have three route-specific finales`)
      if (new Set(outcome.finales.map((item) => item.label)).size !== outcome.finales.length) errors.push(`${outcome.id} repeats a finale choice`)
      for (const item of outcome.finales) {
        if (!item.id.startsWith(`${outcome.id}-`)) errors.push(`${item.id} does not belong to ${outcome.id}`)
        if (terminalIds.has(item.id)) errors.push(`${item.id} is duplicated`)
        if (videoPaths.has(item.video)) errors.push(`${item.video} is shared by multiple finales`)
        terminalIds.add(item.id)
        videoPaths.add(item.video)
        if (!endingIds.has(item.endingType)) errors.push(`${item.id} has unknown ending type`)
        if (item.requiredFacts.length < 2) errors.push(`${item.id} does not expose enough prerequisite facts`)
        if (item.finalState.length < 4) errors.push(`${item.id} does not define a complete final state`)
        if (!item.coursePoint.trim()) errors.push(`${item.id} lacks a strategic-management mapping`)
        if (/可能|也许|或许/.test(item.result)) errors.push(`${item.id} has uncertain result`)
        if (outcome.deadline === 'expired' && /赶路|登记|提交|抢/.test(`${item.label}${item.result}`)) errors.push(`${item.id} offers active filing after expiry`)
        for (const fact of item.requiredFacts) if (!outcome.facts.includes(fact)) errors.push(`${item.id} relies on unstated fact: ${fact}`)
      }
    }
  }

  const everyFinalStateMatches = (outcomeId: string, pattern: RegExp, message: string) => {
    const outcome = outcomeById.get(outcomeId)
    if (!outcome || !outcome.finales.every((item) => pattern.test(item.finalState.join('')))) errors.push(message)
  }

  everyFinalStateMatches('A1', /设备.*损失|设备能力.*下降/, 'A1 finales must retain the equipment loss')
  everyFinalStateMatches('B1', /受潮|样本覆盖|证据完整度/, 'B1 finales must retain the wet-sample limitation')
  everyFinalStateMatches('B3', /重型.*损失|重型设备.*留弃/, 'B3 finales must retain the abandoned-heavy-equipment loss')
  everyFinalStateMatches('C1', /样本有限|样本仍然有限/, 'C1 finales must retain the limited-sample constraint')
  everyFinalStateMatches('C3', /未来权益.*让渡/, 'C3 finales must retain the equity concession')
  everyFinalStateMatches('D3', /重型设备.*留弃/, 'D3 finales must retain the abandoned-heavy-equipment loss')

  for (const outcomeId of ['A3', 'B2', 'C2', 'D1']) {
    const outcome = outcomeById.get(outcomeId)
    if (!outcome || !outcome.finales.every((item) => item.finalState.includes('当前机会终止'))) errors.push(`${outcomeId} finales must keep the opportunity closed`)
  }

  for (const outcomeId of ['B1', 'C1']) {
    const outcome = outcomeById.get(outcomeId)
    if (!outcome || !outcome.finales.every((item) => item.endingType === 'F2')) errors.push(`${outcomeId} finales must remain costly registrations`)
  }

  if (outcomeById.get('A2')?.time !== '第4天 · 剩余10天') {
    errors.push('A2 必须是扎营后的第4天清晨，剩余10天')
  }

  if (/竞争者.*取得机会|机会已被竞争者取得/.test(JSON.stringify(outcomeById.get('D1')))) {
    errors.push('D1 不得宣称竞争者已经取得购买机会')
  }

  if (/样本/.test(JSON.stringify(outcomeById.get('D2')))) {
    errors.push('D2 的交易对象只能是完整勘探资料，不得包含实物样本')
  }

  const f5Definition = endingById.get('F5')?.definition ?? ''
  if (!f5Definition.includes('人员与可迁移能力优先') || f5Definition.includes('主动放弃')) {
    errors.push('F5 必须定义为人员与可迁移能力优先的安全撤离')
  }

  for (const [id, expectedStatus] of [
    ['A0', 'partial'],
    ['B0', 'partial'],
    ['C0', 'rebuild'],
    ['D0', 'rebuild'],
  ] as const) {
    if (situationById.get(id)?.status !== expectedStatus) {
      errors.push(`${id} 的制作状态必须是 ${expectedStatus}`)
    }
  }

  const storyText = JSON.stringify(REDESIGNED_STORY)
  if (/投票|随机决定|出售优先权|已拥有矿权|已经取得金矿|样本记录链|来源链|交接记录/.test(storyText)) errors.push('story contains a deprecated or unsupported rule')

  if (terminalIds.size !== 34) errors.push(`expected 34 terminal paths, received ${terminalIds.size}`)
  return errors
}
