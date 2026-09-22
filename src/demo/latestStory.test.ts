import { describe, expect, it } from 'vitest'
import { LATEST_NODE_VIDEOS, LATEST_RESULT_VIDEOS, LATEST_TIME_TRANSITIONS, arrivalOutcomeForDecisions, branchForDecisions, confirmationStatus, nextLatestNode, optionTarget, resultVideoForDecisions, visibleOptions, type LatestDecision } from './latestStory'
import { FINAL_NODES } from './finalStoryMap'

const decisions = (...optionIds: string[]): LatestDecision[] => optionIds.map((optionId) => ({
  nodeId: optionId.startsWith('P06') ? 'P06' : optionId.split('-')[0],
  optionId,
  label: optionId,
}))

describe('当前 FINAL 剧情试玩', () => {
  it('A、B、C、D线在两次选择之间只加载一个合并视频，避免浏览器切片停顿', () => {
    expect(LATEST_NODE_VIDEOS.A01).toEqual(['/videos/latest/a-route-to-a02-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.A03A).toEqual(['/videos/latest/a-continue-to-a04-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.A03B).toEqual(['/videos/latest/a03b-shelter-restart.mp4'])
    expect(LATEST_NODE_VIDEOS.A02).toBeUndefined()
    expect(LATEST_NODE_VIDEOS.A04).toBeUndefined()
    expect(LATEST_NODE_VIDEOS.B01).toEqual(['/videos/latest/b-route-to-b02-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.B03A).toEqual(['/videos/latest/b-accelerate-to-b04-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.B03B).toEqual(['/videos/latest/b-steady-to-b04-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.B02).toBeUndefined()
    expect(LATEST_NODE_VIDEOS.B04).toBeUndefined()
    expect(LATEST_NODE_VIDEOS.C01).toEqual(['/videos/latest/c-route-to-c02-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.C02).toBeUndefined()
    expect(LATEST_NODE_VIDEOS.C03).toEqual(['/videos/latest/c03-second-information.mp4'])
    expect(LATEST_NODE_VIDEOS.D01).toEqual(['/videos/latest/d-route-to-d03-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.D04A).toEqual(['/videos/latest/d-wait-to-result.mp4'])
    expect(LATEST_NODE_VIDEOS.D04B).toEqual(['/videos/latest/d-reverse-to-d05-choice.mp4'])
    expect(LATEST_NODE_VIDEOS.D02).toBeUndefined()
    expect(LATEST_NODE_VIDEOS.D05).toBeUndefined()
  })

  it('四条首选路线和 A 线两轮选择使用当前文案', () => {
    const p06 = FINAL_NODES.find((node) => node.id === 'P06')!
    const a04 = FINAL_NODES.find((node) => node.id === 'A04')!
    expect(p06.options?.map((option) => option.label)).toEqual(['立即翻山', '走山谷', '先等天气信息', '等天气好转后安全返回'])
    expect(a04.options?.map((option) => option.label)).toEqual(['按现在的节奏继续', '继续走山路，但把节奏降下来', '趁现在还能退，撤回改走山谷'])
    expect(a04.options?.[1].cost).toBe('预计多花约1天')
  })

  it('玩家点击前的风险提示不泄露精确结局', () => {
    const costs = FINAL_NODES.flatMap((node) => node.options?.map((option) => option.cost) ?? [])
    expect(costs.every((cost) => !/Day\s*\d+\s+\d{1,2}:\d{2}|明确失去|原窗口过去|安全返回/.test(cost))).toBe(true)
  })

  it('A线不休息的到达时间早于暂避暴风的到达时间', () => {
    const noRest = branchForDecisions(decisions('P06-A', 'A2-1', 'A4-1'))
    const sheltered = branchForDecisions(decisions('P06-A', 'A2-2', 'A4-1'))
    expect(noRest?.id).toBe('A-01')
    expect(noRest?.completion).toBe('Day 9 18:00')
    expect(sheltered?.id).toBe('A-03')
    expect(sheltered?.completion).toBe('Day 11 12:00')
  })

  it('只在明确的时间跳跃节点显示过场字幕', () => {
    expect(LATEST_TIME_TRANSITIONS.C01).toBeUndefined() // Waiting is bridged at the actual edit inside the movie
    expect(LATEST_TIME_TRANSITIONS.C03.title).toBe('又过了一天')
    expect(LATEST_TIME_TRANSITIONS.A03B.title).toBe('两天后')
    expect(LATEST_TIME_TRANSITIONS.A4FB1).toBeUndefined()
  })

  it('B 线第二轮只显示与前序状态相符的两个选项', () => {
    const b04 = FINAL_NODES.find((node) => node.id === 'B04')!
    expect(visibleOptions(b04, decisions('P06-B', 'B2-1')).map((option) => option.id)).toEqual(['B4A-1', 'B4A-2'])
    expect(visibleOptions(b04, decisions('P06-B', 'B2-2')).map((option) => option.id)).toEqual(['B4B-1', 'B4B-2'])
  })

  it('18条代表结果都能由合法选项组合解析', () => {
    const paths = [
      ['P06-A', 'A2-1', 'A4-1'], ['P06-A', 'A2-1', 'A4-2'], ['P06-A', 'A2-2', 'A4-1'], ['P06-A', 'A2-2', 'A4-2'], ['P06-A', 'A2-3'],
      ['P06-B', 'B2-1', 'B4A-1'], ['P06-B', 'B2-1', 'B4A-2'], ['P06-B', 'B2-2', 'B4B-1'], ['P06-B', 'B2-2', 'B4B-2'],
      ['P06-C', 'C2-2'], ['P06-C', 'C2-1', 'C3-1', 'C6-1'], ['P06-C', 'C2-1', 'C3-1', 'C6-2'], ['P06-C', 'C2-1', 'C3-2'], ['P06-C', 'C2-1', 'C3-3'], ['P06-C', 'C2-1', 'C3-1', 'C6-3'],
      ['P06-D', 'D3-1'], ['P06-D', 'D3-2', 'D5-1'], ['P06-D', 'D3-2', 'D5-2'],
    ]
    const branches = paths.map((path) => branchForDecisions(decisions(...path)))
    expect(branches.every(Boolean)).toBe(true)
    expect(new Set(branches.map((branch) => branch?.id)).size).toBe(18)
  })

  it('按期结算明确显示本人完成最后确认', () => {
    const branch = branchForDecisions(decisions('P06-A', 'A2-1', 'A4-1'))!
    expect(confirmationStatus(branch)).toBe('已由本人完成最后确认 · Day 9 18:00')
    const option = FINAL_NODES.find((node) => node.id === 'A04')!.options![0]
    expect(optionTarget(option)).toBe('A4FB1')
  })

  it('A线最后三个选择都先播放对应反馈片', () => {
    const options = FINAL_NODES.find((node) => node.id === 'A04')!.options!
    expect(optionTarget(options[1])).toBe('A4FB2')
    expect(LATEST_NODE_VIDEOS.A4FB2).toEqual(['/videos/latest/a4fb2-slow-down.mp4'])
    expect(nextLatestNode('A4FB2')).toBe('RESULT')
    expect(optionTarget(options[2])).toBe('A4FB3')
    expect(LATEST_NODE_VIDEOS.A4FB3).toEqual(['/videos/latest/a4fb3-retreat-to-valley.mp4'])
    expect(nextLatestNode('A4FB3')).toBe('RESULT')
  })

  it('A线早期撤回复用已验收的下撤与谷地连续片', () => {
    const option = FINAL_NODES.find((node) => node.id === 'A02')!.options![2]
    expect(optionTarget(option)).toBe('A03R')
    expect(LATEST_NODE_VIDEOS.A03R).toEqual(['/videos/latest/a4fb3-retreat-to-valley.mp4'])
    expect(nextLatestNode('A03R')).toBe('RESULT')
  })

  it('A线暂避后先播放重新出发片，再进入最后回头点', () => {
    const option = FINAL_NODES.find((node) => node.id === 'A02')!.options![1]
    expect(optionTarget(option)).toBe('A03B')
    expect(LATEST_NODE_VIDEOS.A03B).toEqual(['/videos/latest/a03b-shelter-restart.mp4'])
    expect(nextLatestNode('A03B')).toBe('A04')
  })

  it('D线第二次选择先播放对应反馈，再进入客观结算', () => {
    const options = FINAL_NODES.find((node) => node.id === 'D05')!.options!
    expect(optionTarget(options[0])).toBe('D5FB1')
    expect(optionTarget(options[1])).toBe('D5FB2')
    expect(LATEST_NODE_VIDEOS.D5FB1).toEqual(['/videos/latest/d5fb1.mp4'])
    expect(LATEST_NODE_VIDEOS.D5FB2).toEqual(['/videos/latest/d5fb2.mp4'])
  })

  it('B线第二次选择先播放对应结尾，再进入客观结算', () => {
    const options = FINAL_NODES.find((node) => node.id === 'B04')!.options!
    expect(optionTarget(options[0])).toBe('B4FBDAWN')
    expect(optionTarget(options[1])).toBe('B4FBREST')
    expect(optionTarget(options[2])).toBe('B4FBDAWN')
    expect(optionTarget(options[3])).toBe('B4FBREST')
    expect(LATEST_NODE_VIDEOS.B4FBDAWN).toEqual(['/videos/latest/b-final-dawn.mp4'])
    expect(LATEST_NODE_VIDEOS.B4FBREST).toEqual(['/videos/latest/b-final-rest.mp4'])
  })

  it('抵达镜头按结局既定的昼夜标记播放，安全返程不误用办事地点', () => {
    expect(resultVideoForDecisions(decisions('P06-A', 'A2-1', 'A4-1'))).toBe(LATEST_RESULT_VIDEOS.night)
    expect(resultVideoForDecisions(decisions('P06-A', 'A2-2', 'A4-1'))).toBe(LATEST_RESULT_VIDEOS.day)
    expect(resultVideoForDecisions(decisions('P06-B', 'B2-2', 'B4B-2'))).toBe(LATEST_RESULT_VIDEOS.day)
    expect(resultVideoForDecisions(decisions('P06-D', 'D3-1'))).toBeUndefined()
  })

  it('抵达后根据期限结果显示完成、重新拍卖或安全返回画面', () => {
    expect(arrivalOutcomeForDecisions(decisions('P06-A', 'A2-1', 'A4-1'))?.tone).toBe('confirmed')
    expect(arrivalOutcomeForDecisions(decisions('P06-B', 'B2-2', 'B4B-2'))?.tone).toBe('auction')
    expect(arrivalOutcomeForDecisions(decisions('P06-B', 'B2-2', 'B4B-2'))?.title).toBe('矿权进入重新拍卖')
    expect(arrivalOutcomeForDecisions(decisions('P06-D', 'D3-1'))?.tone).toBe('safe')
  })

  it('C线转谷地先播放整装反馈，再进入晚状态谷地', () => {
    const option = FINAL_NODES.find((node) => node.id === 'C02')!.options![1]
    expect(optionTarget(option)).toBe('C2FB2')
    expect(LATEST_NODE_VIDEOS.C2FB2).toEqual(['/videos/latest/c2fb2-leave-for-valley.mp4'])
    expect(nextLatestNode('C2FB2')).toBe('RESULT')
  })

  it('C线再等一天先播放止损反馈，再进入第二次信息决策', () => {
    const option = FINAL_NODES.find((node) => node.id === 'C02')!.options![0]
    expect(optionTarget(option)).toBe('C2FB1')
    expect(LATEST_NODE_VIDEOS.C2FB1).toEqual(['/videos/latest/c2fb1-wait-one-more-day.mp4'])
    expect(nextLatestNode('C2FB1')).toBe('C03')
  })

  it('C线等到第三天后转谷地使用三天版本，避免误用于Day 2路线', () => {
    const option = FINAL_NODES.find((node) => node.id === 'C03')!.options![1]
    expect(optionTarget(option)).toBe('C04VA')
    expect(LATEST_NODE_VIDEOS.C04VA).toEqual(['/videos/latest/c04va-day3-to-valley.mp4'])
  })

  it('C线等到第三天后走山路播放低处山路过渡片', () => {
    const option = FINAL_NODES.find((node) => node.id === 'C03')!.options![0]
    expect(optionTarget(option)).toBe('C04M')
    expect(LATEST_NODE_VIDEOS.C04M).toEqual(['/videos/latest/c04m-low-mountain-route.mp4'])
  })

  it('C线低处山路之后播放等待产生价值的推进片', () => {
    expect(nextLatestNode('C04M')).toBe('C05')
    expect(LATEST_NODE_VIDEOS.C05).toEqual(['/videos/latest/c05-information-proves-useful.mp4'])
    expect(nextLatestNode('C05')).toBe('C06')
    expect(LATEST_NODE_VIDEOS.C06).toEqual(['/videos/latest/c06-reality-update-choice.mp4'])
  })

  it('C线现场更新后的两个反馈分支先播放成片再结算', () => {
    const options = FINAL_NODES.find((node) => node.id === 'C06')!.options!
    expect(optionTarget(options[1])).toBe('C6FB2')
    expect(LATEST_NODE_VIDEOS.C6FB2).toEqual(['/videos/latest/c6fb2-observe-and-buffer.mp4'])
    expect(nextLatestNode('C6FB2')).toBe('RESULT')

    expect(optionTarget(options[2])).toBe('C04VB')
    expect(LATEST_NODE_VIDEOS.C04VB).toEqual(['/videos/latest/c04vb-day7-to-valley.mp4'])
    expect(nextLatestNode('C04VB')).toBe('RESULT')
  })

  it('共享晚状态谷地段可由不同时间进入谷地的路线复用', () => {
    expect(LATEST_NODE_VIDEOS.C04V).toEqual(['/videos/latest/sh-valley-travel.mp4'])
    expect(nextLatestNode('C04V')).toBe('RESULT')
  })
})
