import { describe, expect, it } from 'vitest'
import { FINAL_NODES } from './finalStoryMap'
import { buildLatestDecisionReport, EMPTY_REFLECTION, exportLatestReport } from './latestReport'
import type { LatestDecision } from './latestStory'

function decisions(optionIds: string[]): LatestDecision[] {
  return optionIds.map((optionId) => {
    const node = FINAL_NODES.find((candidate) => candidate.options?.some((option) => option.id === optionId))
    const option = node?.options?.find((candidate) => candidate.id === optionId)
    if (!node || !option) throw new Error(`Unknown option ${optionId}`)
    return { nodeId: node.id, optionId, label: option.label }
  })
}

const validPaths = [
  ['P06-A', 'A2-1', 'A4-1'], ['P06-A', 'A2-1', 'A4-2'], ['P06-A', 'A2-2', 'A4-1'], ['P06-A', 'A2-2', 'A4-2'], ['P06-A', 'A2-3'],
  ['P06-B', 'B2-1', 'B4A-1'], ['P06-B', 'B2-1', 'B4A-2'], ['P06-B', 'B2-2', 'B4B-1'], ['P06-B', 'B2-2', 'B4B-2'],
  ['P06-C', 'C2-2'], ['P06-C', 'C2-1', 'C3-1', 'C6-1'], ['P06-C', 'C2-1', 'C3-1', 'C6-2'], ['P06-C', 'C2-1', 'C3-2'], ['P06-C', 'C2-1', 'C3-3'], ['P06-C', 'C2-1', 'C3-1', 'C6-3'],
  ['P06-D', 'D3-1'], ['P06-D', 'D3-2', 'D5-1'], ['P06-D', 'D3-2', 'D5-2'],
  ['P06-A', 'A2-1', 'A4-3'], ['P06-A', 'A2-2', 'A4-3'],
]

describe('latest decision report', () => {
  it('connects every path to teaching concepts using only choices made in that path', () => {
    for (const path of validPaths) {
      const report = buildLatestDecisionReport(decisions(path))
      expect(report.branchId).toBeTruthy()
      expect(report.pathTitle).not.toMatch(/^[ABCD]/)
      expect(report.summary.length).toBeGreaterThan(20)
      expect(report.decisionEvidence).toHaveLength(path.length)
      expect(report.lessons.length).toBeGreaterThanOrEqual(3)
      for (const lesson of report.lessons) {
        expect(lesson.definition).toBeTruthy()
        expect(lesson.transfer).toBeTruthy()
        expect(lesson.evidence.length).toBeGreaterThan(0)
        expect(lesson.evidence.every(item => path.includes(item.optionId))).toBe(true)
      }
      expect(report).not.toHaveProperty('scores')
      expect(report).not.toHaveProperty('confidence')
      expect(report.transferPrompt).toBeTruthy()
    }
  })

  it('does not diagnose discipline or rigidity from continuing to wait', () => {
    const report = buildLatestDecisionReport(decisions(['P06-D', 'D3-1']))
    expect(report.decisionEvidence.at(-1)?.analysis).toContain('仅凭')
    expect(report.profile.boundary).toContain('没有记录')
    expect(report.evaluation).toContain('安全')
    expect(report.alternatives).toEqual([])
    expect(report.lessons.some(item => item.id === 'adaptation')).toBe(true)
  })

  it('recognizes evidence use and later adjustment on the updated-information route', () => {
    const report = buildLatestDecisionReport(decisions(['P06-C', 'C2-1', 'C3-1', 'C6-3']))
    expect(report.lessons.some(item => item.id === 'information')).toBe(true)
    expect(report.lessons.some(item => item.id === 'adaptation')).toBe(true)
    expect(report.decisionEvidence.at(-1)?.analysis).toContain('新证据')
  })

  it('preserves prior history at shared decisions and in last-step comparisons', () => {
    const early = buildLatestDecisionReport(decisions(['P06-A', 'A2-1', 'A4-1']))
    const sheltered = buildLatestDecisionReport(decisions(['P06-A', 'A2-2', 'A4-1']))
    expect(early.decisionEvidence.at(-1)?.known).toContain('伤手限制加重')
    expect(sheltered.decisionEvidence.at(-1)?.known).toContain('暂避约两天')
    expect(early.alternatives.map(item => item.completion)).toContain('Day 10 18:00')
    expect(sheltered.alternatives.map(item => item.completion)).toContain('Day 12 12:00')
    expect(early.decisionEvidence.at(-1)?.outcome).not.toContain('或')
    const steady = buildLatestDecisionReport(decisions(['P06-B', 'B2-2', 'B4B-2']))
    expect(steady.alternatives.map(item => item.completion)).toEqual(['Day 14 01:00'])
    expect(steady.decisionEvidence.at(-1)?.known).toContain('此前一直保持原节奏')
  })

  it('exports student reasoning and learning evidence rather than grades', () => {
    const report = buildLatestDecisionReport(decisions(['P06-D', 'D3-1']))
    const exported = exportLatestReport(report, { ...EMPTY_REFLECTION, reason: '伤手仍无法支持攀爬', trigger: '先检查可通行情况' })
    expect(exported).toContain('伤手仍无法支持攀爬')
    expect(exported).toContain('尚未填写')
    expect(exported).toContain('企业应用')
    expect(exported).not.toContain('置信度')
    expect(report.pathKey).not.toBe(buildLatestDecisionReport(decisions(['P06-D', 'D3-2', 'D5-1'])).pathKey)
  })
})
