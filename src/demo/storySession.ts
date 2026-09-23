import { latestNode, nextLatestNode, optionTarget, visibleOptions, type LatestDecision } from "./latestStory"

export const SESSION_KEY = "gold-story-session-v2"
export type StorySnapshot = { nodeId: string; decisions: LatestDecision[] }
export type AttemptRecord = StorySnapshot & { id: string; completed: boolean; savedAt: string }
export type StorySession = StorySnapshot & {
  version: 2; attemptId: string; history: StorySnapshot[]; mediaDone: boolean; transitionDone: boolean; arrivalSceneDone: boolean
  archives: AttemptRecord[]; explored: boolean; seenOutcome: boolean
}
const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
export function freshSession(): StorySession {
  return {version:2, attemptId:uid(), nodeId:"launch", decisions:[], history:[], mediaDone:false, transitionDone:false, arrivalSceneDone:false, archives:[], explored:false, seenOutcome:false}
}
export function advanceSession(s:StorySession, nodeId:string, decisions=s.decisions):StorySession {
  return {...s, nodeId, decisions, history:[...s.history,{nodeId:s.nodeId,decisions:s.decisions}],mediaDone:false,transitionDone:false,arrivalSceneDone:false,seenOutcome:s.seenOutcome || nodeId === "RESULT"}
}
export function rewindSession(s:StorySession):StorySession {
  const previous = s.history.at(-1)
  if (!previous) return s
  const key = JSON.stringify(s.decisions)
  const existing = s.archives.findIndex(a => JSON.stringify(a.decisions) === key)
  const record = {nodeId:s.nodeId,decisions:s.decisions,id:s.attemptId,completed:s.nodeId === "RESULT",savedAt:new Date().toISOString()}
  const archived = !s.decisions.length ? s.archives : existing < 0 ? [...s.archives, record]
    : record.completed && !s.archives[existing].completed ? s.archives.map((a,i) => i === existing ? record : a) : s.archives
  return {...s, ...previous, attemptId:uid(), archives:archived, history:s.history.slice(0,-1),mediaDone:true,transitionDone:true,arrivalSceneDone:false,explored:true}
}
// Validate saves against the live graph, including history-specific options.
function validSnapshot(raw: unknown): raw is StorySnapshot {
  if (!raw || typeof raw !== "object") return false
  const {nodeId, decisions} = raw as StorySnapshot
  if(typeof nodeId !== "string" || !Array.isArray(decisions) || decisions.length>20) return false
  if(nodeId === "launch" || nodeId === "INTRO") return decisions.length === 0
  let id = "P06", index = 0
  for(let step=0;step<60;step++) {
    if(id === nodeId && index === decisions.length) return true
    if(id === "RESULT") return false
    const n=latestNode(id)
    if(!n) return false
    if("options" in n && n.options?.length) {
      const d=decisions[index]
      if(!d || d.nodeId !== id || typeof d.label !== "string" || (d.reason !== undefined && typeof d.reason !== "string")) return false
      const o=visibleOptions(n,decisions.slice(0,index)).find(o=>o.id===d.optionId)
      if(!o) return false
      id=optionTarget(o); index++
    } else id=nextLatestNode(id)
  }
  return false
}
export function restoreSession(serialized: string | null): StorySession | undefined {
  try {
    const s=JSON.parse(serialized ?? "null") as StorySession
    if(!s || s.version !== 2 || typeof s.attemptId !== "string" || !validSnapshot(s)) return undefined
    if(!Array.isArray(s.history) || !s.history.every(validSnapshot) || !Array.isArray(s.archives)) return undefined
    if(!s.archives.every(a=>validSnapshot(a) && typeof a.id === "string" && typeof a.completed === "boolean" && typeof a.savedAt === "string")) return undefined
    if(![s.mediaDone,s.transitionDone,s.explored,s.seenOutcome].every(v=>typeof v === "boolean")) return undefined
    if(s.arrivalSceneDone !== undefined && typeof s.arrivalSceneDone !== "boolean") return undefined
    if(s.arrivalSceneDone && (s.nodeId !== "RESULT" || !s.mediaDone)) return undefined
    return {...s, arrivalSceneDone:s.arrivalSceneDone ?? false}
  } catch { return undefined }
}
