# 淘金游戏项目归一化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让剧情脚本、17段视频节点、素材状态与 Web Demo 使用同一套 A–D / A1–D3 事实源，并保留缺失视频的可演示降级路径。

**Architecture:** 以 `src/demo/story.ts` 的节点图作为 Web 运行时事实源，以 `短剧制作资料/08_项目清单/` 下的 OpenMontage 兼容 JSON 作为制作事实源；两者使用相同节点 ID、视频文件名和战略指标。主 DOCX 同步该结构，但不承担运行时状态。

**Tech Stack:** React 19、TypeScript 5.8、Vitest、Vite、OpenMontage artifact schemas、python-docx、FFmpeg。

## Global Constraints

- 一级路线固定为 A 立即翻山、B 改走山谷、C 等待48小时预报、D 等待3–4周安全撤离。
- 每条一级路线有一个局面视频和三个二次选择，共17段视频节点。
- 不使用随机事件或伪造投票，不显示“激进型/稳妥型”等诱导标签。
- 视频负责人物、动作、环境与对白；字幕、时间、状态和按钮由 Web 渲染。
- 缺失视频显示剧情概要卡，但不能阻断选择流程。
- 已存在但非真实生成的路线占位视频保留在磁盘，不纳入可播放资产。

---

### Task 1: 建立故事图契约与失败测试

**Files:**
- Modify: `src/demo/story.ts`
- Modify: `src/demo/flow.test.ts`
- Modify: `src/demo/flow.ts`

**Interfaces:**
- Produces: `STORY_NODES`, `getNode(id)`, `validateStoryGraph()`，以及基于 `currentNodeId` 和 `history` 的 reducer。
- Consumes: `INTRO_SUBTITLES` 与固定视频文件名。

- [ ] 编写测试，断言四个一级选项顺序、十二个终点可达、无死链、无诱导标签、缺失视频可降级。
- [ ] 运行 `npm test -- --run src/demo/flow.test.ts`，确认旧三路线实现失败。
- [ ] 实现最小节点图与 reducer，使测试通过。

### Task 2: 同步 Web 交互到两层选择

**Files:**
- Modify: `src/MainlineDemo.tsx`
- Modify: `src/components/RouteChoiceOverlay.tsx`
- Modify: `src/components/RouteResult.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `STORY_NODES` 和 reducer 当前节点。
- Produces: 公共开场、一级选择、路线局面、二次选择、结果页和返回上级流程。

- [ ] 先补 reducer 流程测试，覆盖 A0→A1、B0→B3、返回二次选择和返回一级选择。
- [ ] 更新组件为通用节点渲染，不再依赖扁平 `RouteOption[]`。
- [ ] 删除界面中的战略类型标签，展示事实提示、四项状态与复盘问题。
- [ ] 运行单测和 TypeScript 检查。

### Task 3: 建立 OpenMontage 制作清单

**Files:**
- Create: `短剧制作资料/08_项目清单/故事节点图.json`
- Create: `短剧制作资料/08_项目清单/OpenMontage场景计划.json`
- Create: `短剧制作资料/08_项目清单/OpenMontage素材清单.json`
- Create: `短剧制作资料/08_项目清单/制作状态说明.md`

**Interfaces:**
- Consumes: 17节点设计、真实 Pavo 素材目录和 `public/videos/demo/intro.mp4`。
- Produces: 可校验的节点、scene_plan 与 asset_manifest。

- [ ] 用 FFprobe 记录现有视频的时长、分辨率和编码。
- [ ] 将公共开场标记为已接入；将四个旧路线占位视频标记为 legacy-placeholder；将 A0–D3 标记为待生成。
- [ ] 为每个节点写入 shot_intent、首尾帧契约、状态变化、下一节点和稳定文件名。
- [ ] 使用 OpenMontage JSON Schema 校验 scene_plan 与 asset_manifest。

### Task 4: 同步主分镜文档

**Files:**
- Modify: `短剧制作资料/02_主线分镜/最后十四天_逐镜生成版_大纲与分集分镜.docx`

**Interfaces:**
- Consumes: 故事节点图和制作清单。
- Produces: 唯一 A–D 编号、A0–D3 分镜概要、真实素材状态和真实尾帧规则。

- [ ] 备份原 DOCX。
- [ ] 将“目标尾帧直接作为下一镜首帧”改为“目标尾帧约束生成，真实成片尾帧验收后成为下一镜首帧”。
- [ ] 替换旧一轮四分支章节为完整17节点制作总表。
- [ ] 更新 E02-S03、E02-S04 的完成状态。
- [ ] 渲染全部页面并逐页检查布局。

### Task 5: 全量验证

**Files:**
- Verify: all files above

- [ ] 运行 `npm test -- --run`。
- [ ] 运行 `npm run typecheck`。
- [ ] 运行 `npm run build`。
- [ ] 校验所有故事节点可达、所有视频路径稳定、所有缺失素材有降级描述。
- [ ] 汇总本轮已整理内容与下一批应生成的视频顺序 A0、B0、C0、D0。
