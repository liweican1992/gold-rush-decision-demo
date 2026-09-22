// Source: 最后十四天_完整剧情修订稿_2026-09-09.md. Director review only; not the playable game.
export type EndingId = 'E1' | 'E2' | 'E3' | 'E4'
export type SId = 'S1' | 'S2' | 'S3' | 'S4'
export type IId = 'I1' | 'I2'
export type XId = 'X1' | 'X2' | 'X3'
export type Arrival = { id: string; route: string; chain: string; label: string; arrival: string; completed?: string; completedHour?: number; budget?: number; state: string; knowledge: string }
export const arrivals: Arrival[] = [
  { id: 'A1', route: 'A', chain: '立即翻山 → D3继续按可通过线路推进', label: '继续推进', arrival: 'D9 15:00', completed: 'D9 17:00', completedHour: 9 * 24 + 8, budget: 58, state: 'D5越岭；伤势加重、照护负担高。购地后的100BU划出行程12和必须保留的照护休整30；伤势加重，返回后仍需持续照护，这部分不能挪作评估投入。', knowledge: '能力约束、承诺代价；赶上期限不证明事前判断必然正确。' },
  { id: 'A2', route: 'A', chain: '立即翻山 → D3背风避险两天', label: '背风避险两天', arrival: 'D11 15:00', completed: 'D11 17:00', completedHour: 11 * 24 + 8, budget: 70, state: 'D5风势下降再行动、D7越岭；伤手稳定，消耗两天缓冲。行程10、必须保留储备20。', knowledge: '战略缓冲、监控与调整；等待并非免费。' },
  { id: 'A3', route: 'A', chain: '立即翻山 → D3折返营地 → 山谷返程', label: '折返后走山谷', arrival: 'D21 15:00', state: 'D3折返，两天回营地，再走16天山谷。撤离风险降低，时间不可恢复。', knowledge: '策略调整、不可逆时间成本。' },
  { id: 'B1', route: 'B', chain: '立即走山谷 → D7延长每日行进', label: '延长每日行进', arrival: 'D14 06:00', completed: 'D14 08:30', completedHour: 14 * 24 - 0.5, budget: 67, state: '仅早于截止30分钟；团队明显疲劳，无危险强渡或突然捷径。行程8、必须保留储备25。', knowledge: '执行计划、目标与能力匹配；成功不等于没有风险。' },
  { id: 'B2', route: 'B', chain: '立即走山谷 → D7维持可持续节奏', label: '维持原节奏', arrival: 'D16 15:00', state: '已走7天，再走9天；主动接受超期，保留休息。', knowledge: '目标取舍；区分主动接受代价和未算清进度。' },
  { id: 'V1', route: 'C', chain: '等两天天气 → C1再等一天 → V1走已确认通行的山路', label: '确认通行后翻山', arrival: 'D12 15:00', completed: 'D12 17:00', completedHour: 12 * 24 + 8, budget: 70, state: 'D3出发，风暴时仍在低处，D8越岭；伤手稳定、略疲劳。行程10、必须保留储备20。', knowledge: '信息价值、环境扫描与行动匹配；信息花掉三天时间。' },
  { id: 'V2', route: 'C', chain: '等两天天气 → C1再等一天 → V2改走山谷', label: '确认通行仍走山谷', arrival: 'D19 15:00', state: 'D3出发再走16天；知道山路可通行，仍接受超期。', knowledge: '外部机会与自身条件不同；通行不等于必须选择。' },
  { id: 'V3', route: 'C', chain: '等两天天气 → C1再等一天 → V3继续等天气稳定', label: '通行公告后继续等待', arrival: 'D40 15:00', state: '共同等待到D24，再走16天；不从D3重新追加24天。', knowledge: '价值排序、目标一致性；期限损失明确。' },
  { id: 'C2', route: 'C', chain: '等两天天气 → C2现在走山谷', label: 'D2转走山谷', arrival: 'D18 15:00', state: 'D2出发再走16天；即使按最快14天，也已无法赶上。', knowledge: '信息成本、剩余可行方案。' },
  { id: 'C3', route: 'C', chain: '等两天天气 → C3等天气稳定', label: 'D2转为长期等待', arrival: 'D40 15:00', state: '已等的两天计入总等待；D24出发，16天后到镇。', knowledge: '目标调整、机会成本。' },
  { id: 'D', route: 'D', chain: '等待3—4周 → D24出发 → 山谷返程', label: '等待稳定后返回', arrival: 'D40 15:00', state: '有季节性储备支持等待；D24才出发，D40才返回。原购买窗口已失。', knowledge: '目标与底线取舍；一次选择不足以形成全面画像。' },
]
export const endings: { id: EndingId; title: string; scene: string; limit: string }[] = [
  { id: 'E1', title: '原购买窗口失去', scene: '四人在基地重聚，购买文件的截止日已经过去。原购买期权已到期，土地后续处置尚不确定。', limit: '不演成别人已经买走；能否重新谈、价格如何均无保证。已有记录、经验与信息仍保留，但不自动变成出售收入或新的购买权利。没有进入真实第二幕。' },
  { id: 'E2', title: '购买手续完成，后续投入暂停', scene: '基地收束。未启动者收起方案；已经完成首段者归档成果、结清费用，停止追加。', limit: '区分“未启动评估”和“首段成果已取得”；购地未撤销，已花费用不退款。' },
  { id: 'E3', title: '完成本轮原范围评估', scene: '团队核对本轮报告、未来现场工作方案和未解问题。根据执行方式展示独立工作资料、采购报告或共同成果。', limit: '完成的是本轮基地评估，不是探明储量、开始采矿或保证盈利。' },
  { id: 'E4', title: '完成缩减范围评估', scene: '桌上只放较窄范围成果，未完成项目另列；缩小范围保留余量，同时留下更多未知。', limit: '不能沿用完整成果画面，也不因余额更多自动获得更高评价。' },
]
export const strategies = [
  { id: 'S1' as const, label: '独立组织', cost: 18, days: 5, tradeoff: '五天准备建立可编辑假设表与来源索引，约定本轮专业人员响应安排；变化后改方案较快，但更贵，自己维护，整个项目不保证最早完成。', knowledge: '内部资源与能力、组织实施、自主性的成本。' },
  { id: 'S2' as const, label: '购买专业服务', cost: 12, days: 2, tradeoff: '按范围验收报告；不取得服务方全部方法或持续服务，追加另付费。', knowledge: '能力缺口、外部采购、供应依赖。' },
  { id: 'S3' as const, label: '联合评估', cost: 8, days: 3, tradeoff: '林衡分担人员与费用；共享约定成果、共同确认变更，不转让土地。', knowledge: '互补资源、合作与竞争、共同责任。' },
]
export const scales = [
  { id: 'I1' as const, label: '小范围顺序评估', cost: 12, days: 5, future: 18, detail: '先复核关键既有资料和成本假设；覆盖较窄、时间较长，保留资金。' },
  { id: 'I2' as const, label: '集中并行评估', cost: 24, days: 3, future: 12, detail: '多人并行复核记录、运输方案与成本假设；覆盖更广更快，但投入更深。' },
]
export const adjustments = [
  { id: 'X1' as const, label: '完成原范围', knowledge: '有依据地坚持、资源匹配；涨价不等于必须退出。' },
  { id: 'X2' as const, label: '缩小范围', knowledge: '范围调整、重新配置资源；保留资金也留下未知。' },
  { id: 'X3' as const, label: '停止追加并结清', knowledge: '面向未来取舍、沉没成本；已付费用不会退回。' },
]
const extra = {
  S1: { I1: [24, 5], I2: [20, 3], X2: [6, 1], X3: [3, 1] },
  S2: { I1: [26, 7], I2: [22, 4], X2: [7, 2], X3: [4, 1] },
  S3: { I1: [22, 9], I2: [16, 6], X2: [5, 4], X3: [2, 1] },
}
export type EncounterId = 'independent' | 'exchange' | 'part' | 'wait'
export const encounterOutcomes: { id: EncounterId; choice: string; title: string; state: string; scene: string; dialogue: string; evidence: string }[] = [
  { id: 'independent', choice: 'H1-A 保持独立', title: '独立归来', state: 'D18到镇；未交换非必要信息，各自安排负重与返程，无新增外部记录。', scene: '四人自行把行装搬回基地，阿杰按原分工清点，沈岚收好核心勘察记录。没有外队或新地图出现在尾镜。', dialogue: '老周：“后半段也是我们四个自己走完的。” 队长：“购买窗口过了。东西都齐了。今晚先休息，明天再商量下一步。”', evidence: '选择保持独立，未发生实际协作；不能用没有发生的背叛证明拒绝接触更优。' },
  { id: 'exchange', choice: 'H1-B 有限交换、独立返回', title: '带回有限的新认识', state: 'D18到镇；新增注明来源、日期和未核实处的公共路况摘记，核心发现未披露。', scene: '沈岚把秦岑队的公共路况摘记单独归档，注明日期与未核实处。核心勘察记录另放一份封套；两队没有被写成合作伙伴。', dialogue: '沈岚：“这份能补路线记录，不能证明矿值多少钱。” 队长：“来源和用途写清，别把听到的当成亲眼看过的。”', evidence: '交换了有限公共行程信息，得到有来源但范围有限的记录；并未实际同行，不能评价合作执行能力。' },
  { id: 'part', choice: 'H1-C 试行同行 → H2-A 按约分开', title: '合作到约定的边界', state: 'D18到镇；已完成一段互助，归还各自器材后独立返程，没有额外一天等待。', scene: '基地收好自家营具，短回忆是分岔点交还器材、各自启程，不是争吵散伙。保留一段真实互助和有限路况记录。', dialogue: '阿杰：“前一段他们确实帮了忙。” 队长：“他们留下做完任务，我们按约先回来。这两件事不冲突。”', evidence: '已完成一段互助；对方需延期时按原约定分开，观察到合作边界的执行，不等于自私或合作失败。' },
  { id: 'wait', choice: 'H1-C 试行同行 → H2-B 延长合作一天', title: '多走一天的同行关系', state: 'D19到镇；多耗一天时间和机动口粮，互助持续至返城。互留通信地址，无投资或未来合作保证。', scene: '两队在城镇卸下共同搬运的行装，各自结账。老周记下一日机动口粮已使用。秦岑与队长互留城镇通信地址，没有交换矿区位置或核心资料。', dialogue: '秦岑：“以后有合适的事，再具体谈。” 队长：“可以联系。下一次，也得重新说清范围。”', evidence: '已完成一段互助，并以一天时间和机动口粮延续协作；存在新的联系渠道，不足以证明对方永远可靠或自身擅长长期合作。' },
]
export type StoryPath = { id: string; arrival: Arrival; encounter?: EncounterId; s?: SId; i?: IId; x?: XId; ending: EndingId; variant: string; balance?: number; day?: number; decisionDay?: number; extraCost?: number; available?: number; feasible: boolean }
export const assessmentFindings: Record<IId, { known: string; unknown: string; changed: string }> = {
  I1: {
    known: '复核的几个观察点，其编号、位置与原始记录能对应，值得进一步查证；基础成本表把未来运输按原报价和排期估算。记录能对上，不代表观察点之间都有同样的矿藏。',
    unknown: '矿藏是否连续、储量和可采性仍未知；尚未做跨专业交叉检查，也未核对完整运输方案的衔接。',
    changed: '新排期使基础成本表中的运输假设失效。继续投入可以补查并修订原范围；缩减只重看关键成本假设；停止则留下现有记录和未修订的估算，不能直接据此安排进场。',
  },
  I2: {
    known: '观察点记录能对应；并行核对还发现，原运输方案依赖人员、设备在同一运力窗口衔接。若错开，原来的工作顺序和成本表就不能直接沿用。这是既有方案的依赖，不是新增事故。',
    unknown: '矿藏是否连续、储量和可采性仍未知；已经识别运输衔接问题，但尚未完成新排期下各项关联假设的综合重算与最终方案。',
    changed: '新排期触及已识别的运输衔接条件。继续投入可完成原范围重算；缩减只修订关键运输成本项，保留其他未解关联；停止则归档现有发现，不取得适配新排期的最终方案。',
  },
}
export function assessmentFeedback(p: StoryPath) {
  return p.s && p.s !== 'S4' && p.i ? assessmentFindings[p.i] : undefined
}
export function evaluate(arrivalId: string, s: SId, i?: IId, x?: XId): StoryPath {
  const arrival = arrivals.find(a => a.id === arrivalId)
  if (!arrival || arrival.budget === undefined) throw new Error('超期路径不能进入真实第二幕')
  if (s === 'S4') return { id: `${arrivalId}-S4`, arrival, s, ending: 'E2', variant: '未启动评估', balance: arrival.budget - 2, day: 4, feasible: true }
  const strategy = strategies.find(v => v.id === s)
  const scale = scales.find(v => v.id === i)
  if (!strategy || !scale || !x) throw new Error('缺少有效的执行、范围或调整选择')
  const [cost, days] = extra[s][x === 'X1' ? scale.id : x]
  const available = arrival.budget - 2 - strategy.cost - scale.cost
  const decisionDay = 4 + strategy.days + scale.days
  return { id: `${arrivalId}-${s}-${i}-${x}`, arrival, s, i, x, ending: x === 'X1' ? 'E3' : x === 'X2' ? 'E4' : 'E2', variant: x === 'X3' ? '首段成果已取得，停止追加' : x === 'X1' ? '本轮原范围完成' : '较窄范围完成，保留未解问题', balance: available - cost, day: decisionDay + days, decisionDay, extraCost: cost, available, feasible: available >= cost }
}
export function enumeratePaths(): StoryPath[] {
  return arrivals.flatMap(arrival => {
    if (arrival.id === 'C2') return encounterOutcomes.map(h => ({ id: `C2-${h.id}-E1`, arrival: { ...arrival, arrival: h.id === 'wait' ? 'D19 15:00' : 'D18 15:00', state: h.state, chain: `${arrival.chain} → ${h.choice}` }, encounter: h.id, ending: 'E1' as const, variant: h.title, feasible: true }))
    if (arrival.budget === undefined) return [{ id: `${arrival.id}-E1`, arrival, ending: 'E1' as const, variant: '原期权窗口到期，后续处置未知', feasible: true }]
    return [evaluate(arrival.id, 'S4'), ...strategies.flatMap(s => scales.flatMap(i => adjustments.map(x => evaluate(arrival.id, s.id, i.id, x.id))))].filter(p => p.feasible)
  })
}
export function pathLabel(p: StoryPath) {
  return [p.arrival.chain, p.s === 'S4' ? '暂缓启动' : strategies.find(s => s.id === p.s)?.label, scales.find(i => i.id === p.i)?.label, adjustments.find(x => x.id === p.x)?.label, p.ending].filter(Boolean).join(' → ')
}
export function observations(p: StoryPath): string[] {
  const result = [`返程记录：${p.arrival.knowledge}`]
  if (p.encounter) return [...result, encounterOutcomes.find(h => h.id === p.encounter)!.evidence, ...(['part', 'wait'].includes(p.encounter) ? ['互助的分配并不均等：阿杰少承担部分营具搬运，老周增加长器材协同劳动，每晚约半小时交接占用原休息时间。'] : ['保持独立行动，无须承担外队的器材交接，保留自行停走和休息安排。']), ...(p.encounter === 'wait' ? ['延长合作继续承担交接与协调；机动口粮使用后，原有一日延误缓冲不再可用，不通过额外事故惩罚选择。'] : []), '知识点：信息来源与披露边界、互补资源、目标差异与承诺调整。秦岑是同行，未被确认为竞争者。', '未提供选择理由，不推断保持独立或继续合作的动机。没有经历实际购地与基地项目投入，不评价这部分能力；同一相遇事件不能冒充多次独立能力证据。']
  if (!p.s) return [...result, '本局仅观察到返程取舍；竞争、合作与后续投入未经历，不生成全面人格标签。']
  if (p.s === 'S4') return [...result, '已完成购买，但在公共准备花费2BU后暂缓。可以观察投入边界，不能推断不会经营。']
  result.push(`执行取舍：${strategies.find(s => s.id === p.s)!.tradeoff}`)
  if (p.i === 'I2' && ['A1', 'A2', 'B1'].includes(p.arrival.id)) result.push('返程曾争取时间，本轮又选择集中投入；可讨论机会推进倾向，同时核对身体和资金代价。')
  if (p.arrival.id === 'V1') result.push('等待并使用了通行信息；是否也有依据地使用本轮评估反馈，仍需学生说明理由。')
  const full = evaluate(p.arrival.id, p.s!, p.i, 'X1')
  result.push(!full.feasible ? '原范围因预算不足不可选。此次缩减或停止受到硬约束，不能夸成完全自由的充分权衡。' : `反馈记录：${adjustments.find(x => x.id === p.x)!.knowledge} 是否合理仍需结合当时理由。`)
  result.push(p.s === 'S3' ? '合作按钮只证明接受本次合作边界，不证明已经具备处理长期利益冲突的能力。' : '没有实际联合评估经历，不评价长期合作能力。')
  return result
}

export function epilogue(p: StoryPath): { title: string; scene: string; dialogue: string } {
  if (p.encounter) return encounterOutcomes.find(h => h.id === p.encounter)!
  if (p.ending === 'E1') {
    const scenes: Record<string, { title: string; scene: string; dialogue: string }> = {
      A3: { title: '折返以后', scene: 'D21回到基地，老周把折返段从原路线划出，留下D3至D5两天的记录。队伍已经返回，但走过的路无法追回，原购买条件也没有恢复。', dialogue: '老周：“回头的两天也算在路上。” 队长：“先把行装卸下吧。这张路线图留着。”' },
      B2: { title: '知道赶不上，仍按这个节奏走', scene: 'D16返城，沈岚翻开D7的行程估算，原本还需九天的记录与实际归期相对照。队伍保留了休息，不演成最后一刻才发现迟到。', dialogue: '沈岚：“那天就算到了今天。” 队长：“嗯，今天到了。大家先歇一歇。”' },
      V2: { title: '路能走，不等于必须走', scene: 'D19，通行公告与山谷路线记录并排放在基地桌上。公告确认的是外部通道，选山谷接受的是自身约束；没有因掌握消息自动恢复期权。', dialogue: '老周：“公告没错，山路能通。” 队长：“能通，不等于我们一定要走。”' },
      V3: { title: '确认以后，仍决定等待', scene: 'D40，队伍收好营地余料与D3通行公告，记录先等信息再继续等稳定天气的两个阶段。回顾不把这次选择说成不知道山路可通行。', dialogue: '阿杰：“第三天就知道路没有封断。” 队长：“那张公告也留着，和营地的记录放一起。”' },
      C3: { title: '消息改变了原来的安排', scene: 'D40，阿杰归档D2的暴风记录；两天的信息等待转为D24前的长期留营，队伍完成返程。没有新增商业回收。', dialogue: '阿杰：“本来只准备先等消息。” 队长：“收到消息后，我们改了安排。不是两天后就到家了。”' },
      D: { title: '按最初的取舍回来', scene: 'D40，老周在最初标记的等待日历上划掉D24出发和返程16天。四人拆完行装，原购买窗口失去，但不是途中才被迫放弃原计划。', dialogue: '老周：“按出发前定的节奏，人回来了。” 队长：“原来的购买约定过期了。先安顿下来，明天再商量下一步。”' },
    }
    return scenes[p.arrival.id] ?? { title: '原购买窗口失去', scene: endings[0].scene, dialogue: '土地后续处置尚不确定。' }
  }
  if (p.s === 'S4') return { title: '买下以后，暂不启动', scene: '基地桌上是已办妥的购买文件和未签启动的评估方案。本轮未启动专业评估，2BU公共准备已花，后续档期未锁定。', dialogue: '沈岚：“购买办完了，不代表下一笔也必须马上花。” 队长：“启动单先不签了，购买文件另收好。”' }
  const delivery = p.s === 'S1' ? '沈岚整理各专业的原始工作资料、可编辑假设表与来源索引；可自行修改假设作初步重算，仍需专业复核，团队自己维护。' : p.s === 'S2' ? '阿杰按范围清单核对服务商的约定报告；报告可用，不代表获得对方全部方法和持续服务。' : '沈岚与林衡核对共同成果的使用范围及变更记录；只共享约定成果，土地未转让。'
  const first = p.i === 'I1' ? '首段已完成关键记录和基础成本假设复核，跨专业交叉检查及完整未来运输方案未完成。' : '首段已完成地质记录、运输方案与成本假设的并行复核，覆盖较广；尚未完成新排期下的综合复核与最终方案。'
  const reduced = p.i === 'I1' ? '本次仅补上关键成本假设对新排期的敏感性修订及限制说明，未补齐跨专业检查。' : '本次修订已覆盖项目中的运输成本关键项并整理交付，未完成全部关联假设的综合重算。'
  const scope = p.ending === 'E2' ? `${first}首段成果已归档，收尾费用已结清，不新增修订工作；已付费用不退款。` : p.ending === 'E3' ? '原范围清单逐项核对完成，未来现场工作和盈利判断仍未完成。' : `${first}${reduced}缩减范围内的成果完成，未完成项目单独列出，不用一份完整报告冒充同样产出。`
  return { title: `${strategies.find(s => s.id === p.s)!.label} · ${p.variant}`, scene: `${delivery}${scope}`, dialogue: p.ending === 'E2' ? '队长：“把这轮资料收好，账结清。后面的先不安排了。”' : p.ending === 'E3' ? '沈岚：“这轮该回答的问题有了依据。真正进场，还有下一步要核实。”' : '队长：“未完成的那张清单也放进去。下次接着看，别漏了。”' }
}
