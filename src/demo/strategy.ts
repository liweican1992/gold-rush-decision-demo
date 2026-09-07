export type ObjectiveState = {
  time_remaining: number
  health: number
  execution: number
  information: number
  control: number
  capital_recovery: number
}

export type ProfileDimension = 'O' | 'R' | 'I' | 'C' | 'E'
export type ProfileEvidence = Record<ProfileDimension, number>
export type CommitmentMode = 'independent' | 'staged_alliance' | 'sale_negotiation' | null
export type EndingOutcomeId = `END-F${1 | 2 | 3 | 4 | 5 | 6}`

export type DecisionDefinition = {
  id: string
  label: string
  directGoal: string
  sacrifice: string
  knowledge: string
  evidenceText: string
  effects?: Partial<ObjectiveState>
  flags?: string[]
  commitmentMode?: Exclude<CommitmentMode, null>
  profile: ProfileEvidence
}

export type DecisionEvidenceRecord = DecisionDefinition & {
  order: number
  decision_index: number
  node_id: string
  option_id: string
  knowledge_point_ids: string[]
  direct_goal: string
  required_sacrifice: string
  state_before: ObjectiveState
  state_delta: Partial<ObjectiveState>
  state_after: ObjectiveState
  profile_evidence: ProfileEvidence
  evidence_text: string
  timestamp: string
}

export type StrategyProgress = {
  objective: ObjectiveState
  flags: string[]
  commitmentMode: CommitmentMode
  evidence: DecisionEvidenceRecord[]
}

const zeroProfile = (values: Partial<ProfileEvidence>): ProfileEvidence => ({ O: 0, R: 0, I: 0, C: 0, E: 0, ...values })

function decision(
  id: string,
  label: string,
  effects: Partial<ObjectiveState>,
  flags: string[],
  profile: Partial<ProfileEvidence>,
  knowledge: string,
  directGoal: string,
  sacrifice: string,
  evidenceText: string,
  commitmentMode?: Exclude<CommitmentMode, null>,
): DecisionDefinition {
  return { id, label, effects, flags, profile: zeroProfile(profile), knowledge, directGoal, sacrifice, evidenceText, commitmentMode }
}

export const INITIAL_OBJECTIVE_STATE: ObjectiveState = {
  time_remaining: 14,
  health: 72,
  execution: 82,
  information: 75,
  control: 65,
  capital_recovery: 0,
}

export const INITIAL_STRATEGY_PROGRESS: StrategyProgress = {
  objective: INITIAL_OBJECTIVE_STATE,
  flags: [],
  commitmentMode: null,
  evidence: [],
}

export const DECISION_DEFINITIONS: Record<string, DecisionDefinition> = Object.fromEntries([
  decision('A', '立即翻山', { time_remaining: -3, health: -8, execution: -5 }, ['route:A'], { O: 2, R: -1, I: -1 }, '环境与资源匹配；速度—风险权衡', '尽快抵达登记窗口', '暴露于天气和伤情风险', '优先抢占路线速度，同时接受暴风与伤势暴露。'),
  decision('B', '改走山谷', { time_remaining: -6, health: -2, execution: -5 }, ['route:B'], { O: -1, R: 2 }, '定位与风险—期限权衡', '降低翻山的人员风险', '用更多时间换取较低的即时风险', '选择较低风险路线，并接受期限压力上升。'),
  decision('C', '等待48小时预报', { time_remaining: -2, health: 5, information: 15 }, ['route:C', 'weatherValidated'], { O: -1, R: 1, I: 2 }, '信息价值与延迟承诺', '购买更可靠的天气信息', '先消耗两天登记窗口', '先获取关键信息，再决定路线承诺。'),
  decision('D', '等待3—4周后安全撤离', { time_remaining: -6, health: 8 }, ['route:D', 'offerReceived'], { O: -2, R: 2, I: 1, E: 2 }, '退出纪律与能力保存', '优先保存人员和团队能力', '主动放弃当前登记窗口', '把人员安全和退出纪律置于机会窗口之前。'),

  decision('A1', '继续冲过山口', { time_remaining: -5, health: -25, execution: -22 }, ['injurySevere', 'equipmentLost'], { O: 2, R: -2, I: -1, E: -1 }, '承诺升级与不可逆风险', '及时越过山口', '伤势加重并丢失部分设备', '继续加码速度，用伤势和设备损失换取窗口。'),
  decision('A2', '原地扎营等待一天', { time_remaining: -6, health: 8, execution: -5 }, ['bufferUsed'], { O: -1, R: 2, I: 1 }, '战略缓冲与机会成本', '保住人员和设备', '时间优势明显缩小', '使用缓冲降低即时风险，同时压缩后续余量。'),
  decision('A3', '撤回并转走山谷', { time_remaining: -11, health: 2, execution: -8, control: -15 }, ['reversedStrategy', 'late'], { O: -1, R: 1, E: 2 }, '战略反转与转换成本', '降低山脊即时风险', '前三天投入无法收回并最终超期', '在风险变化后反转路线，并承担转换成本。'),
  decision('B1', '立即涉水强渡', { time_remaining: -5, health: -12, execution: -10, information: -30 }, ['sampleWet'], { O: 2, R: -1, I: -1, E: -1 }, '局部最优与系统后果', '在截止日前抵达', '样本和补给受潮', '用涉水风险换回时间，但削弱证据完整性。'),
  decision('B2', '沿山谷绕行', { time_remaining: -8, health: 3, control: -20 }, ['late'], { O: -2, R: 2, E: 1 }, '执行安全与目标失配', '确保人员和设备安全', '绕行导致超过登记期限', '把沿途风险降到最低，但失去时间窗口。'),
  decision('B3', '丢弃重型设备轻装过桥', { time_remaining: -4, health: -5, execution: -35 }, ['heavyGearAbandoned'], { O: 2, R: -1, C: 1 }, '资源取舍与动态能力', '在期限内完成登记', '后续开采能力受损', '重构资源组合，用长期能力换取短期可行性。'),
  decision('C1', '抢在封山前轻装翻山', { time_remaining: -7, health: -15, execution: -25, information: -15 }, ['lightMountain'], { O: 2, R: -1, I: 1, E: -1 }, '信息转化为行动', '利用天气窗口及时登记', '携带样本有限', '把预报信息转化为快速行动，但牺牲样本基础。'),
  decision('C2', '根据预报改走山谷', { time_remaining: -12, health: 2, execution: -5, information: 5, control: -20 }, ['late'], { O: -1, R: 2, I: 1, E: 1 }, '预测准确与战略可行性', '正确避开暴风', '等待叠加山谷路线导致超期', '准确识别风险，但路线仍无法满足期限。'),
  decision('C3', '引入当地运输伙伴', { time_remaining: -5, health: -3, execution: 12, control: -18 }, ['partnerPresent', 'acceptedControlDilution'], { O: 1, R: 1, I: 1, C: 2 }, '战略联盟与资源互补', '获得雪地运输能力并按时抵达', '让渡部分控制权', '用合作补齐能力瓶颈，同时重分配控制权。'),
  decision('D1', '坚持等待并安全撤离', { time_remaining: -8, health: 10, execution: 5, control: -35 }, ['withdrawalPrepared', 'late'], { O: -2, R: 2, E: 2 }, '退出纪律与能力保存', '安全离开并保全设备', '土地和矿区机会被竞争者取得', '继续执行安全退出方案，接受机会转移。'),
  decision('D2', '出售勘探资料并退出', { time_remaining: -1, health: 2, control: -20, capital_recovery: 55 }, ['offerAcceptedPreliminary'], { O: -1, R: 2, I: 1, C: 1, E: 2 }, '退出战略与资本回收', '回收大部分前期投入', '放弃矿区控制权和未来上涨收益', '把不确定机会转化为可回收资本。'),
  decision('D3', '取消撤离，轻装抢登记', { time_remaining: -8, health: -20, execution: -40, information: -5 }, ['heavyGearAbandoned', 'reversedStrategy', 'late'], { O: 2, R: -2, C: 1, E: 2 }, '战略反转与转换成本', '重新争取登记机会', '设备、补给和调整缓冲几乎耗尽', '反转退出决定，用剩余能力争取最后窗口。'),

  decision('X1-PEOPLE', '先照顾队员并重新分工', { time_remaining: -1, health: 15, execution: 3 }, ['peopleStabilized'], { O: -1, R: 2, C: 1 }, '资源基础观；战略取舍与机会成本', '保护团队持续行动能力', '用一天时间换取人员稳定', '优先保护团队持续行动能力，愿意用时间换取人员稳定。'),
  decision('X1-EVIDENCE', '先整理并保护样本', { time_remaining: -1, health: -2, execution: -3, information: 20 }, ['evidenceProtected'], { O: -1, R: 1, I: 2 }, '资源基础观；战略取舍与机会成本', '提高证据可靠性', '人员和执行问题暂不处理', '优先提高信息质量，为后续判断保留可靠依据。'),
  decision('X1-CAPABILITY', '先修好运载工具', { time_remaining: -1, health: -5, execution: 20 }, ['transportRestored'], { R: 1, C: 2 }, '资源基础观；战略取舍与机会成本', '恢复执行能力', '人员和样本问题暂不处理', '优先恢复执行能力，重视方案能否真正落地。'),
  decision('X1-SPRINT', '不处理，立即赶路', { health: -10, execution: -8, information: -5 }, ['sprinted'], { O: 2, R: -1, I: -1, E: -1 }, '战略取舍；时间窗口与风险承受', '抢占时间窗口', '未解决问题继续累积', '优先抢占时间窗口，同时接受未解决问题继续累积。'),

  decision('X2-INDEPENDENT', '拒绝外部方案，独立推进', { time_remaining: -1, execution: -8, control: 10 }, ['independent'], { O: 1, R: -1, C: -2, E: -1 }, '控制权与可行性的交换', '保留独立控制权', '自行承担能力缺口', '拒绝外部方案，优先保留独立控制，同时接受能力缺口继续由团队承担。', 'independent'),
  decision('X2-STAGED-ALLIANCE', '签署分阶段合作', { time_remaining: -1, execution: 15, information: 5, control: -18, capital_recovery: 10 }, ['partnerPresent', 'jointOption'], { O: 1, R: 1, I: 1, C: 2 }, '控制权与可行性；战略联盟与资源互补', '用外部能力提高可行性', '让渡部分控制权和未来收益', '用阶段合作重构资源，愿意用部分控制权换取执行能力和复核机会。', 'staged_alliance'),
  decision('X2-SALE-NEGOTIATION', '进入交易尽调', { time_remaining: -1, control: -35, capital_recovery: 45 }, ['saleNegotiation'], { O: -1, R: 1, I: 1, E: 2 }, '控制权与可行性；退出战略与机会成本', '提高资本回收确定性', '降低未来上行和独立控制潜力', '先进入核验而非立即成交，以未来上行为代价提高退出与回收的确定性。', 'sale_negotiation'),

  decision('X3-SUBMIT-NOW', '按现状立即提交', {}, ['submitted'], { O: 2, R: -1, I: -1, E: -1 }, '不可逆承诺与速度', '锁定期限内动作', '接受当前信息和执行能力缺口', '在仍有窗口时立即提交，优先锁定行动并接受现有缺口。'),
  decision('X3-VERIFY-SUBMIT', '再核验一天后提交', { time_remaining: -1, information: 15 }, ['submitted', 'finalVerified'], { R: 1, I: 2 }, '信息驱动与延迟承诺', '提高证据可靠性后提交', '使用最后一天时间缓冲', '用最后一段时间提高证据可靠性，并把核验与提交作为同一个动作。'),
  decision('X3-JOINT-SUBMIT', '与伙伴联合提交', { execution: 5, control: -10 }, ['submitted', 'jointSubmission'], { O: 1, R: 1, I: 1, C: 2 }, '协同执行与价值分配', '依托伙伴能力完成共同提交', '进一步分享控制权', '把阶段合作推进到联合执行，用控制空间换取落地能力。'),
  decision('X3-FINALIZE-SALE', '完成交易并退出', { control: -100, capital_recovery: 25 }, ['saleFinalized'], { O: -1, R: 2, I: 1, E: 2 }, '退出纪律与机会成本', '锁定资本回收并退出', '放弃未来上行与独立控制', '在核验后完成退出，用未来上行换取资本回收确定性。'),
  decision('X3-LATE-FILE', '提交逾期材料并申请审查', { control: -10 }, ['lateFiled'], { O: 1, R: -1, E: 1 }, '竞争压力与战略反转', '保留有限程序机会', '承认原有时间优势已经失去', '承认窗口变化并切换到补充审查路径。'),
  decision('X3-SAFE-WITHDRAW', '停止追加投入，安全撤离', { health: 5 }, ['withdrewFinal'], { O: -2, R: 2, I: 1, E: 2 }, '止损、韧性与退出纪律', '保存人员与剩余资料', '放弃本轮登记与控制窗口', '停止追加承诺，优先保存人员、资料和未来行动能力。'),
].map((item) => [item.id, item]))

const KNOWLEDGE_POINT_IDS_BY_DECISION: Record<string, string[]> = {
  A: ['ENVIRONMENT_RESOURCE_FIT', 'SPEED_RISK_TRADEOFF'],
  B: ['POSITIONING', 'RISK_DEADLINE_TRADEOFF'],
  C: ['VALUE_OF_INFORMATION', 'DELAYED_COMMITMENT'],
  D: ['EXIT_DISCIPLINE', 'CAPABILITY_PRESERVATION'],
  A1: ['COMMITMENT_ESCALATION', 'IRREVERSIBLE_RISK'],
  A2: ['STRATEGIC_BUFFER', 'OPPORTUNITY_COST'],
  A3: ['STRATEGIC_REVERSAL', 'SWITCHING_COST'],
  B1: ['LOCAL_OPTIMUM', 'SYSTEM_CONSEQUENCE'],
  B2: ['EXECUTION_SAFETY', 'GOAL_MISFIT'],
  B3: ['TRADE_OFF', 'DYNAMIC_CAPABILITIES'],
  C1: ['INFORMATION_TO_ACTION'],
  C2: ['FORECAST_ACCURACY', 'STRATEGIC_FEASIBILITY'],
  C3: ['STRATEGIC_ALLIANCE', 'RESOURCE_COMPLEMENTARITY'],
  D1: ['EXIT_DISCIPLINE', 'CAPABILITY_PRESERVATION'],
  D2: ['EXIT_STRATEGY', 'CAPITAL_RECOVERY'],
  D3: ['STRATEGIC_REVERSAL', 'SWITCHING_COST'],
  'X1-PEOPLE': ['RBV', 'TRADE_OFF'],
  'X1-EVIDENCE': ['RBV', 'TRADE_OFF'],
  'X1-CAPABILITY': ['RBV', 'TRADE_OFF'],
  'X1-SPRINT': ['TRADE_OFF', 'TIME_WINDOW'],
  'X2-INDEPENDENT': ['CONTROL_FEASIBILITY'],
  'X2-STAGED-ALLIANCE': ['CONTROL_FEASIBILITY', 'STRATEGIC_ALLIANCE'],
  'X2-SALE-NEGOTIATION': ['CONTROL_FEASIBILITY', 'EXIT_OPTION'],
  'X3-SUBMIT-NOW': ['IRREVERSIBLE_COMMITMENT', 'TIME_WINDOW'],
  'X3-VERIFY-SUBMIT': ['VALUE_OF_INFORMATION', 'DELAYED_COMMITMENT'],
  'X3-JOINT-SUBMIT': ['COORDINATED_EXECUTION', 'VALUE_DISTRIBUTION'],
  'X3-FINALIZE-SALE': ['EXIT_DISCIPLINE', 'OPPORTUNITY_COST'],
  'X3-LATE-FILE': ['COMPETITIVE_PRESSURE', 'STRATEGIC_REVERSAL'],
  'X3-SAFE-WITHDRAW': ['LOSS_CUTTING', 'RESILIENCE', 'EXIT_DISCIPLINE'],
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

function decisionNodeId(decisionId: string) {
  if (/^[A-D]$/.test(decisionId)) return 'P0'
  if (/^[A-D][1-3]$/.test(decisionId)) return `${decisionId[0]}0`
  if (decisionId.startsWith('X1-')) return 'X1'
  if (decisionId.startsWith('X2-')) return 'X2'
  if (decisionId.startsWith('X3-')) return 'X3'
  return decisionId
}

export function applyDecision(progress: StrategyProgress, decisionId: string, timestamp = new Date().toISOString()): StrategyProgress {
  const rule = DECISION_DEFINITIONS[decisionId]
  if (!rule || progress.evidence.some((item) => item.id === decisionId)) return progress
  const effects = rule.effects ?? {}
  const objective = { ...progress.objective }
  for (const key of Object.keys(objective) as Array<keyof ObjectiveState>) {
    const next = objective[key] + (effects[key] ?? 0)
    objective[key] = key === 'time_remaining' ? Math.max(0, next) : clamp(next)
  }
  const decisionIndex = progress.evidence.length + 1
  const stateBefore = { ...progress.objective }
  const stateAfter = { ...objective }
  const stateDelta = Object.fromEntries(
    (Object.keys(objective) as Array<keyof ObjectiveState>)
      .map((key) => [key, stateAfter[key] - stateBefore[key]] as const)
      .filter(([, value]) => value !== 0),
  ) as Partial<ObjectiveState>
  return {
    objective,
    flags: Array.from(new Set([...progress.flags, ...(rule.flags ?? [])])),
    commitmentMode: rule.commitmentMode ?? progress.commitmentMode,
    evidence: [...progress.evidence, {
      ...rule,
      order: decisionIndex,
      decision_index: decisionIndex,
      node_id: decisionNodeId(decisionId),
      option_id: decisionId,
      knowledge_point_ids: KNOWLEDGE_POINT_IDS_BY_DECISION[decisionId] ?? [],
      direct_goal: rule.directGoal,
      required_sacrifice: rule.sacrifice,
      state_before: stateBefore,
      state_delta: stateDelta,
      state_after: stateAfter,
      profile_evidence: { ...rule.profile },
      evidence_text: rule.evidenceText,
      timestamp,
    }],
  }
}

export function replayDecisions(decisionIds: string[]) {
  return decisionIds.reduce(
    (progress, decisionId, index) => applyDecision(progress, decisionId, new Date(index * 1000).toISOString()),
    INITIAL_STRATEGY_PROGRESS,
  )
}

export function getAvailableX3Options(progress: StrategyProgress) {
  const { time_remaining, control } = progress.objective
  const optionIds: string[] = []
  if (time_remaining > 0 && control > 0) optionIds.push('X3-SUBMIT-NOW')
  if (time_remaining >= 1 && control > 0) optionIds.push('X3-VERIFY-SUBMIT')
  if (progress.commitmentMode === 'staged_alliance' && time_remaining > 0 && control > 0) optionIds.push('X3-JOINT-SUBMIT')
  if (progress.commitmentMode === 'sale_negotiation') optionIds.push('X3-FINALIZE-SALE')
  if (time_remaining <= 0 && control > 0) optionIds.push('X3-LATE-FILE')
  optionIds.push('X3-SAFE-WITHDRAW')
  return optionIds.map((id) => DECISION_DEFINITIONS[id])
}

export const ENDING_OUTCOMES: Record<EndingOutcomeId, { name: string; result: string; knowledge: string }> = {
  'END-F1': { name: '强基础提交', result: '期限内提交；证据、执行与独立控制基础较强。', knowledge: '环境—资源匹配' },
  'END-F2': { name: '脆弱提交', result: '期限内进入流程；至少一项关键基础仍然脆弱。', knowledge: '战略与执行能力一致性' },
  'END-F3': { name: '受限控制提交', result: '材料进入流程，但合作安排或既有承诺使独立控制空间受限。', knowledge: '联盟协同与价值分配' },
  'END-F4': { name: '资本回收退出', result: '回收大部分可回收资本；放弃未来上行与独立控制。', knowledge: '退出战略与机会成本' },
  'END-F5': { name: '安全撤离保留资料', result: '人员与资料优先；错过本轮权利窗口。', knowledge: '韧性、止损与能力保存' },
  'END-F6': { name: '窗口关闭', result: '进入公开竞争或补充审查；原有时间优势消失。', knowledge: '期限、竞争与不可逆性' },
}

export function resolveEnding(progress: StrategyProgress): EndingOutcomeId | null {
  const has = (flag: string) => progress.flags.includes(flag)
  if (has('saleFinalized')) return 'END-F4'
  if (has('withdrewFinal')) return 'END-F5'
  if (has('lateFiled') || (progress.objective.time_remaining <= 0 && !has('submitted'))) return 'END-F6'
  if (has('submitted') && (has('jointSubmission') || progress.objective.control < 55)) return 'END-F3'
  if (has('submitted') && progress.objective.information >= 70 && progress.objective.execution >= 45 && progress.objective.health >= 40 && progress.objective.control >= 55) return 'END-F1'
  if (has('submitted')) return 'END-F2'
  return null
}

export const PROFILE_DIMENSIONS: Record<ProfileDimension, string> = {
  O: '机会与速度', R: '风险与韧性', I: '信息驱动与延迟承诺', C: '资源重构与协作', E: '退出纪律与战略反转',
}

export type StrategyReport = {
  outcome: EndingOutcomeId | null
  validDecisionCount: number
  confidence: '高' | '中' | '低'
  profileScores: Record<ProfileDimension, number>
  primaryStyle: string
  summary: string
  supportingEvidence: string[]
  counterEvidence: string[]
  knowledgeReplay: Array<{
    nodeId: string
    choice: string
    knowledge: string
    goal: string
    sacrifice: string
    choiceConnection: string
    profileEvidence: ProfileEvidence
  }>
  reflectionQuestions: string[]
}

export function buildStrategyReport(progress: StrategyProgress): StrategyReport {
  const validDecisionCount = progress.evidence.length
  const sums = Object.fromEntries((Object.keys(PROFILE_DIMENSIONS) as ProfileDimension[]).map((dimension) => [
    dimension,
    progress.evidence.reduce((sum, item) => sum + item.profile[dimension], 0),
  ])) as Record<ProfileDimension, number>
  const profileScores = Object.fromEntries((Object.keys(PROFILE_DIMENSIONS) as ProfileDimension[]).map((dimension) => [
    dimension,
    validDecisionCount === 0 ? 50 : Math.round(((sums[dimension] + 2 * validDecisionCount) / (4 * validDecisionCount)) * 100),
  ])) as Record<ProfileDimension, number>
  const ranked = (Object.keys(PROFILE_DIMENSIONS) as ProfileDimension[]).sort((a, b) => profileScores[b] - profileScores[a])
  const primary = ranked[0]
  const supportingEvidence = progress.evidence.filter((item) => item.profile[primary] > 0).map((item) => `${item.label}：${item.evidenceText}`)
  const directCounterEvidence = progress.evidence.filter((item) => item.profile[primary] < 0)
  const counterDimensions = ranked.slice(1).filter((dimension) => progress.evidence.some((item) => item.profile[dimension] > 0))
  const counter = counterDimensions.find((dimension) => directCounterEvidence.some((item) => item.profile[dimension] > 0))
    ?? counterDimensions[0]
    ?? ranked[1]
  const directCounterRecords = directCounterEvidence.filter((item) => item.profile[counter] > 0)
  const counterEvidenceRecords = directCounterRecords.length > 0
    ? directCounterRecords.slice(0, 2)
    : progress.evidence.filter((item) => item.profile[counter] > 0).slice(0, 2)
  const counterEvidence = counterEvidenceRecords.map((item) => `${item.label}：${item.evidenceText}`)
  const nonZeroDimensions = ranked.filter((dimension) => sums[dimension] !== 0).length
  const primarySignals = progress.evidence.map((item) => item.profile[primary]).filter((signal) => signal !== 0)
  const primaryDirection = Math.sign(sums[primary])
  const primaryDirectionConsistent = primarySignals.length > 0
    && primarySignals.every((signal) => Math.sign(signal) === primaryDirection)
  const hasClearCounterChoice = !primaryDirectionConsistent || directCounterEvidence.length > 0
  const confidence: StrategyReport['confidence'] = validDecisionCount === 5 && nonZeroDimensions >= 4 && primaryDirectionConsistent
    ? '高'
    : validDecisionCount >= 4 && validDecisionCount <= 5 && (nonZeroDimensions >= 3 || hasClearCounterChoice)
      ? '中'
      : '低'
  const counterContext = counterEvidenceRecords[0]?.label
  return {
    outcome: resolveEnding(progress),
    validDecisionCount,
    confidence,
    profileScores,
    primaryStyle: PROFILE_DIMENSIONS[primary],
    summary: counterContext
      ? `在本局情境中，你更常优先考虑${PROFILE_DIMENSIONS[primary]}，同时在“${counterContext}”中表现出${PROFILE_DIMENSIONS[counter]}。这说明你的选择会随资源、期限和可逆性变化。`
      : `在本局情境中，你更常优先考虑${PROFILE_DIMENSIONS[primary]}。本轮没有形成足够明确的反向证据，因此不推断第二倾向。`,
    supportingEvidence,
    counterEvidence,
    knowledgeReplay: progress.evidence.map((item) => ({
      nodeId: item.node_id,
      choice: item.label,
      knowledge: item.knowledge,
      goal: item.directGoal,
      sacrifice: item.sacrifice,
      choiceConnection: item.evidence_text,
      profileEvidence: item.profile_evidence,
    })),
    reflectionQuestions: [
      '如果只改变一个外部条件，你最可能改掉哪次选择？',
      '哪一次选择的机会成本在当时最容易被忽略？',
      '你的最终结果主要由早期路径、资源状态还是最后承诺推动？',
    ],
  }
}
