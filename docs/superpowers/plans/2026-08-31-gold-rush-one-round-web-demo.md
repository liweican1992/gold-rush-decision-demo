# Gold Rush One-Round Web Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current linear desktop demo into a one-round interactive movie where A/B/C/D each play a different local video and end on a distinct strategy result, while updating the storyboard DOCX so all four demonstration paths have producible video briefs.

**Architecture:** Keep React/Vite and the existing desktop visual system. Put route copy, video paths, metrics, and result text in one data module; keep phase transitions in a pure reducer; let `MainlineDemo` orchestrate one shared video player, a four-choice overlay, and route result cards. The DOCX remains the production source of truth and gains a compact four-route demo section without deleting the longer B-route material.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Vitest 3, native HTML5 video, Python `python-docx`, bundled LibreOffice renderer.

## Global Constraints

- Desktop Web only; target 1440 × 900 and minimum width 960 px.
- No mobile layout, login, QR code, backend, database, real multiplayer voting, countdown voting, or teacher dashboard.
- Flow is exactly `launch → intro → choice → route video → result`.
- A/B/C/D must each reference a different local video URL and show a different result.
- Result screen must allow “选择其他路线” without replaying the intro.
- Missing video files must degrade to a visible material notice and still allow the result to be viewed.
- Current real production progress is “videos complete through E02-S02”; E02-S03 has keyframes but its video is not complete.
- Preserve existing user assets and unrelated working-tree changes.

---

## File Map

- Create `src/demo/story.ts`: route IDs, shared intro data, four route video mappings, HUD metrics, result copy.
- Create `src/demo/flow.ts`: serializable demo state and pure transition reducer.
- Create `src/demo/flow.test.ts`: route uniqueness and transition tests.
- Create `src/components/DemoVideoStage.tsx`: shared HTML5 video player with loading/error/end callbacks.
- Create `src/components/RouteChoiceOverlay.tsx`: clickable A/B/C/D overlay.
- Create `src/components/RouteResult.tsx`: route-specific result and navigation actions.
- Replace `src/MainlineDemo.tsx`: one-round state-machine orchestration.
- Modify `src/styles.css`: desktop cinema, choice overlay, route lock, result metrics, and error state.
- Create `public/videos/demo/`: stable filenames for intro and four branch clips.
- Modify `短剧制作资料/99_过程文件/逐镜分镜文档生成/build_node_storyboard_doc.py`: truthful progress plus four-route demo production briefs.
- Rebuild `短剧制作资料/02_主线分镜/最后十四天_逐镜生成版_大纲与分集分镜.docx`.

---

### Task 1: Route Data and Pure Flow Reducer

**Files:**
- Create: `src/demo/story.ts`
- Create: `src/demo/flow.ts`
- Create: `src/demo/flow.test.ts`

**Interfaces:**
- Produces: `RouteId`, `RouteOption`, `ROUTES`, `ROUTE_BY_ID`, `INITIAL_HUD`.
- Produces: `DemoState`, `DemoEvent`, `INITIAL_DEMO_STATE`, `reduceDemoState(state, event)`.
- Consumed by: `MainlineDemo`, `RouteChoiceOverlay`, `RouteResult`.

- [ ] **Step 1: Write the failing route and reducer tests**

```ts
import { describe, expect, it } from 'vitest'
import { INITIAL_DEMO_STATE, reduceDemoState } from './flow'
import { ROUTES } from './story'

describe('one-round demo story', () => {
  it('defines four routes with unique videos and results', () => {
    expect(ROUTES.map((route) => route.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(new Set(ROUTES.map((route) => route.video)).size).toBe(4)
    expect(new Set(ROUTES.map((route) => route.resultTitle)).size).toBe(4)
  })

  it('runs launch, intro, choice, route, result, and choose-another', () => {
    const intro = reduceDemoState(INITIAL_DEMO_STATE, { type: 'START' })
    const choice = reduceDemoState(intro, { type: 'INTRO_ENDED' })
    const route = reduceDemoState(choice, { type: 'SELECT_ROUTE', routeId: 'C' })
    const result = reduceDemoState(route, { type: 'ROUTE_ENDED' })
    const back = reduceDemoState(result, { type: 'CHOOSE_ANOTHER' })

    expect(intro.phase).toBe('intro')
    expect(choice.phase).toBe('choice')
    expect(route).toMatchObject({ phase: 'route', selectedRouteId: 'C' })
    expect(result.phase).toBe('result')
    expect(back).toEqual({ phase: 'choice' })
  })

  it('allows a missing video to continue to its result', () => {
    const route = { phase: 'route', selectedRouteId: 'D' } as const
    expect(reduceDemoState(route, { type: 'VIDEO_FAILED' })).toEqual({
      phase: 'result',
      selectedRouteId: 'D',
      videoFailed: true,
    })
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --run src/demo/flow.test.ts`

Expected: FAIL because `./flow` and `./story` do not exist.

- [ ] **Step 3: Implement the route data**

Create four entries with these exact identities and video URLs:

```ts
export type RouteId = 'A' | 'B' | 'C' | 'D'

export type RouteMetrics = {
  days: string
  safety: string
  claim: string
}

export type RouteOption = {
  id: RouteId
  label: string
  decisionType: '保守型' | '激进型' | '稳妥型' | '观望型'
  timeHint: string
  riskHint: string
  video: string
  resultTitle: string
  resultSummary: string
  strategyLesson: string
  metrics: RouteMetrics
  materialStatus: '正式素材' | '临时占位'
}

export const INITIAL_HUD = {
  days: '14 天',
  hand: '旧伤 · 偶发无力',
  weather: '48 小时后可能恶化',
  claim: '待登记',
} as const

export const ROUTES: RouteOption[] = [
  {
    id: 'A',
    label: '再等 3–4 周安全撤离',
    decisionType: '保守型',
    timeHint: '超过矿权期限',
    riskHint: '人身风险最低，但矿权确定失去',
    video: '/videos/demo/route-a-wait.mp4',
    resultTitle: '天气转晴，矿权已经进入拍卖',
    resultSummary: '队伍安全撤离，却错过了十四天登记期限。',
    strategyLesson: '降低行动风险，也可能意味着主动放弃目标。',
    metrics: { days: '超期 14–28 天', safety: '安全', claim: '失去' },
    materialStatus: '临时占位',
  },
  {
    id: 'B',
    label: '立即翻山',
    decisionType: '激进型',
    timeHint: '预计 7–10 天',
    riskHint: '最快，但暴风与左手失力风险最高',
    video: '/videos/demo/route-b-mountain.mp4',
    resultTitle: '风暴提前，队伍被迫轻装冲顶',
    resultSummary: '保住时间窗口，同时承担伤势和设备损失。',
    strategyLesson: '速度优势来自对高不确定性和不可逆代价的承受。',
    metrics: { days: '剩余 4 天', safety: '高风险', claim: '仍可登记' },
    materialStatus: '正式素材',
  },
  {
    id: 'C',
    label: '走山谷',
    decisionType: '稳妥型',
    timeHint: '预计 2–3 周',
    riskHint: '道路稳定，但时间处于临界状态',
    video: '/videos/demo/route-c-valley.mp4',
    resultTitle: '山谷安全，却把期限拖到最后一天',
    resultSummary: '伤手没有恶化，但漫长路线让矿权结果变得不确定。',
    strategyLesson: '稳妥路线减少波动，却不能消除时间约束。',
    metrics: { days: '0–7 天', safety: '较安全', claim: '临界' },
    materialStatus: '临时占位',
  },
  {
    id: 'D',
    label: '等待 48 小时预报',
    decisionType: '观望型',
    timeHint: '先消耗 2 天',
    riskHint: '获得信息，但仍要再次选择路线',
    video: '/videos/demo/route-d-forecast.mp4',
    resultTitle: '预报确认暴风，决定并没有消失',
    resultSummary: '队伍获得了更准确的信息，也只剩十二天。',
    strategyLesson: '信息有价值，但获取信息本身同样消耗时间。',
    metrics: { days: '剩余 12 天', safety: '未知', claim: '待决定' },
    materialStatus: '临时占位',
  },
]

export const ROUTE_BY_ID = Object.fromEntries(
  ROUTES.map((route) => [route.id, route]),
) as Record<RouteId, RouteOption>
```

- [ ] **Step 4: Implement the pure reducer**

```ts
import type { RouteId } from './story'

export type DemoState =
  | { phase: 'launch' }
  | { phase: 'intro' }
  | { phase: 'choice' }
  | { phase: 'route'; selectedRouteId: RouteId }
  | { phase: 'result'; selectedRouteId: RouteId; videoFailed?: boolean }

export type DemoEvent =
  | { type: 'START' }
  | { type: 'INTRO_ENDED' }
  | { type: 'SELECT_ROUTE'; routeId: RouteId }
  | { type: 'ROUTE_ENDED' }
  | { type: 'VIDEO_FAILED' }
  | { type: 'CHOOSE_ANOTHER' }
  | { type: 'RESTART' }

export const INITIAL_DEMO_STATE: DemoState = { phase: 'launch' }

export function reduceDemoState(state: DemoState, event: DemoEvent): DemoState {
  if (event.type === 'RESTART') return INITIAL_DEMO_STATE
  if (state.phase === 'launch' && event.type === 'START') return { phase: 'intro' }
  if (state.phase === 'intro' && event.type === 'INTRO_ENDED') return { phase: 'choice' }
  if (state.phase === 'choice' && event.type === 'SELECT_ROUTE') {
    return { phase: 'route', selectedRouteId: event.routeId }
  }
  if (state.phase === 'route' && event.type === 'ROUTE_ENDED') {
    return { phase: 'result', selectedRouteId: state.selectedRouteId }
  }
  if (state.phase === 'route' && event.type === 'VIDEO_FAILED') {
    return { phase: 'result', selectedRouteId: state.selectedRouteId, videoFailed: true }
  }
  if (state.phase === 'result' && event.type === 'CHOOSE_ANOTHER') return { phase: 'choice' }
  return state
}
```

- [ ] **Step 5: Run the focused tests**

Run: `npm test -- --run src/demo/flow.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/demo/story.ts src/demo/flow.ts src/demo/flow.test.ts
git commit -m "feat: define one-round route flow"
```

---

### Task 2: Interactive Video Components and Main Page

**Files:**
- Create: `src/components/DemoVideoStage.tsx`
- Create: `src/components/RouteChoiceOverlay.tsx`
- Create: `src/components/RouteResult.tsx`
- Replace: `src/MainlineDemo.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `RouteOption`, `RouteId`, `ROUTES`, `ROUTE_BY_ID`, `INITIAL_HUD`, `DemoState`, `reduceDemoState`.
- Produces: a complete desktop interaction with explicit video error recovery.

- [ ] **Step 1: Create the shared video stage**

```tsx
type DemoVideoStageProps = {
  src: string
  badge: string
  onEnded: () => void
  onError: () => void
}

export function DemoVideoStage({ src, badge, onEnded, onError }: DemoVideoStageProps) {
  return (
    <section className="demo-video-stage">
      <video autoPlay key={src} playsInline preload="auto" src={src} onEnded={onEnded} onError={onError} />
      <div className="demo-video-badge"><i />{badge}</div>
    </section>
  )
}
```

- [ ] **Step 2: Create the choice overlay**

Render `ROUTES` as four real buttons. Each button displays `id`, `label`, `timeHint`, `riskHint`, and calls `onSelect(route.id)`. Do not render vote bars, fake people counts, or an automatic countdown.

```tsx
export function RouteChoiceOverlay({ routes, onSelect }: {
  routes: RouteOption[]
  onSelect: (routeId: RouteId) => void
}) {
  return (
    <section className="route-choice-screen">
      <div className="route-choice-heading">
        <span>第一个战略抉择</span>
        <h1>十四天，你选择哪条路？</h1>
      </div>
      <div className="route-choice-grid">
        {routes.map((route) => (
          <button key={route.id} type="button" onClick={() => onSelect(route.id)}>
            <b>{route.id}</b><strong>{route.label}</strong>
            <span>{route.timeHint}</span><small>{route.riskHint}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create the result card**

Render route ID, decision type, result title, result summary, strategy lesson, the three metrics, and a material-warning badge only when `videoFailed` is true or `materialStatus === '临时占位'`. Buttons call `onChooseAnother` and `onRestart`.

- [ ] **Step 4: Replace the linear page with reducer orchestration**

`MainlineDemo` must:

1. use `useReducer(reduceDemoState, INITIAL_DEMO_STATE)`;
2. show the existing launch treatment for `launch`;
3. play `/videos/demo/intro.mp4` for `intro`;
4. show the four-route overlay for `choice`;
5. play `ROUTE_BY_ID[selectedRouteId].video` for `route`;
6. show `RouteResult` for `result`;
7. keep a four-item HUD above `intro`, `choice`, `route`, and `result`;
8. update HUD values from the selected route only on the result page;
9. dispatch `VIDEO_FAILED` when a branch file fails, but dispatch `INTRO_ENDED` when the intro file fails so the teacher can still demonstrate choices.

- [ ] **Step 5: Replace the obsolete B-line CSS block**

Keep the dark-blue/gold visual tokens and desktop minimum width. Add focused selectors for:

```css
.demo-shell
.demo-topbar
.demo-hud
.demo-stage
.demo-video-stage
.route-choice-screen
.route-choice-grid
.route-result
.route-result-metrics
.material-notice
.demo-actions
```

At 960 px and above, `.route-choice-grid` uses four columns. The video uses `object-fit: cover`; choices and results fit inside the stage without page scrolling at 1440 × 900.

- [ ] **Step 6: Run typecheck and focused tests**

Run: `npm run typecheck`

Expected: exit 0 with no TypeScript errors.

Run: `npm test -- --run src/demo/flow.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/components/DemoVideoStage.tsx src/components/RouteChoiceOverlay.tsx src/components/RouteResult.tsx src/MainlineDemo.tsx src/styles.css
git commit -m "feat: add interactive four-route cinema demo"
```

---

### Task 3: Stage Stable Local Video Assets

**Files:**
- Create: `public/videos/demo/intro.mp4`
- Create: `public/videos/demo/route-a-wait.mp4`
- Create: `public/videos/demo/route-b-mountain.mp4`
- Create: `public/videos/demo/route-c-valley.mp4`
- Create: `public/videos/demo/route-d-forecast.mp4`

**Interfaces:**
- Consumed by: exact URLs in `src/demo/story.ts` and `MainlineDemo.tsx`.
- Produces: five distinct local MP4 paths so every button works offline.

- [ ] **Step 1: Create the stable asset directory**

Run: `mkdir -p public/videos/demo`

- [ ] **Step 2: Copy the best available real clip into the intro slot**

Use `短剧制作资料/05_样片与参考/分镜一_豆包样片.mp4` as the current intro. This is a real AI-generated first-person story asset, not a Remotion placeholder.

- [ ] **Step 3: Stage four different local branch clips**

Use the current distinct local videos as replaceable stand-ins:

```text
route-a-wait.mp4      ← public/videos/mainline-ending.mp4
route-b-mountain.mp4  ← public/videos/mainline-storm.mp4
route-c-valley.mp4    ← public/source/mountain-ascent.mp4
route-d-forecast.mp4  ← public/videos/mainline-ascent.mp4
```

Do not delete or overwrite the source files. Future Pavo outputs replace only the five stable files under `public/videos/demo/`.

- [ ] **Step 4: Verify all five files are non-empty and distinct**

Run a checksum command over the five files.

Expected: five paths exist; the four route hashes are not all identical.

- [ ] **Step 5: Commit Task 3**

```bash
git add public/videos/demo
git commit -m "assets: stage one-round demo videos"
```

---

### Task 4: Update the Storyboard DOCX for Four Demonstrable Paths

**Files:**
- Modify: `短剧制作资料/99_过程文件/逐镜分镜文档生成/build_node_storyboard_doc.py`
- Rebuild: `短剧制作资料/02_主线分镜/最后十四天_逐镜生成版_大纲与分集分镜.docx`
- Create backup: `短剧制作资料/99_过程文件/文档备份/最后十四天_逐镜生成版_更新四分支Demo前.docx`

**Interfaces:**
- Consumes: approved one-round design and actual production status.
- Produces: a DOCX that directs the next Pavo work in the right order and gives A/B/C/D one short producible video each.

- [ ] **Step 1: Back up the current DOCX and mark the document edit operation once**

Copy the current master DOCX to the exact backup path, then run the bundled artifact marker with `--operation-kind edit --expected-output-count 1 --output-format docx` immediately before the first authoring command.

- [ ] **Step 2: Correct production status text**

Use this exact progress statement:

```text
实际成片已完成至 E02-S02《四十八小时》；E02-S03《左手》关键帧与Pavo投喂包已完成，但视频仍待生成。Web Demo采用一轮四分支结构，公共开场完成后分别播放A/B/C/D独立结果视频。
```

Set E02-S03 status to `关键帧已完成 · 视频待生成`.

- [ ] **Step 3: Replace the fake-vote wording at E02-S04**

The node remains a neutral video ending with “队长，决定吧”。The Web section must say that the presenter clicks one route; remove text that automatically grows fake votes and always locks B.

Use the official options:

```text
A 再等3–4周安全撤离
B 立即翻山
C 走山谷
D 等待48小时预报
```

- [ ] **Step 4: Add a new section titled `Web Demo · 一轮四分支最小素材包`**

Add a one-page overview plus four compact production briefs:

```text
A01《等待的代价》：8–10秒。营地天气逐渐转晴，沈岚放下已经失效的矿权文件；Web结果：人员安全、时间超期、矿权失去。
B01《风暴提前》：8–10秒。复用现有翻山线的白茫风暴和受伤左手；Web结果：时间最优、安全高风险、矿权仍可登记。
C01《漫长山谷》：8–10秒。第一人称沿稳定但漫长的雪谷行进，远处登记站仍不可见；Web结果：安全较高、时间临界、矿权不确定。
D01《两天后的预报》：8–10秒。帐篷外云层压低，老周确认暴风将封山；Web结果：信息增加、剩余12天、仍需再次选择。
```

Each brief must include: narrative purpose, one continuous-shot description, one short Chinese line or voice-over, target tail frame, Web result overlay, and the stable video filename from Task 3.

- [ ] **Step 5: Rebuild the DOCX using bundled Python**

Run the generator with the bundled Python executable returned by workspace dependency loading.

Expected: the master DOCX is overwritten successfully and contains the new four-route section.

- [ ] **Step 6: Render and inspect every DOCX page**

Run the packaged `render_docx.py` into a fresh output directory. Open every `page-<N>.png` and verify no clipping, overlap, missing glyphs, broken tables, or accidental blank pages.

- [ ] **Step 7: Run structural and semantic checks**

Verify the DOCX ZIP structure and assert that extracted document text contains:

```text
实际成片已完成至 E02-S02
关键帧已完成 · 视频待生成
Web Demo · 一轮四分支最小素材包
A01《等待的代价》
B01《风暴提前》
C01《漫长山谷》
D01《两天后的预报》
```

- [ ] **Step 8: Commit Task 4**

```bash
git add 短剧制作资料/99_过程文件/逐镜分镜文档生成/build_node_storyboard_doc.py 短剧制作资料/02_主线分镜/最后十四天_逐镜生成版_大纲与分集分镜.docx
git commit -m "docs: align storyboard with four-route demo"
```

---

### Task 5: Full Verification and Browser Walkthrough

**Files:**
- Verify all files from Tasks 1–4.

**Interfaces:**
- Produces: evidence that all four choices play different paths and the production document matches the Web contract.

- [ ] **Step 1: Run automated checks**

Run: `npm test -- --run`

Expected: all Vitest tests PASS.

Run: `npm run typecheck`

Expected: exit 0.

Run: `npm run build`

Expected: Vite production build completes successfully.

- [ ] **Step 2: Start the local server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports `http://127.0.0.1:5173/`.

- [ ] **Step 3: Walk through A/B/C/D in the browser**

For each route:

1. open the choice screen;
2. click the route button;
3. confirm the route-specific video source is selected;
4. let the clip end or use the material fallback;
5. confirm the correct result title and metrics;
6. click “选择其他路线” and confirm the intro does not replay.

- [ ] **Step 4: Check the desktop viewport**

At 1440 × 900 verify no horizontal scroll, clipped button copy, overlapping HUD, inaccessible actions, or video controls covering choices.

- [ ] **Step 5: Inspect final diff and status**

Confirm only the planned Web, test, video staging, generator, DOCX, design, and plan files changed. Preserve all unrelated user modifications.

