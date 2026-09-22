import { existsSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { latestNode, visibleOptions, nextLatestNode, optionTarget, branchForDecisions, type LatestDecision } from "./latestStory"
import { presentNode, decisionBackdrop } from "./storyPresentation"
import { dayFromTime } from "../components/LatestStoryPlay"
describe("当前局面",()=>{
 it("20条实际路径的当前日期单调前进，没有提前显示结局日",()=>{
  let count=0
  function visit(id:string,ds:LatestDecision[]=[],last=0){
   if(id==="RESULT"){const end=branchForDecisions(ds)!;if(/Day/.test(end.completion))expect(dayFromTime(end.completion)).toBeGreaterThanOrEqual(last);count++;return}
   const n=presentNode(id,ds)!.node; const day=dayFromTime(n.time);expect(day,`${id}: ${n.time}`).toBeGreaterThanOrEqual(last)
   if("options" in n && n.options?.length) {
    expect(existsSync("public"+decisionBackdrop(id,ds))).toBe(true)
    expect(n.facts).not.toMatch(/前情决定可见状态|强推者|暂避者/)
    for(const o of visibleOptions(n,ds)) visit(optionTarget(o),[...ds,{nodeId:id,optionId:o.id,label:o.label}],day)
   } else visit(nextLatestNode(id),ds,day)
  }
  visit("P06");expect(count).toBe(20)
 })
 it("伤情和决策背景随前情变化，不用行动反馈图",()=>{
  const ds=(id:string)=>[{nodeId:"A02",optionId:id,label:""}]
  expect(presentNode("A04",ds("A2-1"))?.condition).toContain("受限")
  expect(presentNode("A04",ds("A2-2"))?.condition).toContain("手较稳")
  expect(decisionBackdrop("A04",ds("A2-1"))).not.toBe(decisionBackdrop("A04",ds("A2-2")))
  expect(decisionBackdrop("B04",ds("B2-1"))).not.toBe(decisionBackdrop("B04",ds("B2-2")))
  expect(latestNode("A04")?.time).toBeTruthy()
 })
})
