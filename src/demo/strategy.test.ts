import { describe, expect, it } from 'vitest'
import {
  INITIAL_STRATEGY_PROGRESS,
  applyDecision,
  buildStrategyReport,
  getAvailableX3Options,
  replayDecisions,
  resolveEnding,
} from './strategy'

describe('deterministic strategy engine', () => {
  it('starts from the approved six objective values', () => {
    expect(INITIAL_STRATEGY_PROGRESS.objective).toEqual({
      time_remaining: 14,
      health: 72,
      execution: 82,
      information: 75,
      control: 65,
      capital_recovery: 0,
    })
    expect(INITIAL_STRATEGY_PROGRESS.evidence).toEqual([])
  })

  it('settles primary and route choices exactly once', () => {
    const first = applyDecision(INITIAL_STRATEGY_PROGRESS, 'A', '2026-09-07T14:00:00.000Z')
    const progress = applyDecision(first, 'A1', '2026-09-07T14:00:10.000Z')
    expect(progress.objective).toEqual({
      time_remaining: 6,
      health: 39,
      execution: 55,
      information: 75,
      control: 65,
      capital_recovery: 0,
    })
    expect(progress.flags).toEqual(expect.arrayContaining(['route:A', 'injurySevere', 'equipmentLost']))
    expect(progress.evidence).toHaveLength(2)
    expect(progress.evidence[0]).toEqual(expect.objectContaining({
      order: 1,
      decision_index: 1,
      node_id: 'P0',
      option_id: 'A',
      knowledge_point_ids: ['ENVIRONMENT_RESOURCE_FIT', 'SPEED_RISK_TRADEOFF'],
      state_before: INITIAL_STRATEGY_PROGRESS.objective,
      state_delta: { time_remaining: -3, health: -8, execution: -5 },
      timestamp: '2026-09-07T14:00:00.000Z',
    }))
    expect(progress.evidence[0].state_after).toEqual({
      time_remaining: 11,
      health: 64,
      execution: 77,
      information: 75,
      control: 65,
      capital_recovery: 0,
    })
    expect(progress.evidence[1].node_id).toBe('A0')
  })

  it('clamps percentage states and floors remaining time', () => {
    const progress = replayDecisions(['D', 'D2', 'X1-EVIDENCE', 'X2-SALE-NEGOTIATION', 'X3-FINALIZE-SALE'])
    expect(progress.objective.time_remaining).toBeGreaterThanOrEqual(0)
    expect(progress.objective.control).toBe(0)
    expect(progress.objective.capital_recovery).toBe(100)
  })

  it('shows X3 actions from current mode and state instead of historical flags', () => {
    const independent = replayDecisions(['A', 'A2', 'X1-PEOPLE', 'X2-INDEPENDENT'])
    expect(getAvailableX3Options(independent).map((option) => option.id)).toEqual([
      'X3-SUBMIT-NOW', 'X3-VERIFY-SUBMIT', 'X3-SAFE-WITHDRAW',
    ])

    const alliance = replayDecisions(['C', 'C3', 'X1-CAPABILITY', 'X2-STAGED-ALLIANCE'])
    expect(getAvailableX3Options(alliance).map((option) => option.id)).toContain('X3-JOINT-SUBMIT')

    const sale = replayDecisions(['D', 'D2', 'X1-EVIDENCE', 'X2-SALE-NEGOTIATION'])
    expect(getAvailableX3Options(sale).map((option) => option.id)).toContain('X3-FINALIZE-SALE')

    const late = replayDecisions(['A', 'A3', 'X1-SPRINT', 'X2-INDEPENDENT'])
    expect(getAvailableX3Options(late).map((option) => option.id)).toEqual([
      'X3-LATE-FILE', 'X3-SAFE-WITHDRAW',
    ])
  })

  it('resolves endings in the approved priority order', () => {
    expect(resolveEnding(replayDecisions(['D', 'D2', 'X1-EVIDENCE', 'X2-SALE-NEGOTIATION', 'X3-FINALIZE-SALE']))).toBe('END-F4')
    expect(resolveEnding(replayDecisions(['A', 'A2', 'X1-PEOPLE', 'X2-INDEPENDENT', 'X3-SAFE-WITHDRAW']))).toBe('END-F5')
    expect(resolveEnding(replayDecisions(['A', 'A3', 'X1-SPRINT', 'X2-INDEPENDENT', 'X3-LATE-FILE']))).toBe('END-F6')
    expect(resolveEnding(replayDecisions(['C', 'C3', 'X1-CAPABILITY', 'X2-STAGED-ALLIANCE', 'X3-JOINT-SUBMIT']))).toBe('END-F3')
    expect(resolveEnding(replayDecisions(['A', 'A2', 'X1-PEOPLE', 'X2-INDEPENDENT', 'X3-SUBMIT-NOW']))).toBe('END-F1')
    expect(resolveEnding(replayDecisions(['A', 'A1', 'X1-SPRINT', 'X2-INDEPENDENT', 'X3-SUBMIT-NOW']))).toBe('END-F2')
  })

  it('scores all five valid decisions and produces evidence-backed report fields', () => {
    const progress = replayDecisions(['C', 'C3', 'X1-CAPABILITY', 'X2-STAGED-ALLIANCE', 'X3-JOINT-SUBMIT'])
    const report = buildStrategyReport(progress)

    expect(report.validDecisionCount).toBe(5)
    expect(report.confidence).toBe('高')
    expect(Object.values(report.profileScores).every((score) => score >= 0 && score <= 100)).toBe(true)
    expect(report.supportingEvidence.length).toBeGreaterThan(0)
    expect(report.counterEvidence.length).toBeGreaterThan(0)
    expect(report.knowledgeReplay).toHaveLength(5)
    expect(report.reflectionQuestions).toHaveLength(3)
    expect(report.summary).toContain('同时在')
    expect(report.summary).toContain('这说明你的选择会随资源、期限和可逆性变化')
  })

  it('does not claim high confidence when the primary evidence direction is mixed', () => {
    const progress = replayDecisions(['C', 'C3', 'X1-CAPABILITY', 'X2-INDEPENDENT', 'X3-SUBMIT-NOW'])
    const report = buildStrategyReport(progress)

    expect(report.validDecisionCount).toBe(5)
    expect(report.confidence).toBe('中')
    expect(report.counterEvidence.length).toBeGreaterThan(0)
  })

  it('only names a counter tendency that has explicit positive evidence', () => {
    const progress = replayDecisions(['D', 'D1', 'X1-PEOPLE', 'X2-STAGED-ALLIANCE', 'X3-SAFE-WITHDRAW'])
    const report = buildStrategyReport(progress)

    expect(report.counterEvidence.length).toBeGreaterThan(0)
    expect(report.summary).not.toContain('其他选择')
    expect(report.summary).toContain('退出纪律与战略反转')
  })

  it('does not apply an unknown choice', () => {
    expect(applyDecision(INITIAL_STRATEGY_PROGRESS, 'UNKNOWN')).toBe(INITIAL_STRATEGY_PROGRESS)
  })
})
