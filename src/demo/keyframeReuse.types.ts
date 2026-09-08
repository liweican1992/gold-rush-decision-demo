export const STAGES = ['公共入口', '节点决策状态', '行动开始', '行动过程', '直接后果', '独立终局'] as const
export const CHECKS = ['时间', '地点', '人物', '装备', '伤势', '样本/资料', '天气', '不可逆后果'] as const
export const JUDGMENTS = ['候选待审', '仅作参考', '禁止用于该节点'] as const
export const REPAIRS = ['无需修复待验', '可裁切待复核', '可局部重绘待复核', '需换帧'] as const
export const ACCEPTANCES = ['未验收', '关键帧已验收', '视频待验收', '视频已验收'] as const
export type Placement = 'main' | 'process' | 'review'
export type Asset = {
  id: string; version: number; sourcePath: string; sourceSha256: string
  origin: 'target-image' | 'video-frame' | 'legacy-image'
  watermark: 'none' | 'pavo' | 'unknown'
  provenanceNote?: string; videoSource?: string; timecode?: string
  plannedTargetPath?: string
  copy?: { targetPath: string; targetSha256: string; verified: boolean }
}
export type Usage = {
  id: string; assetId: string; nodeId: string; shotId: string
  stage: typeof STAGES[number]; action: string
  judgment: typeof JUDGMENTS[number]; repair: typeof REPAIRS[number]
  acceptance: typeof ACCEPTANCES[number]
  checks: Record<typeof CHECKS[number], { result: 'visible' | 'external' | 'pending' | 'conflict'; evidence: string }>
  continuityIssues: string[]; conflicts: string[]; stageMatchesNode: boolean; placement: Placement
  reviewEvidence?: { objectVersion: number; reviewer: string; date: string; evidence: string }
}
export type Manifest = { version: 1; directoryPolicy?: string; assets: Asset[]; usages: Usage[] }
