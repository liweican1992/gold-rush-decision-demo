# 《最后十四天》v3.0 剧情逻辑修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复当前 34 条路径中的时间、外部角色、交易标的、报告分类和制作状态矛盾，使 Web 数据与正式文字状态表成为可进入 Pavo 制作包阶段的唯一剧情基线。

**Architecture:** 保留 `src/demo/redesignedStory.ts` 的 4 × 3 → 34 数据结构，以更强的 Vitest 规则锁定剧情不变量；同时在 `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/` 建立对应的文字版状态账本和验收报告。此计划只处理剧情逻辑，不生成关键帧、不复制视频、不创建 34 个 Pavo 节点包。

**Tech Stack:** TypeScript 5.8、Vitest 3、React 19、Markdown。

## Global Constraints

- 正式结构固定为四条一级路线、十二个二级行动、三十四条独立终局。
- D2 只有一个自动交付结果；其余十一个二级节点各有三个第三次选择。
- X1—X3 不进入活跃剧情；F1—F6 只做报告分类。
- 时间统一表示当前行动完成时的状态；超期后不得出现赶路、登记或提交选项。
- 合作运输只出现在 C 路线，竞争者收购只出现在 D 路线。
- 结果必须确定，不使用“可能、也许、或许”。
- 本计划完成前不得生成新关键帧或向 Pavo 投喂。

---

### Task 1: 用失败测试锁定剧情修订

**Files:**
- Modify: `src/demo/redesignedStory.test.ts`
- Test: `src/demo/redesignedStory.test.ts`

**Interfaces:**
- Consumes: `REDESIGNED_STORY`、`validateRedesignedStory()`。
- Produces: A2、D1、D2、F5 与局面生产状态的回归约束。

- [ ] **Step 1: 添加 A2 时间与位置测试**

新增断言：A2 时间必须是 `第4天 · 剩余10天`；场景必须仍在背风雪台；A2-1 的结果是第 13 天提交；A2 场景不得声称已经越岭。

```ts
it('keeps A2 at the morning-after-bivouac decision point', () => {
  const a2 = REDESIGNED_STORY.routes.find((route) => route.id === 'A')!
    .outcomes.find((outcome) => outcome.id === 'A2')!

  expect(a2.time).toBe('第4天 · 剩余10天')
  expect(a2.scene).toContain('背风雪台')
  expect(a2.scene).not.toContain('已经越岭')
  expect(a2.finales.find((item) => item.id === 'A2-1')!.result).toContain('第13天')
})
```

- [ ] **Step 2: 添加 D1 与 D2 因果边界测试**

```ts
it('does not award the opportunity to the D-route buyer without evidence', () => {
  const outcomes = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
  const d1 = outcomes.find((outcome) => outcome.id === 'D1')!
  expect(JSON.stringify(d1)).not.toMatch(/竞争者.*取得机会|机会已被竞争者取得/)
  expect(d1.directResult).toContain('公开竞争')
})

it('keeps D2 transaction scope limited to exploration data', () => {
  const d2 = REDESIGNED_STORY.routes.flatMap((route) => route.outcomes)
    .find((outcome) => outcome.id === 'D2')!
  expect(JSON.stringify(d2)).not.toContain('样本')
  expect(d2.facts).toContain('交易对象是完整勘探资料')
})
```

- [ ] **Step 3: 添加 F5 与制作状态测试**

```ts
it('defines F5 for safety-first withdrawal before or after expiry', () => {
  const f5 = REDESIGNED_STORY.endingTypes.find((ending) => ending.id === 'F5')!
  expect(f5.definition).toContain('人员与可迁移能力优先')
  expect(f5.definition).not.toContain('主动放弃')
})

it('does not mark an incomplete route-situation video as ready', () => {
  const situations = REDESIGNED_STORY.routes.map((route) => route.situation)
  expect(situations.find((item) => item.id === 'A0')!.status).toBe('partial')
  expect(situations.find((item) => item.id === 'B0')!.status).toBe('partial')
  expect(situations.find((item) => item.id === 'C0')!.status).toBe('rebuild')
  expect(situations.find((item) => item.id === 'D0')!.status).toBe('rebuild')
})
```

- [ ] **Step 4: 运行测试并确认红灯**

Run: `rtk npm test -- --run src/demo/redesignedStory.test.ts`

Expected: A2、D1、D2、F5 和 A0/B0 状态断言失败；原有 10 项测试仍可收集。

### Task 2: 修复 Web 剧情数据和校验器

**Files:**
- Modify: `src/demo/redesignedStory.ts`
- Modify: `src/demo/redesignedStory.test.ts`

**Interfaces:**
- Consumes: Task 1 的回归测试。
- Produces: 修订后的 `REDESIGNED_STORY` 与能主动拦截旧逻辑回归的 `validateRedesignedStory()`。

- [ ] **Step 1: 扩展路线局面生产状态类型**

将 `StorySituation.status` 改为复用 `StoryProductionStatus`，允许 A0、B0 使用 `partial`。

```ts
export type StorySituation = {
  // existing fields
  status: StoryProductionStatus
  keyframe?: string
}
```

- [ ] **Step 2: 修订 A2 状态与三个结果镜头**

将 A2 固定为第 4 天、剩余 10 天的背风雪台决策点；明确轻装九天可达、资料组八天可达、带齐重装无可靠期限余量。A2-1 从雪台封存设备后出发，A2-2 从雪台分组，A2-3 保留重装并按安全节奏前进直至窗口关闭。

- [ ] **Step 3: 修订 D1、D2 和 F5**

删除 D1 的“竞争者已经取得机会”，统一为当前优先机会终止并进入公开竞争；D2 全部字段删除实体样本交付，只保留完整勘探资料；F5 定义改为人员与可迁移能力优先的安全撤离。

- [ ] **Step 4: 修订 A0、B0 制作状态**

A0 与 B0 均标记为 `partial`；说明 A0 缺背风事实段，B0 新版成片仍等待完整声音与画面复核。C0、D0 继续为 `rebuild`。

- [ ] **Step 5: 强化自动校验器**

在 `validateRedesignedStory()` 增加以下错误：

```ts
if (outcomeById.get('A2')?.time !== '第4天 · 剩余10天') errors.push('A2 must remain at the morning-after-bivouac decision point')
if (/竞争者.*取得机会|机会已被竞争者取得/.test(JSON.stringify(outcomeById.get('D1')))) errors.push('D1 invents competitor ownership')
if (/样本/.test(JSON.stringify(outcomeById.get('D2')))) errors.push('D2 transaction scope must remain exploration data only')
```

并校验 F5 定义与四个局面生产状态。

- [ ] **Step 6: 运行单文件测试并确认绿灯**

Run: `rtk npm test -- --run src/demo/redesignedStory.test.ts`

Expected: 测试文件全部通过，`validateRedesignedStory()` 返回空数组。

### Task 3: 同步导演地图和正式文字状态账本

**Files:**
- Modify: `src/components/StoryMapPage.test.tsx`
- Modify: `src/components/StoryMapPage.tsx`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/00_唯一入口.md`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/01_正式时间线与状态总表.md`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/02_34条路径总表.md`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/06_剧情验收报告.md`
- Modify: `短剧制作资料/01_剧情脚本/README_当前剧本入口.md`
- Modify: `短剧制作资料/README.md`

**Interfaces:**
- Consumes: 修订后的 `REDESIGNED_STORY`。
- Produces: Web 可见的新状态和制作人员可读的唯一剧情基线。

- [ ] **Step 1: 添加导演地图文案回归测试**

断言静态 HTML 包含 `第4天 · 剩余10天`、`进入公开竞争`、`交易对象是完整勘探资料`，且不包含 `机会已被竞争者取得`、D2 样本交付或 A0/B0 的“已完成”状态。

- [ ] **Step 2: 更新状态标签**

保持 `partial` 显示为“已有主体 · 需补事实段或完成复核”，使 A0、B0 与 A/B 二级节点不会被误报为可直接生成。

- [ ] **Step 3: 写入正式状态总表**

状态总表逐节点列出进入时间、行动完成时间、位置、人员、资料、样本、设备、补给、外部角色、下一选择依据和不可逆后果。三十四条路径总表逐条列出父节点、第三次选择、确定结果、F 分类和独立视频名。

- [ ] **Step 4: 写入验收报告与入口**

验收报告逐项说明已修复问题、仍属于视频生产问题的项目，以及“剧情通过不等于成片通过”。根 README 和当前剧本入口只指向 v3.0 总控，不再把早期完整互动剧情称为现行唯一版本。

- [ ] **Step 5: 运行导演地图测试**

Run: `rtk npm test -- --run src/components/StoryMapPage.test.tsx src/App.test.ts`

Expected: 两个测试文件全部通过。

### Task 4: 完整验证并提交剧情逻辑基线

**Files:**
- Verify: `src/demo/redesignedStory.ts`
- Verify: `src/demo/redesignedStory.test.ts`
- Verify: `src/components/StoryMapPage.tsx`
- Verify: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/`

**Interfaces:**
- Consumes: Tasks 1—3 的全部产物。
- Produces: 可供下一阶段建立 Pavo 节点文件夹的 `story-locked` 候选基线。

- [ ] **Step 1: 搜索废弃逻辑回流**

Run: `rtk rg -n 'X1|X2|X3|竞争者.*取得机会|机会已被竞争者取得|交易对象.*样本|可能|也许|或许' src/demo/redesignedStory.ts 短剧制作资料/17_正式Pavo制作包_v3.0/00_总控`

Expected: 只允许在明确说明“X1—X3 已废弃”或验收禁止项的文字中出现；活跃路径无命中。

- [ ] **Step 2: 运行完整测试**

Run: `rtk npm test -- --run`

Expected: 所有测试文件和测试项通过，失败数为 0。

- [ ] **Step 3: 运行生产构建**

Run: `rtk npm run build`

Expected: TypeScript 与 Vite 构建退出码为 0。

- [ ] **Step 4: 检查工作区差异**

Run: `rtk git diff --stat && rtk git diff --check`

Expected: 仅包含本阶段剧情、测试、导演地图和 v3.0 总控文档的预期改动；无空白错误。

- [ ] **Step 5: 提交本阶段文件**

```bash
rtk git add src/demo/redesignedStory.ts src/demo/redesignedStory.test.ts src/components/StoryMapPage.tsx src/components/StoryMapPage.test.tsx
rtk git add -f 短剧制作资料/README.md 短剧制作资料/01_剧情脚本/README_当前剧本入口.md 短剧制作资料/17_正式Pavo制作包_v3.0/00_总控
rtk git commit -m "fix: lock v3 story logic"
```
