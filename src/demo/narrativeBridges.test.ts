import { describe, expect, it } from "vitest"
import { VIDEO_BRIDGES, pendingBridge, resultBridge, cardDuration } from "./narrativeBridges"
import { latestSubtitleTrack } from "./latestSubtitles"
import { latestNode, visibleOptions, optionTarget, nextLatestNode, type LatestDecision } from "./latestStory"

describe("叙事过场",()=>{
 it("全部内部过场都位于对白间隙，且只跨越极短的无对白画面",()=>{
  for(const [file,bridges] of Object.entries(VIDEO_BRIDGES)){
   const track=latestSubtitleTrack("/videos/latest/"+file)
   expect(track,file).toBeTruthy()
   if(!track) throw new Error(`缺少字幕轨: ${file}`)
   let last=0
   for(const b of bridges){
    expect(b.at).toBeGreaterThan(last);expect(b.resumeAt).toBeGreaterThanOrEqual(b.at)
    expect(b.resumeAt-b.at).toBeLessThan(.2);expect(b.resumeAt).toBeLessThan(track.duration)
    expect(track.cues.filter(c=>c.start < b.resumeAt+.1 && c.end > b.at-.1),file).toEqual([])
    expect(cardDuration(b)).toBeGreaterThanOrEqual(3400);last=b.resumeAt
   }
  }
 })
 it("同一个衔接点只触发一次，继续播放能触发下一处",()=>{
  const b=VIDEO_BRIDGES["d-reverse-to-d05-choice.mp4"]
  expect(pendingBridge(b,0,new Set())).toBe(-1)
  expect(pendingBridge(b,8,new Set())).toBe(0)
  expect(pendingBridge(b,8,new Set([0]))).toBe(-1)
  expect(pendingBridge(b,22,new Set([0]))).toBe(1)
 })
 it("全部20条路径有与所选行动相符的尾声，无精确结局抢先泄露",()=>{
  let count=0
  function walk(id:string, ds:LatestDecision[]=[]){
   if(id==="RESULT"){
    const card=resultBridge(ds)!;expect(card).toBeTruthy();expect(card.detail).not.toMatch(/按期|超期|Day|未锁/)
    if(ds.some(d=>d.optionId==="D3-1"))expect(card.title).toContain("安全返回")
    if(ds.some(d=>d.optionId==="C3-3"))expect(card.detail).not.toContain("镇")
    count++;return
   }
   const n=latestNode(id)!
   if("options" in n && n.options?.length)for(const o of visibleOptions(n,ds))walk(optionTarget(o),[...ds,{nodeId:id,optionId:o.id,label:o.label}])
   else walk(nextLatestNode(id),ds)
  }
  walk("P06");expect(count).toBe(20)
 })
})
