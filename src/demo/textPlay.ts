import { arrivals, strategies, scales, adjustments, evaluate, enumeratePaths, assessmentFindings, type StoryPath, type SId, type IId } from './reviewedStory'

export type Choice = { id: string; label: string; detail?: string; disabled?: boolean }
export type Scene = { title: string; time: string; text: string[]; choices: Choice[]; ending?: StoryPath }
const c = (id: string, label: string, detail?: string): Choice => ({ id, label, detail })
const fixed: Record<string, Scene> = {
  start: { title: '发现之后，只剩十四天', time: 'D0 · 矿区营地', text: ['沈岚把矿石和勘察记录放在桌上：“几个观察点的情况对得上，这里值得继续查。”你伸手压住地图，受伤的左手却使不上力。阿杰帮你压住。', '地还不是你们的。三个月的土地购买期权，让你们在期限内按约定条件选择买不买；现在只剩十四天。购买资金已预留，但必须返回城镇，在D14上午09:00前办妥手续。发现矿藏不等于已经能开采，储量和可采性还需查证。', '阿杰：“能不能我们先回去办？”沈岚指着协议：“这份约定要求队长本人到场完成购买确认，我们不能替他办完。”这是本案例的协议约定，不是所有期权的通用规则。', '营地只有接收天气公告的无线电，没有电话、网络、卫星电话或发射设备。发现和位置暂留队内。地主知道你们在勘察，不一定知道发现；过期只失去原购买窗口，不等于地必然被别人买走。'], choices: [c('P', '看看返程的选择')] },
  P: { title: '怎样返回城镇？', time: 'D0 · 上午09:00', text: ['老周：“我们已经在发现地，现在要走的是回镇上的路。山路通常七到十天，快，可你这只手是个问题。山谷一般两到三周，期限会很紧。”', '阿杰：“等两天能知道有没有暴风；如果有，再等一天才知道通道是否封断。也可以等三四周天气稳定再走。”', '营地的季节性储备支持长期等待和返程，但路上只能携带有限补给。没有已经安排好的直达接送。等信息会用掉时间；等三四周则必然失去原购买窗口。'], choices: [c('A', '立即翻山', '争取时间，承担山路与伤手约束。'), c('B', '立即走山谷', '避开高山通道，但一般需要14—21天。'), c('C', '先等两天天气消息', '得到信息前，不保证后续山路可走。'), c('D', '等3—4周天气稳定后返回', '明确接受购买窗口到期。')] },
  A: { title: '山口尚在前方', time: 'D3 · 背风岩壁', text: ['风明显增强。老周：“前面还能走，但得慢，不能照原来的速度。”阿杰：“你的左手刚才又松了一次。”', '眼前有避风点。继续会增加照护与协同负担；短期避险消耗时间，目前不能保证等两天就安全。折返原营地约两天，再走山谷至少两周。'], choices: [c('A1','沿可通行路线继续推进'),c('A2','在背风处避险两天，观察再走'),c('A3','折返营地，再走山谷')] },
  B: { title: '还要走多久？', time: 'D7 · 河谷中段', text: ['沈岚：“按现在速度，还得九天。”老周：“加长每天行进时间，快的话还要七天。不是换近路，是少休息。”', '队伍身体允许尝试，但疲劳会加重。原速预计D16到；加长行进争取D14附近，办理期限余量极少，不能保证成功。'], choices: [c('B1','延长每日行进，争取期限'),c('B2','保留休息，按原节奏返回')] },
  C: { title: '暴风消息确认', time: 'D2 · 营地', text: ['阿杰：“有暴风。明天才有沿线公告，知道通道会不会封。”', '沈岚：“现在走谷地也行。但过去两天了，即使按最快十四天算，也赶不上。”'], choices: [c('V','再等一天，确认山路'),c('H','现在走山谷，接受超期','按原节奏返程，出发时带有一日机动口粮。'),c('C3','改为等待天气稳定再返回')] },
  V: { title: '通道没有封断', time: 'D3 · 营地', text: ['阿杰：“高处今天明天还有风，等我们走到那里，预计已经过了最强的时候。”', '老周：“能走通，不等于你的手没事。按照护节奏，大概九天。”沈岚：“从今天算九天还有一点余量。谷地至少十四天，就超期了。”'], choices: [c('V1','按确认的山路返程'),c('V2','仍选择山谷，接受超期'),c('V3','继续等待天气稳定')] },
  H: { title: '公共歇脚点的另一支队伍', time: 'D10 · 傍晚', text: ['你们按计划在目标地块外的公共通道过夜。秦岑三人队为另一处项目测地形，明天也返城，中途还要核对测量点。他们没有车辆、发射机或代办能力，也不知道你们发现了什么。', '秦岑：“底图不是今年的，这次亲眼看到的，我另标出来。”沈岚：“通行情况可以谈，矿区位置和判断不必谈。”', '可互换带来源、日期和未核实标记的公共路况；不是整条路都已确认安全。同行只约定到下一处分岔点：老周帮两人抬长器材，对方另一人帮阿杰搬营具；各管口粮和核心资料。每日约半小时交接占用休息，停走需协调，不加快脚程，也不治好手伤。'], choices: [c('end:independent','礼貌保持独立'),c('end:exchange','有限交换路况，各自返回'),c('H2','有限交换，试行同行一段')] },
  H2: { title: '约定的一段已经走完', time: 'D12 · 分岔点', text: ['昨日阿杰有人帮忙搬营具，老周则多承担协同搬运和晚间交接。今天秦岑的两次读数对不上。', '秦岑：“我们得留下复核，明天再走。一起到这里的约定已经做完，你们不必等。”', '分开可按原日程D18返回；等一天可继续互助，但到镇晚一天，消耗唯一的一日机动口粮，仍有每天的交接负担。你们不用代做专业测绘，也没有未来投资承诺。'], choices: [c('end:part','按约分开，恢复独立返程'),c('end:wait','等一天，再约定同行')] },
}

export function sceneFor(history: string[]): Scene {
  const id = history.at(-1) ?? 'start'
  if (fixed[id]) return fixed[id]
  if (id.startsWith('end:')) {
    const p = enumeratePaths().find(p => p.encounter === id.slice(4))!
    return { title:'回到城镇',time:p.arrival.arrival,text:[],choices:[],ending:p }
  }
  const a = arrivals.find(a => a.id === id)
  if (a) return { title:'返程的结果',time:a.arrival,text:[`${a.completed ? `${a.completed}办妥购买手续。` : '原购买窗口已失去。'}${a.state}`], choices:a.budget === undefined ? [] : [c(`R:${id}`,'照护休整后，看看下一步')], ending:a.budget === undefined ? enumeratePaths().find(p => p.arrival.id === id) : undefined }
  const [stage, entry, strategy, scale, adjustment] = id.split(':')
  const arrival = arrivals.find(a => a.id === entry)!
  if (stage === 'R') return { title:'机会保住以后',time:'T0—T4 · 城镇基地（新的项目日）', text:[`地已经买下。队长：“先核对带回的记录和成本，再决定值不值得花下一笔钱进场。这轮先不回矿区。”可用${arrival.budget}BU，BU是教学预算单位，不是现实货币报价。`, '返回不等于康复。后续照护、尾款和必要休整资金已经划出，不可挪用。公共核实花两天、2BU，随后比较书面范围，到T4确认安排。', '你们主动向几家机构询问专业能力，不透露坐标和矿藏判断。林衡因此回复：他有专业人员和渠道，也在比较别的项目，能介绍付费服务或共同评估，不保证盈利。报价阶段仅分阶段披露必要资料，约定保密与限定用途；签约后再提供执行所需资料，仍不能保证绝无泄漏。', '首段报价按约定锁定；后续费用只是估算，会受运力与排期影响，可能要额外花专业工时重算方案，并非现在付运输费进矿区。'], choices:[c(`S:${entry}`,'比较三种组织方式')] }
  if(stage === 'S') return {title:'怎样组织这轮评估？',time:'T4 · 基地',text:['沈岚想保留可追溯的工作资料，老周担心协调负担，阿杰提醒先看可动用的钱。所有工作只在基地复核既有资料、成本与未来现场方案。'],choices:[...strategies.map(s=>c(`I:${entry}:${s.id}`,s.label,`${s.cost}BU，准备${s.days}天。${s.tradeoff}`)),c(`E:${entry}:S4`,'暂缓启动','已花公共准备2BU不退，后续报价和档期不保留。')]}
  const s = strategies.find(s=>s.id===strategy)!
  if(stage === 'I') return {title:'首段查多大范围？',time:`T4 · 已选${s.label}`,text:[`公共准备和组织费用划出后还有${arrival.budget!-2-s.cost}BU。下列金额均是团队自付，联合伙伴另承担其约定部分，不是项目总成本。`, '首段与后续段分开承诺；后续预算尚未锁定。较广范围仍只是桌面核对，不能证明储量或可采性。'],choices:scales.map(i=>c(`X:${entry}:${strategy}:${i.id}`,i.label,`${i.cost}BU、${i.days}天。${i.detail}原估后续${i.future}BU。`))}
  if(stage === 'X') {
    const result=evaluate(entry,strategy as SId,scale as IId,'X1'), f=assessmentFindings[scale as IId]
    return {title:'看到反馈后，还追加吗？',time:`T${result.decisionDay} · 首段完成`,text:[`首段按约交付。作决定前收到T9发布的运力与排期变化：未来进场安排需重新核对，因此后续专业工作和报价改变。当前可用${result.available}BU。`, `查到：${f.known}`,`仍未知：${f.unknown}`,`变化：${f.changed}`, ...(strategy==='S3'?['这些调整在双方事先认可的边界内，不用重新谈判；仍共同核对、确认执行，协调时间已计入。']:[]),'缩减或停止保留已取得成果，但已付费用不退。请判断下一笔投入能解决什么，而不只看过去花了多少。'],choices:adjustments.map(x=>{const p=evaluate(entry,strategy as SId,scale as IId,x.id);return {...c(`E:${entry}:${strategy}:${scale}:${x.id}`,x.label,`新增${p.extraCost}BU，${p.day!-p.decisionDay!}天；${p.feasible?`完成后余${p.balance}BU`:`可用${p.available}BU，还差${-p.balance!}BU，不可挪照护储备`}。`),disabled:!p.feasible}})}
  }
  if(stage==='E') {const p=evaluate(entry,strategy as SId,scale as IId,adjustment as 'X1'|'X2'|'X3');return {title:'这一轮，告一段落',time:`T${p.day} · 基地`,text:[],choices:[],ending:p}}
  throw new Error('无效试玩路径')
}
export function advance(history:string[], choice:string) {
  if(!sceneFor(history).choices.some(c=>c.id===choice&&!c.disabled)) throw new Error('当前不可选择')
  return [...history,choice]
}
