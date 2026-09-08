# 历史关键帧复用与 Web 展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after explicit human approval. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在正式剧情字节不变的前提下，建立可追溯的历史图片审查、过程展示和受控候选绑定。

**Architecture:** 独立 JSON 清单存储资产、用途和副本证据；纯函数决定展示资格；StoryMapPage 只从新展示映射获取图片，绝不回退到剧情中的旧 keyframe。审查、过程和主图共用准入逻辑，正式剧情保持只读。

**Tech Stack:** 现有 React 19、TypeScript、Vite 7、Vitest 3、react-dom/server；Node 内置 fs/crypto；不新增依赖。

## Global Constraints

- 当前只获准写设计和计划。本文所有复选框均待人工批准后执行；写在本文的命令和代码不是本轮执行授权。
- 工作目录：`/Users/eric/Desktop/任务书/淘金游戏`。以下文件表使用仓库相对路径，全部相对于此绝对目录。
- 设计：`docs/superpowers/specs/2026-09-08-story-keyframe-reuse-map-design.md`；若计划与设计冲突，停止对应任务，先解决文档差异。
- `src/demo/redesignedStory.ts` 全文件保持不变，包括原有 keyframe 字段；未来通过独立的展示映射撤下旧主图，不改正式剧情、时间、选择或结果。
- 不删除、覆盖、移动、改名任何历史素材，也不把旧提示词、字幕和对白随图片继承。
- 不生成、裁切、重绘、去水印或修改图片/视频。本计划仅在实施获批后新增字节相同的展示副本。
- `legacy-candidates/` 和 `review-only/` 都不是 Pavo 生产输入目录；不得创建生产放行或生成任务。
- 无 Pavo 水印、无冲突、无待证实、无未解连续性问题，才可能获得非审查区展示资格。候选不等于人工通过。
- 不要求单帧呈现全部事实；外部已建立事实必须指向具体正式对白、相邻镜头或 Web 文字。待补拍不能作为已建立证据。
- 不改变 4×3→34 结构、路径 ID、F 分类用途、时间、选择或确定结果。
- 所有 shell 命令使用 rtk 前缀。禁止 git add . 或提交既存未跟踪文件；每次只暂存列明的任务文件。

## 已核实基线与允许范围

设计修订前基线提交：`4afb77eeed9f176684cfd9832c4df6793737941f`。

正式剧情 SHA-256：`4ba27d2c4bcae0bf2904b714900935296651d1fb58ac06dae408d577f13e8ad6`。执行开始时若不同，停止实施并请人工确认新基线；不得自行刷新期望值以使测试通过。

现页面 `src/components/StoryMapPage.tsx` 的 Frame 直接使用 node.keyframe；INTRO/PRIMARY、A0/A1/A2/A3/B0/C0/D0 仍有旧主图，均须通过展示层撤下。现页面测试位于 `src/components/StoryMapPage.test.tsx`，样式在 `src/styles.css`，测试采用服务端渲染。

本批必须枚举：`public/images/choice-frames/` 顶层旧 PNG/WebP，及 `短剧制作资料/09_路线制作包/` 下全部 PNG/JPG/WebP 图片（含首帧、目标帧、已提取真实帧）。既有视频只记录关联来源，不复制、不抽帧。发现未审图片先列仅审查，不推断可用。源文件集合包括未跟踪的旧图，但提交仅包含新副本，不把旧源图纳入暂存。

### 文件责任表（仅未来实施）

| 文件 | 操作 | 职责 |
| --- | --- | --- |
| `src/demo/keyframeReuse.types.ts` | 新增 | 六阶段、四维、八项核对及资产/用途结构 |
| `src/demo/keyframeReuseManifest.json` | 新增 | 单一资产与用途清单、源/目标哈希；不改正式剧情 |
| `src/demo/keyframeReuse.ts` | 新增 | 纯准入、筛选、候选选择函数 |
| `src/demo/keyframeReuse.test.ts` | 新增 | 准入拒绝、多用途与筛选测试 |
| `src/demo/storyBaseline.test.tsx` | 新增 | 字节、34路径、渲染无突变回归 |
| `scripts/keyframe-reuse-assets.mjs` | 新增 | 只读盘点/验证、显式无覆盖复制 |
| `scripts/keyframe-reuse-assets.test.ts` | 新增 | 哈希不符和覆盖拒绝测试，使用临时文本字节 |
| `src/components/KeyframeReuse.tsx` | 新增 | 主图、审查区和过程区组件 |
| `src/components/KeyframeReuse.test.tsx` | 新增 | 状态、水印、无障碍及审查/过程隔离 |
| `src/components/StoryMapPage.tsx` | 修改 | 所有主图接入新展示映射；详情和筛选连接 |
| `src/components/StoryMapPage.test.tsx` | 修改 | 新文案和撤图回归，保留原剧情断言 |
| `src/styles.css` | 修改 | 仅新增 reuse-* 审查样式 |
| `public/images/choice-frames/legacy-candidates/` | 按清单新增 | 通过用途初审的无水印展示副本 |
| `public/images/choice-frames/review-only/` | 按清单新增 | 只审查副本 |

禁止修改正式剧情文件、正式总控资料、原图片、旧提示词与字幕、依赖版本和路径结构。若 tsconfig 不支持 JSON 导入，读取现配置后采用生成 TS 数据模块替代，先记录这一纯数据格式调整，不改变剧情模块。

## Task 1：固定剧情基线并先写展示拒绝测试

**Files:** 新增 `src/demo/storyBaseline.test.tsx`；修改 `src/components/StoryMapPage.test.tsx`。

**Interfaces:** 消费现有 REDESIGNED_STORY、getTerminalPathCount、validateRedesignedStory 和 StoryMapPage；产出不可改剧情的回归闸门。

- [ ] 检查 `rtk git status --short`，记录已有改动，不暂存它们；确认人工实施批准。
- [ ] 新增以下剧情基线测试；此保护测试预期先通过，后续不得更新 SHA 常量。

```tsx
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { REDESIGNED_STORY, getTerminalPathCount, validateRedesignedStory } from './redesignedStory'
import { StoryMapPage } from '../components/StoryMapPage'

it('keeps formal source bytes and all 34 paths unchanged', () => {
  const bytes = readFileSync('src/demo/redesignedStory.ts')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(
    '4ba27d2c4bcae0bf2904b714900935296651d1fb58ac06dae408d577f13e8ad6',
  )
  const before = JSON.stringify(REDESIGNED_STORY)
  renderToStaticMarkup(<StoryMapPage />)
  expect(JSON.stringify(REDESIGNED_STORY)).toBe(before)
  expect(getTerminalPathCount()).toBe(34)
  expect(validateRedesignedStory()).toEqual([])
  const paths = REDESIGNED_STORY.routes.flatMap(r => r.outcomes.flatMap(o => o.finales))
  expect(new Set(paths.map(p => p.id)).size).toBe(34)
  expect(new Set(paths.map(p => p.video)).size).toBe(34)
})
```

- [ ] 在现有页面测试末尾添加失败用例，不删除原有路径/时间/结果断言。

```tsx
it('withdraws legacy main frames and distinguishes script and image review', () => {
  const html = renderToStaticMarkup(<StoryMapPage />)
  expect(html).not.toContain('alt="本节点已有关键帧"')
  expect(html).toContain('未绑定合格帧')
  expect(html).toContain('该校验不覆盖图片事实和声画连续性')
  expect(html).toContain('历史关键帧复用审查')
  for (const node of ['INTRO', 'PRIMARY', 'A0', 'A1', 'A2', 'A3', 'B0', 'C0', 'D0']) {
    expect(html).toContain(`data-main-node="${node}"`)
  }
})
```

- [ ] 运行 `rtk proxy npx vitest run src/demo/storyBaseline.test.tsx src/components/StoryMapPage.test.tsx`。预期基线测试通过、新展示测试因旧文案/缺新区域失败，记录真实失败原因。
- [ ] 独立测试提交：只暂存上述两文件，`rtk git commit -m "test: lock story baseline and keyframe display requirements"`。此测试先行提交允许包含已记录的预期红测；不可部署，必须由后续实现转绿。

## Task 2：资产清单、四维模型及准入函数

**Files:** 新增 types、manifest、keyframeReuse 模块及对应测试。

**Interfaces:** `canShow(asset, usage, placement)`、`getMain(nodeId, manifest)`、`getProcesses(nodeId, manifest)`、`getReviewAssets(filter, manifest)`；manifest 是唯一展示数据来源，不写入 REDESIGNED_STORY。

- [ ] 定义以下结构（`keyframeReuse.types.ts`）；八项核对必须完整，不接受空记录默认通过。

```ts
export const STAGES = ['公共入口', '节点决策状态', '行动开始', '行动过程', '直接后果', '独立终局'] as const
export const CHECKS = ['时间', '地点', '人物', '装备', '伤势', '样本/资料', '天气', '不可逆后果'] as const
export type Stage = typeof STAGES[number]
export type CheckName = typeof CHECKS[number]
export type Placement = 'main' | 'process' | 'review'
export type Check = { result: 'visible' | 'external' | 'pending' | 'conflict'; evidence: string }
export type Asset = {
  id: string; version: string; sourcePath: string; sourceSha256: string
  origin: 'target-image' | 'video-frame' | 'legacy-image'
  videoSource?: string; timecode?: string
  watermark: 'none' | 'pavo' | 'unknown'
  plannedTargetPath?: string
  copy?: { targetPath: string; targetSha256: string; verified: boolean }
}
export type Usage = {
  id: string; assetId: string; nodeId: string; shotId: string
  stage: Stage; action: string
  judgment: '候选待审' | '仅作参考' | '禁止用于该节点'
  repair: '无需修复待验' | '可裁切待复核' | '可局部重绘待复核' | '需换帧'
  acceptance: '未验收' | '关键帧已验收' | '视频待验收' | '视频已验收'
  checks: Record<CheckName, Check>
  continuityIssues: string[]; conflicts: string[]
  stageMatchesNode: boolean; placement: Placement
  reviewEvidence?: { objectVersion: string; reviewer: string; date: string; evidence: string }
}
export type Manifest = { assets: Asset[]; usages: Usage[] }
```

本批只使用图片且 acceptance 全部未验收；视频两值留给将来视频对象，不允许出现在本批 manifest。JSON 加载后由盘点验证器检查枚举、必填字段、唯一 ID、引用、阶段匹配和路径范围，不依赖 TypeScript 断言保证输入有效。清单加载时也必须运行相同结构检查，异常显示审查数据错误并拒绝绑定；不能只在复制脚本运行时检查。

- [ ] 先添加下列测试，再运行定向测试观察模块缺失或资格计算错误。测试命令为 `rtk proxy npx vitest run src/demo/keyframeReuse.test.ts`，预期新模块尚未实现时失败。

```ts
import { expect, it } from 'vitest'
import { CHECKS, type Asset, type Usage } from './keyframeReuse.types'
import { canShow, getMain } from './keyframeReuse'
const a: Asset = { id: 'test', version: '1', sourcePath: 'test.png', sourceSha256: 'a'.repeat(64), origin: 'target-image', watermark: 'none', copy: { targetPath: 'public/images/choice-frames/legacy-candidates/test.png', targetSha256: 'a'.repeat(64), verified: true } }
const u: Usage = { id: 'test-use', assetId: 'test', nodeId: 'D1', shotId: 'decision', stage: '节点决策状态', action: '等待结束后的撤收准备', judgment: '候选待审', repair: '无需修复待验', acceptance: '未验收', checks: Object.fromEntries(CHECKS.map(k => [k, { result: 'external', evidence: `D1 正式 facts：${k}，仅测试夹具` }])) as Usage['checks'], continuityIssues: [], conflicts: [], stageMatchesNode: true, placement: 'main' }
it('allows a reviewed D1 decision candidate without declaring acceptance', () => {
  expect(canShow(a, u, 'main')).toBe(true)
  expect(u.acceptance).toBe('未验收')
})
it('rejects watermarks outside review', () => {
  expect(canShow({ ...a, watermark: 'pavo' }, u, 'main')).toBe(false)
  expect(canShow({ ...a, watermark: 'pavo' }, { ...u, placement: 'process', stage: '行动过程' }, 'process')).toBe(false)
})
it('rejects conflict, pending evidence, repairs and continuity problems', () => {
  expect(canShow(a, { ...u, conflicts: ['同岸不是对岸'] }, 'main')).toBe(false)
  expect(canShow(a, { ...u, continuityIssues: ['袖口错误'] }, 'main')).toBe(false)
  expect(canShow(a, { ...u, repair: '可裁切待复核' }, 'main')).toBe(false)
  expect(canShow(a, { ...u, checks: { ...u.checks, 时间: { result: 'pending', evidence: '' } } }, 'main')).toBe(false)
})
it('does not promote an A2 departure reference into decision main', () => {
  const ref: Usage = { ...u, id: 'a2-process', nodeId: 'A2', stage: '行动开始', judgment: '仅作参考', placement: 'process', stageMatchesNode: false }
  const denied: Usage = { ...u, id: 'a2-main', nodeId: 'A2', judgment: '禁止用于该节点' }
  expect(canShow(a, ref, 'process')).toBe(true)
  expect(getMain('A2', { assets: [a], usages: [ref, denied] })).toBeUndefined()
})
it('does not inherit eligibility from a review-only path or mismatched hash', () => {
  expect(canShow({ ...a, copy: { ...a.copy!, targetPath: 'public/images/choice-frames/review-only/test.png' } }, u, 'main')).toBe(false)
  expect(canShow({ ...a, copy: { ...a.copy!, targetSha256: 'b'.repeat(64) } }, u, 'main')).toBe(false)
})
```

- [ ] 实现纯函数，核心实现如下；`getReviewAssets` 去重资产，公共素材在路线过滤下保留，旧 X/F 只在全部视图显示。

```ts
import { CHECKS, type Asset, type Usage, type Manifest, type Placement } from './keyframeReuse.types'
export function canShow(a: Asset, u: Usage, p: Placement): boolean {
  if (u.assetId !== a.id || !a.copy?.verified || a.copy.targetSha256 !== a.sourceSha256) return false
  if (p === 'review') return true
  if (u.placement !== p || a.watermark !== 'none' || u.judgment === '禁止用于该节点') return false
  if (!a.copy.targetPath.startsWith('public/images/choice-frames/legacy-candidates/')) return false
  if (u.repair !== '无需修复待验' || u.continuityIssues.length || u.conflicts.length) return false
  if (!CHECKS.every(k => ['visible', 'external'].includes(u.checks[k]?.result) && u.checks[k]?.evidence.trim())) return false
  if (p === 'process') return ['行动开始', '行动过程'].includes(u.stage)
  return u.judgment === '候选待审' && u.stageMatchesNode && ['公共入口', '节点决策状态', '直接后果', '独立终局'].includes(u.stage)
}
export function getMain(nodeId: string, m: Manifest) {
  const rows = m.usages.flatMap(usage => {
    const asset = m.assets.find(a => a.id === usage.assetId)
    return usage.nodeId === nodeId && asset && canShow(asset, usage, 'main') ? [{ asset, usage }] : []
  })
  return rows.length === 1 ? rows[0] : undefined
}
export function getProcesses(nodeId: string, m: Manifest) {
  return m.usages.flatMap(usage => {
    const asset = m.assets.find(a => a.id === usage.assetId)
    return usage.nodeId === nodeId && asset && canShow(asset, usage, 'process') ? [{ asset, usage }] : []
  })
}
export function getReviewAssets(filter: string, m: Manifest) {
  const ids = new Set(m.usages.filter(u => filter === 'ALL' || ['INTRO', 'PRIMARY'].includes(u.nodeId) || u.nodeId.startsWith(filter)).map(u => u.assetId))
  return m.assets.filter(a => filter === 'ALL' || ids.has(a.id))
}
```

- [ ] 逐文件读图填写 manifest，完整列源路径与 SHA；未复制无 copy 字段。不能把测试夹具的 evidence 写进真实清单。未逐项证实时填 pending，watermark 未知填 unknown；所有现有明显问题仅审查。A2整装图同时建立参考与禁止主图两条用途，D1为节点决策状态。X/F不创造正式节点或终局，历史标识只服务审查筛选。
- [ ] 增加真清单断言：资产 ID/用途 ID 唯一；引用存在；CHECKS 八项齐全；阶段合法；所有 acceptance=未验收；所有资产源 SHA 为64位十六进制；任一目标节点最多一个 main；旧 X/F 没有 main 用途；设计表各素材都有源记录。检查未通过时不猜测修复。
- [ ] 运行 `rtk proxy npx vitest run src/demo/keyframeReuse.test.ts src/demo/storyBaseline.test.tsx`，预期全部通过；只有 Task 1 的页面新行为测试仍可红。
- [ ] 独立提交这四个新增数据/模型文件，提交信息 `feat: add audited keyframe manifest and eligibility rules`，不包含任何图片或正式剧情文件。

## Task 3：无覆盖资产复制与全副本哈希核验

**Files:** 新增 scripts 两文件；更新 manifest 的 copy 记录；新增两个展示目录中的清单副本。

**Interfaces:** CLI `node scripts/keyframe-reuse-assets.mjs inventory|verify|copy`；inventory/verify 只读输出，copy 是人工实施获准后才能使用的显式模式。每个资产在 manifest 的 plannedTargetPath 预填目标计划，不依据文件名推断阶段；copy 只消费已审定的目标计划。copy 成功后新增 copy 对象，targetPath 必须等于 plannedTargetPath。没有目标计划的资产不复制，保留仅清单记录。

- [ ] 先用临时目录内的文本字节测试 `copyExact(source, target, expectedSha)`：源哈希不符拒绝；目标存在且不同拒绝；已存在且相同不重写；新目标复制后哈希一致。测试不创建或修改任何图片。
- [ ] 核心复制函数使用以下实现，供 CLI 和测试共用，CLI 入口用 `import.meta.url` 与启动脚本 URL 比较，导入测试不执行复制。

```js
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { readFile, copyFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
export const sha = bytes => createHash('sha256').update(bytes).digest('hex')
export async function copyExact(source, target, expectedSha) {
  if (sha(await readFile(source)) !== expectedSha) throw new Error('source hash mismatch')
  await mkdir(dirname(target), { recursive: true })
  try { await copyFile(source, target, constants.COPYFILE_EXCL) }
  catch (error) { if (error.code !== 'EEXIST') throw error }
  const targetSha256 = sha(await readFile(target))
  if (targetSha256 !== expectedSha) throw new Error('target collision or hash mismatch')
  return targetSha256
}
```

- [ ] 测试代码至少包含以下拒绝覆盖用例（在 describe 外导入 mkdtemp/readFile/writeFile/rm、tmpdir、join、copyExact、sha 及 Vitest）。

```ts
it('preserves an existing different target', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'reuse-copy-test-'))
  try {
    const source = join(dir, 'source.txt'), target = join(dir, 'target.txt')
    await writeFile(source, 'source'); await writeFile(target, 'existing')
    await expect(copyExact(source, target, sha(Buffer.from('source')))).rejects.toThrow('target collision')
    expect(await readFile(target, 'utf8')).toBe('existing')
    expect(await readFile(source, 'utf8')).toBe('source')
  } finally { await rm(dir, { recursive: true, force: true }) }
})
```

- [ ] CLI inventory 使用 fs.readdir 递归枚举本批源目录（排除两个新副本目录），按路径排序并逐文件计算 sha；输出记录，不写原目录。将原件列表和源哈希保存在 manifest，供结束时完整比对，检查新增/丢失路径与字节变化。
- [ ] CLI verify 校验源路径位于两批准源根下、目标位于两个批准副本根下；路径使用 resolve/realpath 验证，不允许 `..` 或符号链接绕出根目录。检查所有枚举、证据、源/目标哈希、资产引用、阶段与正式节点兼容性；缺失文件或冲突路径返回非零。
- [ ] CLI copy 默认拒绝未登记目标。为每张仅审查图选择 `review-only/<asset-id>.<原扩展名>`；通过主图/过程用途初审的无水印图选择 `legacy-candidates/<asset-id>.<原扩展名>`。不通过“在 candidates 目录”反推主图资格。零合格候选是允许结果。
- [ ] 运行 `rtk proxy npx vitest run scripts/keyframe-reuse-assets.test.ts`，先观察预期失败，再补齐 CLI 和核心函数，复跑通过。
- [ ] 先 `rtk proxy node scripts/keyframe-reuse-assets.mjs inventory`，人工对照完整本批清单；然后 copy，逐项填实际 targetSha256；再 verify，预期全副本源/目标一致、原件不变。任一失败停止绑定，不删除碰撞文件。
- [ ] 独立提交脚本、测试、manifest 和清单列出的新增副本，提交信息 `chore: add traceable review copies of legacy frames`。逐文件暂存，不暂存源素材、不夹带 Web 改动。

## Task 4：测试先行实现主图、审查区和过程组件

**Files:** 新增 `src/components/KeyframeReuse.tsx`、同名测试；修改 `src/styles.css`。

**Interfaces:** `MainFrame({nodeId, scene})`、`ReuseReview({filter})`、`ProcessMaterials({nodeId})`。三个组件读取同一个经过验证的 manifest 与 Task 2 函数，禁止消费 node.keyframe。

- [ ] 先写服务端渲染测试：MainFrame 对现有九节点不能有旧主图；审查区有原水印说明；过程区排除水印、pending、冲突和连续性未解文件；可见文字和 alt 保持同一状态。

```tsx
it('keeps the A2 departure reference out of decision main', () => {
  const html = renderToStaticMarkup(<MainFrame nodeId="A2" scene="正式 A2 状态" />)
  expect(html).toContain('data-main-node="A2"')
  expect(html).toContain('未绑定合格帧')
  expect(html).not.toContain('<img')
})
it('discloses audit limitations', () => {
  const html = renderToStaticMarkup(<ReuseReview filter="ALL" />)
  expect(html).toContain('历史关键帧复用审查')
  expect(html).toContain('未验收')
  expect(html).toContain('Pavo水印')
  expect(html).not.toContain('本节点已有关键帧')
})
```

测试通过显式 import 引用 MainFrame/ReuseReview；扩展测试注入 manifest 夹具时可给三个组件增加可选 `manifest` 属性，默认真实清单，所有接口统一使用该名称。

- [ ] 主图实现使用以下完整选择逻辑；本批图片不提供已验收升级 UI。

```tsx
export function MainFrame({ nodeId, scene, manifest = data }: { nodeId: string; scene: string; manifest?: Manifest }) {
  const row = getMain(nodeId, manifest)
  const [failed, setFailed] = useState(false)
  const hasLegacy = manifest.usages.some(u => u.nodeId === nodeId)
  return <div data-main-node={nodeId} className="reuse-main">
    {row && !failed ? <>
      <img className="story-map-frame" src={row.asset.copy!.targetPath.replace(/^public/, '')}
        alt={`${nodeId} ${row.usage.stage}：候选已绑定·未验收；${row.usage.action}`}
        onError={() => setFailed(true)} />
      <span className="reuse-candidate">候选已绑定·未验收</span>
    </> : <div className="story-map-frame story-map-frame-missing">
      <strong>{failed ? '素材无法加载·仍未验收' : '未绑定合格帧'}</strong>
      <span>{hasLegacy ? '有旧素材待审' : '暂无已登记旧素材'}</span><span>{scene}</span>
    </div>}
  </div>
}
```

组件文件导入 useState、Task 2 的函数及类型、JSON data；JSON 只能在通过验证器之后导入，不能用空数组掩盖错误。主图在详情中使用 `key={detail.id}` 防止错误加载状态跨节点继承。

- [ ] ReuseReview 对 `getReviewAssets(filter, manifest)` 按资产渲染 article，每图一个 `data-review-asset`；图片显示条件为存在 verified copy 且源目标哈希相同。图下列出该图各用途的 nodeId/stage/action/judgment/repair/acceptance、八项 evidence、conflicts/continuityIssues、源路径和目标路径与两个哈希。水印原样保留；未复制显示“未复制·仅清单”，不回退原路径。图片加载失败显示明确未验收占位。
- [ ] ProcessMaterials 使用 getProcesses 输出合格过程图片，并固定显示“历史过程参考·未验收，不代表本节点完成状态”。其余属于该节点但不能进过程区的参考文件仅输出链接 `href="#reuse-review"`，文字“查看历史素材审查”；不嵌入其图片。没有合格过程图时显示“暂无通过过程展示初审的图片”。
- [ ] 所有图片使用动作与判断构建 alt，禁用图文案为“禁止用于该节点：具体用途”；未绑定候选为“候选待审·未绑定”。不依据文件存在或路径名展示绿色通过状态。
- [ ] 添加以下作用域样式，不改已有剧情卡布局：

```css
.reuse-candidate { color: #e3c279; border: 1px solid currentColor; padding: .2rem .45rem; }
.reuse-review { margin: 1rem auto; max-width: 112rem; padding: 1rem; border: 1px solid #6c737b; }
.reuse-review-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: 1rem; }
.reuse-review img, .reuse-process img { display: block; width: 100%; height: auto; object-fit: contain; }
.reuse-review article { overflow-wrap: anywhere; padding: .75rem; border: 1px solid #616971; }
.reuse-review dt { font-weight: 700; }
.reuse-review dd { margin: .25rem 0 .65rem; }
.reuse-review .reuse-denied { color: #f1a394; }
```

- [ ] 运行 `rtk proxy npx vitest run src/components/KeyframeReuse.test.tsx src/demo/keyframeReuse.test.ts`，预期通过。测试补充按每个实际用途计算允许集合，验证过程 HTML 不含被拒绝 asset ID，不能仅检查标签存在。
- [ ] 独立提交组件、测试与作用域样式，提交信息 `feat: separate keyframe review and process displays`。

## Task 5：页面接入与错误主图撤下，保持剧情字节不变

**Files:** 修改 `src/components/StoryMapPage.tsx`、`src/components/StoryMapPage.test.tsx`；不修改 `src/demo/redesignedStory.ts`。

**Interfaces:** 消费 MainFrame、ReuseReview、ProcessMaterials；保留所有现有正式剧情读取与 finale 渲染。

- [ ] 扩展 Task 1 红测：为节点卡和详情验证都只走 MainFrame。服务端检查所有 `data-main-node` 区域不含旧水印 URL，审查区可以含对应副本；不要对整个页面断言不存在图片，因为审查区需要展示它们。
- [ ] 在页面顶部导入新组件，删除旧 Frame 函数；移除 ReviewDetail 的 keyframe 属性和三个构建详情对象时的 keyframe 赋值，仅改变展示数据传递，不修改 scene/facts/time/result。
- [ ] 三类入口（SituationCard、OutcomeCard、公共入口）统一替换为：

```tsx
<MainFrame nodeId={node.id} scene={node.scene} />
```

- [ ] DetailPanel 主图替换为下面两项，保留后续正式事实与终局内容：

```tsx
<MainFrame key={detail.id} nodeId={detail.id} scene={detail.scene} />
<ProcessMaterials nodeId={detail.id} />
```

- [ ] 在 `<AuditOverview />` 后添加 `<ReuseReview filter={filter} />`；在 AuditOverview 的原声画验收提示旁追加：

```tsx
<span>该校验不覆盖图片事实和声画连续性</span>
```

- [ ] 将页面测试中针对旧占位“关键帧待生成”的断言换为“未绑定合格帧”，保留剧情状态文案与全部路径断言。关键帧制作状态本身仍可写待生成，不全局替换正式数据文字。
- [ ] 运行 `rtk proxy npx vitest run src/components/StoryMapPage.test.tsx src/components/KeyframeReuse.test.tsx src/demo/keyframeReuse.test.ts src/demo/storyBaseline.test.tsx src/demo/redesignedStory.test.ts`。预期所有测试通过，包括 Task 1 红测转绿。
- [ ] 用 `rtk git diff -- src/demo/redesignedStory.ts` 确认零差异；独立提交页面和页面测试，提交信息 `feat: bind story map frames through audited presentation mapping`。

## Task 6：完整验证、浏览器验收与交付边界

**Files:** 不新增功能；只修复本计划文件范围内测试发现的问题。不得更新剧情基线或修改素材来迎合断言。

- [ ] 运行 `rtk proxy node scripts/keyframe-reuse-assets.mjs verify`，预期所有源与副本匹配；与 Task 3 inventory 对照原素材列表，源路径和源字节无变化。
- [ ] 运行 `rtk proxy npm test -- --run`，预期全量通过；再运行 `rtk proxy npm run build`，预期 TypeScript 与 Vite 构建成功。若失败记录真实错误、仅在授权文件内修复后重跑，不声称未运行检查通过。
- [ ] 使用浏览器访问 `http://127.0.0.1:5173/docs/story-map/`，依次检查全部/A/B/C/D筛选、INTRO/A2/B1/B3/C3/D1/D2详情、审查入口和关闭详情。确认九个旧主图撤下、水印只在审查区、无水印候选也未标已验收。
- [ ] 检查窄屏布局、键盘 Tab/Enter 操作、图片 alt、色彩之外的状态文字、审查完整图幅；图片加载错误用组件测试模拟 onError，再在浏览器确认错误占位没有回退旧图。对每个交互观察 DOM/画面，不以 SSR 测试替代点击验收。
- [ ] 检查 D1 仍为等待后的决策状态、A2整装只审查、34条独立终局及 F 分类未变。确认未新建 Pavo 输入资产或生成任务。
- [ ] 运行 `rtk git diff --check`、`rtk git status --short`，查看每个独立提交的文件列表；未跟踪旧源图和交付目录不得夹带。若需修复，单独提交修复和对应回归测试，不合并文档、原件或剧情修改。
- [ ] 报告各提交号、实际测试/构建结果、浏览器检查结果、绑定数/仅审查数和未解决事项。没有合格主图时如实报告0；不扩大为素材或视频正式放行。

## 独立提交边界

| 提交 | 允许内容 | 禁止夹带 |
| --- | --- | --- |
| 本次文档提交 | 修订设计＋本计划 | 所有代码、图片、副本和清单数据 |
| 1 测试基线 | 剧情只读保护＋展示红测 | 正式剧情和图片 |
| 2 模型清单 | 数据类型、准入、清单及测试 | 图片和页面 |
| 3 审查副本 | 无覆盖脚本、清单哈希、新副本及测试 | 原素材、页面和生产资产 |
| 4 展示组件 | 审查/过程/主图组件、样式与测试 | 正式剧情 |
| 5 页面接入 | 页面展示映射、页面回归 | 正式剧情、素材修复 |
| 6 验收修复（确有必要时） | 验收发现的授权范围修复和回归 | 无关重构和放宽基线 |

Task 1 红测提交只服务测试先行，不是可交付版本；最终交付前必须全绿并构建成功。不推送、部署或运行本计划，直到人工批准实施。

## 计划自审与人工闸门

- 设计十项要求分别由 Task 2（六阶段/八项/多用途/D1/A2）、Task 3（目录/哈希/原件）、Task 4—5（水印/区域/文案/撤图）、Task 1和6（正式剧情不变/全量验证）覆盖。
- 本轮只保存两份 Markdown；本文列出的模型代码、测试和复制命令均未执行。
- 枚举、接口和动作字段名称保持一致；真实素材的证据与哈希须在获批实施时采集，本文不伪造资产验收结果。
- 人工批准后才开始 Task 1。当前停在设计与计划交付，等待批准。
