# Branch Story Logic Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all twelve secondary branches narratively causal, time-consistent, visibly consequential, and synchronized with the Web ending copy.

**Architecture:** Keep `src/demo/story.ts` as the runtime source of truth and the approved branching design as the narrative source of truth. Each Pavo result prompt uses two 10-second clips: the first executes the decision and the second visibly establishes the outcome that the Web ending reports.

**Tech Stack:** Markdown production scripts, Pavo image-to-video prompts, React 19, TypeScript 5.8, Vitest, Vite.

## Global Constraints

- Preserve four primary routes and three deterministic secondary choices per route.
- Preserve first-person 16:9 live-action cinematic style and the established four characters.
- Do not put generated subtitles or readable document text inside Pavo footage; Web renders subtitles after audio timing is measured.
- Every outcome must expose a defensible strategic tradeoff rather than a correct-answer label.
- Do not alter the accepted A1 two-clip sequence.

---

### Task 1: Lock revised story semantics in tests

**Files:**
- Modify: `src/demo/flow.test.ts`
- Test: `src/demo/flow.test.ts`

**Interfaces:**
- Consumes: `getNode(id: StoryNodeId): StoryNode`
- Produces: regression assertions for B3 and D0/D3 wording and outcomes

- [ ] **Step 1: Add assertions that B3 solves the broken bridge with a personnel-only crossing and that D3 completes registration at the final deadline.**
- [ ] **Step 2: Run `npm test -- --run src/demo/flow.test.ts` and confirm the new assertions fail against the old copy.**

### Task 2: Synchronize Web branch data

**Files:**
- Modify: `src/demo/story.ts`
- Test: `src/demo/flow.test.ts`

**Interfaces:**
- Consumes: approved time ledger in `docs/superpowers/specs/2026-09-01-gold-rush-three-layer-branching-design.md`
- Produces: revised `ROUTE_DEFINITIONS` rendered by the existing story graph

- [ ] **Step 1: Clarify A3 sunk-time wording, B3 crossing mechanism, C0 partner foreshadowing, and D0 day-six quotation.**
- [ ] **Step 2: Rename D3 to cancellation of withdrawal and a light push to registration; change the outcome from partial rights to completed registration with exhausted resources.**
- [ ] **Step 3: Run the focused flow tests and confirm they pass.**

### Task 3: Rewrite every incomplete Pavo result prompt

**Files:**
- Modify: `短剧制作资料/07_Pavo上传素材/图片/A路线_A2_原地扎营等待/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/A路线_A3_20秒最终版/A3_20秒版_Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/B路线_B1_立即涉水强渡/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/B路线_B2_绕行四天/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/B路线_B3_丢弃重型设备/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/C路线_C0_三十六小时窗口/04_Pavo提示词_C0天气窗口.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/C路线_C1_轻装翻山/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/C路线_C2_改走山谷/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/C路线_C3_引入运输伙伴/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/D路线_D0_撤离报价/04_Pavo提示词_D0撤离报价.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/D路线_D1_按计划安全撤离/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/D路线_D2_出售勘探信息/03_分镜描述与Pavo提示词.md`
- Modify: `短剧制作资料/07_Pavo上传素材/图片/D路线_D3_利用窗口重返/03_分镜描述与Pavo提示词.md`

**Interfaces:**
- Consumes: each route situation's real final frame and the approved time ledger
- Produces: two-clip Pavo prompts with an explicit intermediate frame and outcome frame

- [ ] **Step 1: Preserve each existing choice-action frame as the first clip's target/intermediate frame.**
- [ ] **Step 2: Add a second clip with a distinct location/time state and one concise outcome line matching the Web metrics.**
- [ ] **Step 3: Apply the B3 personnel-only bridge, C3 radio foreshadowing, and D2 remote-deal/base-handoff corrections.**
- [ ] **Step 4: Scan all prompts for contradictory days, ownership claims, unexplained arrivals, and more than one outcome line.**

### Task 4: Create the Pavo regeneration manifest

**Files:**
- Create: `短剧制作资料/07_Pavo上传素材/图片/00_二级结果分镜优化与生成顺序.md`

**Interfaces:**
- Consumes: revised prompts from Task 3
- Produces: one ordered checklist of retained frames, frames requiring regeneration, video filenames, and Web destination filenames

- [ ] **Step 1: List A1 as retained and A2–D3 in production order.**
- [ ] **Step 2: Distinguish usable existing first/middle frames from new final frames that must be generated.**
- [ ] **Step 3: Record the stable Web filenames for all twelve outcome clips.**

### Task 5: Verify story and build integrity

**Files:**
- Verify: `src/demo/story.ts`
- Verify: `src/demo/flow.test.ts`
- Verify: all revised Markdown prompt files

**Interfaces:**
- Consumes: Tasks 1–4
- Produces: a tested branch graph and a contradiction-free Pavo script package

- [ ] **Step 1: Run `npm test -- --run`; expect all tests to pass.**
- [ ] **Step 2: Run `npm run build`; expect TypeScript and Vite production build to pass.**
- [ ] **Step 3: Run text scans for the retired phrases `折返三天`, `重返矿区`, and `只保住部分权益`; expect no active-script matches.**
- [ ] **Step 4: Review the final diff and report remaining media-generation work without claiming ungenerated clips are complete.**
