import { presentNode } from './storyPresentation'
import { FINAL_NODES, type FinalBranch } from './finalStoryMap'
import { branchForDecisions, visibleOptions, type LatestDecision } from './latestStory'

// Teaching basis: FINAL/02_教师原案事实与改编边界.
// Selection evidence supports discussion, not a psychometric score or inferred motive.
export const STRATEGY_CONCEPTS = {
  goals: { title: '目标与权衡取舍', origin: '原案核心', definition: '先明确要实现什么、哪些底线不能突破，再比较方案。安全、速度与机会不能同时最大化；没有脱离目标的最佳路线。', transfer: '企业进入新市场前，也要先明确增长、现金安全与控制权的优先次序；只比较营收大小，会遗漏真正的战略约束。' },
  fit: { title: '环境、资源与能力的匹配', origin: '原案核心', definition: '方案是否可行，取决于外部条件与自身能力能否配合。天气属于环境，伤手、体力与队内分工属于执行条件；路线不变，可行性也会变。', transfer: '企业扩张时，市场需求再好，也要检查交付、人才和资金是否跟得上；战略目标必须有执行能力支撑。' },
  uncertainty: { title: '不确定性与决策质量', origin: '原案核心', definition: '选择时只能依据当时掌握的信息。一次好结果不能证明判断一定好，一次坏结果也不能单独证明判断差；要回看假设、证据和承担的风险。', transfer: '复盘投资或新品项目时，应保存立项时的判断依据，把可预见风险、执行问题和事后才知道的变化分开。' },
  irreversible: { title: '不可逆性与沉没成本', origin: '原案核心 · 体验延伸', definition: '已经耗掉的时间无法收回。继续深入会改变未来退出的成本，但“已经付出很多”本身不能证明还应继续；应比较从现在起的收益、风险与新增成本。', transfer: '项目超支后，过去已花的钱不能成为追加预算的充分理由；需要重新比较追加、缩小范围和退出的未来代价。' },
  timing: { title: '时间压力与战略调整', origin: '原案核心', definition: '时间是约束，调整也有时机。同样一次提速，较早执行可以分摊负担，较晚执行可能只剩高强度冲刺；今天可用的方案，明天未必还可用。', transfer: '订单交付出现偏差时，尽早调产能、范围或交期，通常比最后一天靠加班补救保留更多选择。' },
  information: { title: '信息价值与等待成本', origin: '体验延伸', definition: '信息的价值在于它能否改变行动。更完整的信息可能减少判断失误，却要付出等待时间；应事先明确等待什么证据、最晚等到何时。', transfer: '市场调研前写出：哪种发现会支持进入，哪种发现会支持退出。如果任何结果都不会改变行动，就要重新审视调研投入。' },
  adaptation: { title: '战略一致性与动态调整', origin: '课程联系 · 体验延伸', definition: '一致性是让行动服务于目标，不是永远重复同一个动作。外部条件或能力改变后，坚持与转向都需要新的依据；改变手段不必然等于放弃目标。', transfer: '原有渠道失效时，企业可以保留客户目标并更换渠道；也可能需要调整目标。关键是说明哪条原有假设不再成立。' },
  buffer: { title: '缓冲与未来选择空间', origin: '体验延伸', definition: '时间、体力和恢复余量让队伍能够应对下一次变化。缓冲不是闲置浪费；但保留缓冲也有机会成本，需要和目标一起权衡。', transfer: '排产、项目预算和交付承诺都需要余量。把资源用满可能提高眼前产出，也可能使下一次普通延误变成无法补救的危机。' },
} as const

type ConceptId = keyof typeof STRATEGY_CONCEPTS
type ChoiceTeaching = { concepts: ConceptId[]; observation: string; analysis: string; question: string }
const teaching = (concepts: ConceptId[], observation: string, analysis: string, question: string): ChoiceTeaching => ({ concepts, observation, analysis, question })

const CHOICE_TEACHING: Record<string, ChoiceTeaching> = {
  'P06-A': teaching(['goals', 'fit', 'uncertainty'], '你选择立即翻山，先争取较短的行程。', '山路通常更快，但暴风与伤手可能使它无法完成。这个选择把时间优势与更高的环境暴露绑定在一起。', '出发时，什么伤情或天气变化会让你停止翻山？'),
  'P06-B': teaching(['goals', 'fit', 'timing'], '你选择山谷，降低高地暴风和攀爬带来的暴露。', '谷地通常需要两到三周，十四天期限从一开始就很紧。过程较稳，并不等于能完成原目标。', '你如何检验“稳稳走完”和“按期完成”是否冲突？'),
  'P06-C': teaching(['information', 'goals', 'uncertainty'], '你先留在营地，等待天气信息。', '等待可减少盲目进入高地的风险，但每一天也在消耗返程时间。值得等多久，取决于新信息能改变什么决定。', '你期待得到什么信息？如果仍不能确定山口可通，何时停止等待？'),
  'P06-D': teaching(['goals', 'fit', 'buffer'], '你把等待天气好转、安全返回作为当前安排。', '原本的登记期限与长时间等待存在冲突。这个安排保护人员，也意味着主动降低原机会窗口的优先级。', '人员安全是你不可突破的底线，还是你愿意用其他收益交换的目标？'),
  'A2-1': teaching(['fit', 'irreversible', 'uncertainty'], '在风势增强、左手刚失力后，你仍选择继续推进。', '原来的身体与天气假设已经变弱。继续需要重新评估队伍能否承担后续动作，不能只沿用出发时的判断。', '继续的依据是前方仍值得争取，还是觉得已经走了三天不能白走？'),
  'A2-2': teaching(['buffer', 'adaptation', 'goals'], '你进入背风处，花时间等待最差天气过去。', '你调整了推进方式，但保留山路目标。两天等待既消耗期限余量，也为身体恢复和避开风势提供条件。', '你愿意最多等多久？到什么时间必须重新判断路线？'),
  'A2-3': teaching(['irreversible', 'adaptation', 'timing'], '你在第三天选择撤回，转走山谷。', '前面三天无法收回，山谷也不会重新从出发日计时。退出降低高地暴露，却需要接受路线变长的代价。', '如果从未走过这三天，你对现在的未来风险会作出同样判断吗？'),
  'A4-1': teaching(['irreversible', 'fit', 'uncertainty'], '到最后回头点，你选择按当前节奏继续。', '先前继续与暂避会留下不同的伤情和余量。此刻应看剩余路程能否完成，不能把“已经到这里”当作充分理由。', '哪条新证据足以推翻你继续推进的决定？'),
  'A4-2': teaching(['adaptation', 'buffer', 'goals'], '你保留山路路线，同时降低推进强度。', '路线目标和执行节奏可以分开调整。降速用时间换取可持续执行，是否合适要看剩余期限与身体条件。', '你怎样确定速度降到什么程度，仍能支持原目标？'),
  'A4-3': teaching(['irreversible', 'adaptation', 'timing'], '你在更深入山路后选择下撤转谷地。', '晚退出已经更贵，但这不能自动证明继续更好。需要比较从现在起两条路的风险，而不是设法追回已消耗的时间。', '撤回新增的时间成本，与继续的身体风险，哪个突破了你的底线？'),
  'B2-1': teaching(['timing', 'fit', 'buffer'], '第六天发现进度不足后，你开始每天多走一段。', '你在期限问题显现时调整执行。时间是靠减少休整与提高强度换来的，必须同时监测疲劳是否超过承受能力。', '如果疲劳继续增加，你准备在哪个复盘点停止提速？'),
  'B2-2': teaching(['fit', 'goals', 'timing'], '发现当前节奏很难赶上期限后，你仍保持可持续速度。', '这保留了人员恢复条件，也让期限压力继续积累。应明确这是主动重排目标，还是没有处理路径与目标的不匹配。', '此刻你仍把按期确认作为首要目标吗？如果是，靠什么追回差距？'),
  'B4A-1': teaching(['buffer', 'timing', 'uncertainty'], '已经连续提速后，你继续保持高强度。', '能继续走和能承受下一次延误不是一回事。把恢复余量继续投入赶路，会减少应对后续变化的空间。', '普通天气延误或伤情变化再发生一次，队伍还有什么补救手段？'),
  'B4A-2': teaching(['adaptation', 'goals', 'buffer'], '已经追回部分时间后，你把节奏降回可持续状态。', '停止透支体现了执行方式的调整，但前面换回的时间并不保证仍足够。需要明确愿意为人员恢复放弃多少期限机会。', '促使你降速的是哪个具体状态，而不是单纯的担心？'),
  'B4B-1': teaching(['timing', 'buffer', 'fit'], '你到第九天才开始最后冲刺。', '较晚提速的可用时间更短，往往需要更集中地消耗体力。相同的“加快速度”，在不同日期已经是不同的行动条件。', '若第六天就复盘期限，你会保留哪些今天已经失去的选择？'),
  'B4B-2': teaching(['goals', 'fit', 'timing'], '你继续按可持续节奏完成谷地行程。', '如果人员状态优先，这个选择有一致的目标基础；如果仍要求按期确认，就需要解释为何不改变已不足的速度。', '你接受了哪一个目标不再实现？这个取舍何时变得明确？'),
  'C2-1': teaching(['information', 'timing', 'uncertainty'], '确认暴风后，你再花一天等待山口判断。', '第一份信息解决的是“有无暴风”，还没有解决“山路能否通行”。继续等待应由剩余问题的行动价值支持。', '第三天的哪种消息会让你改变路线？'),
  'C2-2': teaching(['information', 'goals', 'timing'], '拿到暴风消息后，你停止等待并转向山谷。', '你不再为山口的进一步确定性支付时间。山谷降低高地暴露，但已经比直接走谷地晚了两天。', '为何当前信息已足够行动，而不值得再等一天？'),
  'C3-1': teaching(['information', 'fit', 'uncertainty'], '你依据第三天的判断进入山路。', '信息需要转成执行安排：先在低处推进，再随天气改善进入高处。判断更充分，也不能保证局部风势与伤情不再变化。', '你会持续监测哪些信号，检验这份判断是否仍成立？'),
  'C3-2': teaching(['information', 'irreversible', 'goals'], '你在等待三天后改走山谷。', '已花时间买过山路信息，不构成必须走山路的理由。信息支持放弃一个方案，也可能有价值，但等待成本已经发生。', '你买到的信息具体排除了什么风险？它是否值得三天时间？'),
  'C3-3': teaching(['goals', 'information', 'adaptation'], '你在获得进一步信息后停止争取原期限。', '信息可以支持进入，也可以支持退出。这里改变的是当前目标，应说清安全底线与机会成本，而不是只用通关或失败评价。', '哪一项证据使原机会不再值得承担风险？'),
  'C6-1': teaching(['adaptation', 'uncertainty', 'fit'], '现场风势比预想改善得慢，你仍按原计划推进。', '旧预测有参考价值，但不能替代现场观察。保持计划需要解释偏差为何仍在可接受范围内。', '风速、通行状况或伤情达到什么阈值，你才会改变计划？'),
  'C6-2': teaching(['adaptation', 'information', 'buffer'], '面对现场偏差，你放慢节奏并增加观察。', '你没有直接放弃山路，而是用时间换信息与反应余量。观察必须有结束条件，否则会持续侵蚀期限。', '下一次检查是什么时候？看到什么信号后恢复推进或退出？'),
  'C6-3': teaching(['adaptation', 'irreversible', 'information'], '面对新的现场情况，你停止高地推进并改路。', '为原判断付过时间，不代表必须永远服从它。但一次转向也不能自动证明判断能力高，需要补充新证据怎样改变了收益与风险。', '是哪条现场证据推翻了原判断？如果没有这条证据，你还会改路吗？'),
  'D3-1': teaching(['adaptation', 'goals', 'uncertainty'], '第五天天气出现改善窗口，你仍选择继续安全等待。', '如果安全底线仍未满足，保持安排可能是战略一致性；如果环境已满足底线却未重新评估，也可能是惯性。仅凭“没改决定”无法区分。', '第五天的新窗口为何仍不足以让你出发？请说出一条具体底线。'),
  'D3-2': teaching(['adaptation', 'timing', 'fit'], '第五天天气改善后，你反转原安排，重新走山路。', '天气和恢复状态变好了，期限却比出发时少了五天。同一条山路需要重新核算，不能照搬第一天的可行性。', '哪项变化支持反转？新的身体条件是否足以弥补已失去的时间？'),
  'D5-1': teaching(['buffer', 'timing', 'uncertainty'], '出现普通延误后，你仍保持较快节奏。', '前期等待压缩了时间，后期普通减速也会变得关键。继续赶路需要知道剩余余量究竟够承担什么变化。', '如果再延误半天，你的原计划还有补救空间吗？'),
  'D5-2': teaching(['adaptation', 'goals', 'buffer'], '反转上山后，你再次调整，降低赶路强度。', '新决定也不应变成新的束缚。根据身体状态再次调整可以成立，但必须明确接受它对期限造成的影响。', '哪项身体信号说明继续赶路已不再值得？'),
}

const ROUTE_LESSONS = {
  A: { title: '继续推进，何时应该停下来？', summary: '山路让你先获得时间优势，暴风与伤手随后改变了执行条件。复盘重点是：每次追加行动是否仍由未来收益支持，以及退出成本怎样随深入而变化。', concepts: ['fit', 'irreversible', 'adaptation', 'buffer'] as ConceptId[], scenario: '换成一个产品项目：已经投入半年，但核心交付能力下降，距离上市还有三周。', prompt: '你会继续、缩小范围还是停止？请只比较从现在起的投入与风险，并写出一个退出条件。' },
  B: { title: '过程很稳，为什么目标仍会落空？', summary: '谷地降低了高地暴露，但较长行程与期限冲突。复盘重点是：何时发现这种不匹配、怎样调整，以及追回时间消耗了哪些执行资源。', concepts: ['fit', 'timing', 'buffer', 'goals'] as ConceptId[], scenario: '换成一个订单项目：质量和生产都很稳定，但按现有产能，交付将比客户截止日期晚两天。', prompt: '你会何时调整产能、范围或交期？请同时说明调整成本和不可突破的质量底线。' },
  C: { title: '什么时候信息已经足够行动？', summary: '等待给了你更具体的天气判断，也消耗了期限。复盘重点是：每次追加信息能否改变行动，以及后来的现场证据是否足以更新旧判断。', concepts: ['information', 'uncertainty', 'adaptation', 'timing'] as ConceptId[], scenario: '换成一个新市场项目：再做一轮调研能降低不确定性，但会错过一个月的进入窗口。', prompt: '你要等到哪条证据才行动？请写出调研停止时间，以及一个足以改变原计划的发现。' },
  D: { title: '坚持原安排，是纪律还是惯性？', summary: '留在营地保护了身体，天气随后出现改善窗口。复盘重点是：目标和安全底线有没有改变，以及你是否依据新条件重新评估过行动。', concepts: ['goals', 'adaptation', 'fit', 'timing'] as ConceptId[], scenario: '换成一个扩张项目：企业原计划保留现金，后来市场需求回升，但融资窗口只剩十天。', prompt: '哪些现金与执行条件必须满足，你才会重新启动扩张？请区分“坚持安全底线”和“拒绝重新评估”。' },
}

export function reportPathTitle(branch: FinalBranch) {
  return branch.name.replace(/^[ABCD]/, '').replaceAll('→', ' → ')
}

export type ReportReflection = { priority: string; reason: string; trigger: string; transfer: string }
export const EMPTY_REFLECTION: ReportReflection = { priority: '', reason: '', trigger: '', transfer: '' }

export function buildLatestDecisionReport(decisions: LatestDecision[]) {
  const branch = branchForDecisions(decisions)
  if (!branch) throw new Error('路径尚未完成，无法生成最终报告')
  const route = ROUTE_LESSONS[branch.route as keyof typeof ROUTE_LESSONS]
  const decisionEvidence = decisions.map((decision, index) => {
    const node = FINAL_NODES.find((item) => item.options?.some((option) => option.id === decision.optionId))
    const option = node?.options?.find((item) => item.id === decision.optionId)
    const lesson = CHOICE_TEACHING[decision.optionId]
    if (!node || !option || !lesson) throw new Error('缺少选择对应的教学分析：' + decision.optionId)
    let known = presentNode(node.id, decisions.slice(0, index))?.node.facts ?? node.facts
    if (node.id === 'P06') known = '期权只剩十四天，需本人返回完成确认；翻山顺利通常七到十天，但可能遇暴风或伤手失力；谷地通常两到三周。两天后可确认是否有暴风，再等一天可进一步判断山路；此时仍不知道具体天气结果。'
    if (node.id === 'D03') known = '已在营地等了约五天，左手与体力有所恢复；风势减弱，出现短暂改善窗口，但山路仍非绝对安全，期限只剩约八天半。'
    const outcome = index === decisions.length - 1 ? `本局结局：${branch.completion}；${branch.people}。` : undefined
    return { reason: decision.reason?.trim() || '当时未填写', recordedAt: decision.recordedAt, optionId: option.id, stage: node.title, choice: option.label, known, cost: option.cost, ...lesson, outcome }
  })
  const conceptIds = [...new Set<ConceptId>(['goals', ...route.concepts])]
    .filter((id) => decisionEvidence.some((item) => item.concepts.includes(id)))
  const lessons = conceptIds.map((id) => ({
    id, ...STRATEGY_CONCEPTS[id],
    evidence: decisionEvidence.filter((item) => item.concepts.includes(id)).map((item) => ({
      optionId: item.optionId, choice: item.choice, observation: item.observation, analysis: item.analysis,
    })),
  }))
  // Compare only an available alternative at the last decision, with the same prior history.
  const last = decisions.at(-1)!
  const lastNode = FINAL_NODES.find((item) => item.options?.some((option) => option.id === last.optionId))!
  const alternatives = visibleOptions(lastNode, decisions.slice(0, -1))
    .filter((option) => option.id !== last.optionId)
    .flatMap((option) => {
      const alternate = branchForDecisions([...decisions.slice(0, -1), { nodeId: lastNode.id, optionId: option.id, label: option.label }])
      return alternate ? [{ choice: option.label, completion: alternate.completion, people: alternate.people, tradeoff: alternate.tradeoff }] : []
    })
  return {
    branchId: branch.id, pathKey: decisions.map((d) => d.optionId).join('|'), pathTitle: reportPathTitle(branch),
    title: route.title, summary: route.summary, branch, decisionEvidence, lessons, alternatives,
    profile: {
      observations: decisionEvidence.map((item) => item.observation),
      boundary: decisions.some(d => d.reason?.trim()) ? '行动与选择前填写的理由用于课堂讨论；未填写的理由保持空缺，事后补充与当时记录分别呈现，不换算人格标签或能力分数。' : '这些是本局可观察的行动。系统没有记录你当时的理由，不能据此判定你是保守、激进、理性或僵化，也不能换算成战略能力分数。',
    },
    evaluation: branch.deadline === '按期'
      ? '本局按期完成，说明这条路径在本次剧情条件下兑现了期限目标。它不能证明所有同类情境都应该选这条路；仍要检查风险、身体代价和当时依据。'
      : branch.deadline === '主动放弃'
        ? '本局没有兑现原期限目标。若安全是首要目标，应检验人员保护是否兑现；若期限仍是首要目标，就要解释为何继续采用与它冲突的安排。目标取舍本身需要说明。'
        : '本局未在期限内完成。要区分主动接受时间代价、发现偏差后调整太晚，以及当时无法预见的变化；不能只凭超期就给决策能力下结论。',
    scenario: route.scenario, transferPrompt: route.prompt,
    disclaimer: '复盘依据本局选择与剧情结果。具体到达日期来自互动改编，不是教师原案给定的必然结果；未提供理由的部分留给讨论，不做人格评级。',
  }
}

export type LatestDecisionReport = ReturnType<typeof buildLatestDecisionReport>

export function exportLatestReport(report: LatestDecisionReport, reflection: ReportReflection) {
  const answer = (value: string) => value.trim() || '尚未填写'
  return [
    '# 最后十四天 · 战略管理学习复盘', report.pathTitle,
    `本局结局：${report.branch.completion}；${report.branch.deadline}；${report.branch.people}`,
    report.summary, report.evaluation, '## 选择与判断',
    ...report.decisionEvidence.map((item, i) => `### ${i + 1}. ${item.choice}\n当时信息：${item.known}\n选择前记录：${item.reason}\n行动观察：${item.observation}\n战略分析：${item.analysis}\n追问：${item.question}`),
    '## 战略管理知识联系',
    ...report.lessons.map((lesson) => `### ${lesson.title}\n${lesson.definition}\n本局证据：${lesson.evidence.map(e => e.observation).join('')}\n企业应用：${lesson.transfer}`),
    '## 我的复盘', `优先目标：${answer(reflection.priority)}`, `事后复盘理由：${answer(reflection.reason)}`,
    `调整条件：${answer(reflection.trigger)}`, `迁移情境：${report.scenario}\n${report.transferPrompt}\n我的回答：${answer(reflection.transfer)}`,
    report.disclaimer,
  ].join('\n\n')
}
