import { describe, expect, it } from "vitest"
import { freshSession, advanceSession, rewindSession, restoreSession } from "./storySession"
const a = {nodeId:"P06",optionId:"P06-A",label:"立即翻山",reason:"先争取时间"}
const b = {nodeId:"A02",optionId:"A2-1",label:"继续",reason:"前路仍然可见"}
const c = {nodeId:"A04",optionId:"A4-1",label:"保持",reason:"队友可以分担装备"}
function completed() {
 let s=freshSession()
 s=advanceSession(s,"INTRO");s=advanceSession(s,"P06");s=advanceSession(s,"A01",[a]);s=advanceSession(s,"A02");s=advanceSession(s,"A03A",[a,b]);s=advanceSession(s,"A04");s=advanceSession(s,"A4FB1",[a,b,c]);return advanceSession(s,"RESULT")
}
describe("本局存档与原始选择",()=>{
 it("刷新后恢复节点、理由和完整历史",()=>{
  const s=completed();expect(restoreSession(JSON.stringify(s))).toEqual(s)
  expect(restoreSession(JSON.stringify({...s,nodeId:"A04",decisions:[a,b],mediaDone:true}))).toBeTruthy()
 })
 it("回到选择前仍保留首次结局与当时理由，新尝试有独立编号",()=>{
  const first=completed(), rewind=rewindSession(rewindSession(first))
  expect(rewind.nodeId).toBe("A04");expect(rewind.decisions).toEqual([a,b])
  expect(rewind.archives[0].decisions).toEqual([a,b,c]);expect(rewind.archives[0].completed).toBe(true)
  expect(rewind.attemptId).not.toBe(first.attemptId);expect(rewind.explored).toBe(true)
  const revised=advanceSession(rewind,"A4FB2",[a,b,{...c,optionId:"A4-2"}])
  expect(revised.archives[0].decisions[2].optionId).toBe("A4-1")
  expect(restoreSession(JSON.stringify(revised))).toEqual(revised)
 })
 it("新局隔离草稿，损坏或跨路线存档不会进入游戏",()=>{
  expect(freshSession().attemptId).not.toBe(freshSession().attemptId)
  expect(restoreSession("oops")).toBeUndefined()
  expect(restoreSession(JSON.stringify({...completed(),version:1}))).toBeUndefined()
  expect(restoreSession(JSON.stringify({...completed(),decisions:[{...a,optionId:"P06-B"},b,c]}))).toBeUndefined()
 })
})
