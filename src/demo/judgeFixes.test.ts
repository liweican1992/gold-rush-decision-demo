import { describe, expect, it } from "vitest"
import { FINAL_NODES } from "./finalStoryMap"
import { latestNode, nextLatestNode, visibleOptions, optionTarget, branchForDecisions, type LatestDecision } from "./latestStory"
import { dayFromTime } from "../components/LatestStoryPlay"

describe("裁判复审回归", () => {
  it("日期不是倒计时，超期后不能停在第十四天", () => {
    expect(dayFromTime("约Day 40")).toBe(40)
    expect(dayFromTime("Day 5—6")).toBe(5)
  })
  it("学生结算不出现制作占位语", () => {
    const decisions = ["P06-C", "C2-1", "C3-1", "C6-3"].map(optionId => ({nodeId:"",optionId,label:""}))
    expect(branchForDecisions(decisions)?.completion).not.toContain("未锁")
  })
  it("所有实际路径都可达结算，且引用有效选项", () => {
    let count = 0
    const walk = (id:string, decisions:LatestDecision[] = [], seen:string[] = []) => {
      expect(seen).not.toContain(id)
      if(id === "RESULT") {expect(branchForDecisions(decisions)).toBeTruthy(); count++; return}
      const node = latestNode(id)!
      expect(node).toBeTruthy()
      if("options" in node && node.options?.length) {
        for(const option of visibleOptions(node, decisions)) walk(optionTarget(option), [...decisions,{nodeId:id,optionId:option.id,label:option.label}], [...seen,id])
      } else walk(nextLatestNode(id), decisions, [...seen,id])
    }
    walk("P06")
    expect(count).toBe(20)
    expect(FINAL_NODES.length).toBeGreaterThan(0)
  })
})
