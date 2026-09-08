# 《最后十四天》v3.0 制作级剧本与 Pavo 制作包实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在正式剧情字节不变的前提下，为公共开场、16 个正式节点和 34 条独立终局建立可直接审查的逐镜文字脚本、对白声音、Pavo 提示词、关键帧提示词和首尾帧承接契约，并把旧入口明确标记为废弃。

**Architecture:** `src/demo/redesignedStory.ts` 与 `17_正式Pavo制作包_v3.0/00_总控` 继续作为剧情真源；制作文件按节点 ID 分包，终局嵌套在父节点目录中。新增只读目录完整性测试，验证 52 个制作单元、312 份规定文档、34 条独立终局、提示词硬约束和正式剧情 SHA-256；旧素材只记录复用状态，不在本计划中生成图片或视频。

**Tech Stack:** Markdown 制作文件、React/TypeScript 剧情真源、Vitest、Node.js 文件系统 API、Git。

## Global Constraints

- `src/demo/redesignedStory.ts` SHA-256 固定为 `4ba27d2c4bcae0bf2904b714900935296651d1fb58ac06dae408d577f13e8ad6`，不得修改剧情字节或更新基线常量。
- 正式结构固定为公共开场、A/B/C/D 四路线、A0—D3 共 16 个节点、34 条独立终局；D2 只有 D2-1 自动结果。
- X1、X2、X3 与旧共享 F1—F6 剧情不得进入活跃制作包；F1—F6 只作报告分类。
- 每个制作单元固定包含 `00_节点状态卡.md`、`01_逐镜文字脚本.md`、`02_对白与声音.md`、`03_Pavo正式提示词.md`、`04_关键帧生成提示词.md`、`05_首尾帧承接契约.md`。
- 每段 Pavo 源片为 8—12 秒、16:9、写实电影感；一个源片只承担一个连续空间内的主要动作和至多两句短对白。
- 每份 Pavo 提示词必须明确：无字幕、无可读文字、无 UI、无水印、人物与服装连续、队长左手伤势连续。
- K01 只能来自上一段实际成片尾帧或标记为“待首帧验收”的候选；K02 是动作构图参考；K03 是目标尾帧。文件存在不等于关键帧验收通过。
- 本计划不生成新图片、不向 Pavo 投喂、不部署、不推送、不删除旧文件。
- 旧素材只允许“复制、不移动、不覆盖”；未完成八项事实与人物连续性核对的文件保持“仅审查”。

---

## 目录与职责

```text
短剧制作资料/17_正式Pavo制作包_v3.0/
├── 00_总控/
│   ├── 03_制作顺序.md
│   ├── 04_素材复用与来源清单.md
│   ├── 05_废弃资料清单.md
│   └── 07_制作文件规范.md
├── 01_公共开场/
│   ├── INTRO/{六份文档,关键帧/,Pavo原片/,字幕/,验收/}
│   └── PRIMARY/{六份文档,关键帧/,Pavo原片/,字幕/,验收/}
├── 02_A路线/A0、A1/{A1-1..3}、A2/{A2-1..3}、A3/{A3-1..3}
├── 03_B路线/B0、B1/{B1-1..3}、B2/{B2-1..3}、B3/{B3-1..3}
├── 04_C路线/C0、C1/{C1-1..3}、C2/{C2-1..3}、C3/{C3-1..3}
├── 05_D路线/D0、D1/{D1-1..3}、D2/D2-1、D3/{D3-1..3}
└── 99_旧素材参考_禁止直接投喂/00_说明.md
```

每份状态卡负责事实，不承担镜头语言；逐镜脚本负责 S01/S02 的时间轴；对白文件负责可说内容与声音层；Pavo 文件负责可复制投喂的正负提示词；关键帧文件负责 K01/K02/K03；承接契约负责输入来源与输出状态。不得在六份文件中复制出互相矛盾的时间或物资状态。

### Task 1：锁定制作包结构并建立自动验收

**Files:**
- Create: `scripts/pavo-package.test.ts`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/07_制作文件规范.md`
- Modify: `短剧制作资料/17_正式Pavo制作包_v3.0/README.md`

**Interfaces:**
- Consumes: `REDESIGNED_STORY`、固定 SHA-256、上述目录命名。
- Produces: `productionUnits`（INTRO、PRIMARY、A0—D3、34 个 finale）及每单元六文件的磁盘验收。

- [x] **Step 1: 写目录结构红测**

  测试从 `REDESIGNED_STORY` 计算 52 个制作单元，映射到 `01_公共开场`、`02_A路线`—`05_D路线`，逐单元断言六份 Markdown 与 `关键帧/Pavo原片/字幕/验收` 四个目录存在；初次运行应因目录未建立失败。

- [x] **Step 2: 写内容闸门红测**

  对每个文件断言含节点 ID；状态卡含“进入状态/离开状态/不可逆事实/玩家已知事实”；逐镜脚本含 `S01` 与秒数；Pavo 提示词含 `16:9/无字幕/无可读文字/无UI/无水印/左手`；关键帧含 `K01/K02/K03/未验收`；承接契约含输入来源和目标尾帧。对 34 个 finale 断言独立视频路径唯一。

- [x] **Step 3: 运行红测**

  Run: `rtk proxy npm test -- --run scripts/pavo-package.test.ts`

  Expected: FAIL，错误列出首个缺失制作单元，而不是跳过空目录。

- [x] **Step 4: 编写制作文件规范**

  `07_制作文件规范.md` 固定六文件职责、S01/S02、K01/K02/K03、Pavo 正负提示词、字幕后置、验收状态和禁止事项；README 将阅读顺序扩展到 03—07。

- [x] **Step 5: 提交验收基线**

  Run: `rtk git add scripts/pavo-package.test.ts 短剧制作资料/17_正式Pavo制作包_v3.0/README.md 短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/07_制作文件规范.md && rtk git commit -m "test: define v3 pavo package contract"`

### Task 2：完成总控文件、公共开场与统一人物连续性

**Files:**
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/03_制作顺序.md`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/04_素材复用与来源清单.md`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/05_废弃资料清单.md`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/01_公共开场/INTRO/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/01_公共开场/PRIMARY/*`

**Interfaces:**
- Consumes: INTRO/PRIMARY 正式 scene、69 份审查资产清单、统一人物设定。
- Produces: 四路线共同使用的服装、道具、伤势、镜头与声音基线；PRIMARY 尾帧作为 A0/B0/C0/D0 的候选输入。

- [x] **Step 1: 建立公共场景与人物基线**

  固定第一人称队长；左手白色绷带且握力不足；沈岚负责文件与样本、老周负责路线与时间、阿杰佩戴耳机并负责医疗；寒地勘探服、背包、医疗包、绳索、样本箱在所有路线连续。

- [x] **Step 2: 完成 INTRO 六文件**

  S01 在勘探帐篷内用 8—10 秒建立高品位样本、地图、土地购买期权和剩余 14 天；K03 同时保留地图、样本、防水文件袋和队长受伤左手，不生成可读文件文字。

- [x] **Step 3: 完成 PRIMARY 六文件**

  S01 用 8—10 秒让三名队友分别指出速度、安全、信息和等待退出的差异，选择由第一人称玩家作出；K03 是三人等待决定的稳定中景，不预演任一路线动作。

- [x] **Step 4: 完成总控 03—05**

  制作顺序固定为公共开场→A0/B0/C0/D0→A1—D3→34 个终局；素材清单链接现有 69 份 manifest 并保持全部未验收；废弃清单列出 X1/X2/X3、共享 F 视频和旧 v2 入口。

- [x] **Step 5: 运行针对性测试并提交**

  Run: `rtk proxy npm test -- --run scripts/pavo-package.test.ts src/demo/storyBaseline.test.tsx`

  Expected: 目录测试继续因 A—D 路线缺失而失败；公共开场和剧情哈希断言通过。

  Commit: `docs: add v3 pavo controls and common opening scripts`

### Task 3：完成 A 路线 13 个制作单元

**Files:**
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/02_A路线/A0/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/02_A路线/A1/*` and `A1/A1-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/02_A路线/A2/*` and `A2/A2-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/02_A路线/A3/*` and `A3/A3-1..3/*`

**Interfaces:**
- Consumes: A0 第3天剩11天；A1 第9天剩5天且设备已丢失；A2 第4天剩10天且仍在背风雪台；A3 已超期。
- Produces: A0 三选项事实镜头与 A1/A2/A3 各自独立的 9 条终局制作脚本。

- [x] **Step 1: 完成 A0 与三条行动节点六文件**

  A0 必须同时建立前方山口、横风、受力固定绳、失力左手和背风岩壁；A1 必须确认已经越岭和设备损失；A2 必须停留在背风雪台清晨；A3 必须通过日夜变化明确超期。

- [x] **Step 2: 完成 A1-1—A1-3**

  分别表现资料组先行提交、全队减负截止日提交、治疗后安全撤离；已遗失设备在三条路径都不得恢复。

- [x] **Step 3: 完成 A2-1—A2-3**

  分别表现第13天提交、第12天资料组提交、带齐重装后超期；禁止把 A2 开场画成已越岭。

- [x] **Step 4: 完成 A3-1—A3-3**

  三条路径只能表现人员、知识或设备回收；禁止重新赶路登记。

- [x] **Step 5: 人工交叉核对后提交**

  对每条终局逐项比对 requiredFacts/result/finalState/scene；运行 package test，预期只剩 B/C/D 路线缺失。

  Commit: `docs: add production scripts for route A`

### Task 4：完成 B 路线 13 个制作单元

**Files:**
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/03_B路线/B0/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/03_B路线/B1/*` and `B1/B1-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/03_B路线/B2/*` and `B2/B2-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/03_B路线/B3/*` and `B3/B3-1..3/*`

**Interfaces:**
- Consumes: B0 断桥/索桥/重装三事实；B1 受潮且剩1天；B2 已超期但资产完整；B3 人员资料已过桥、重装在对岸。
- Produces: B 路线 9 条终局，持续保留受潮、样本覆盖和重装留弃的不可逆后果。

- [x] **Step 1: 完成 B0、B1、B2、B3 六文件**

  B0 镜头必须让三个选择依据同屏或按镜头顺序明确；B1 不宣称受潮损失可恢复；B2 不保留登记选项；B3 必须用空间反打明确人和重装分处河两岸。

- [x] **Step 2: 完成 B1-1—B1-3**

  区分全部提交、并行整理、只交干燥核心证据；不得虚构案例未给出的政府审核规则。

- [x] **Step 3: 完成 B2-1—B2-3 与 B3-1—B3-3**

  B2 只做撤离与资产选择；B3 三条均保持重型设备永久留弃。

- [x] **Step 4: 交叉核对、测试与提交**

  Run: `rtk proxy npm test -- --run scripts/pavo-package.test.ts src/demo/redesignedStory.test.ts`

  Expected: A/B 内容断言通过，只剩 C/D 路线缺失。

  Commit: `docs: add production scripts for route B`

### Task 5：完成 C 路线 13 个制作单元

**Files:**
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/04_C路线/C0/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/04_C路线/C1/*` and `C1/C1-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/04_C路线/C2/*` and `C2/C2-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/04_C路线/C3/*` and `C3/C3-1..3/*`

**Interfaces:**
- Consumes: C0 等待48小时后的明确预报；C1 少量样本；C2 预测正确但已超期；C3 运输队到场且权益已让渡。
- Produces: C 路线 9 条终局；合作运输只存在于 C3。

- [x] **Step 1: 完成 C0、C1、C2、C3 六文件**

  C0 必须在声画中建立 36 小时天气窗、雪地运输能力和权益要求；C1 保持少量样本；C2 表现预报正确但行动目标失配；C3 明确运输队与原始资料保管边界。

- [x] **Step 2: 完成 C1/C2/C3 的 9 条终局**

  C1 三条保持样本有限；C2 三条保持窗口关闭；C3 三条保持未来权益已让渡，且不把运输伙伴写成 D 路竞争者。

- [x] **Step 3: 交叉核对、测试与提交**

  Run: `rtk proxy npm test -- --run scripts/pavo-package.test.ts src/demo/redesignedStory.test.ts`

  Expected: A/B/C 内容断言通过，只剩 D 路线缺失。

  Commit: `docs: add production scripts for route C`

### Task 6：完成 D 路线 11 个制作单元

**Files:**
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/05_D路线/D0/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/05_D路线/D1/*` and `D1/D1-1..3/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/05_D路线/D2/*` and `D2/D2-1/*`
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/05_D路线/D3/*` and `D3/D3-1..3/*`

**Interfaces:**
- Consumes: D0 报价只针对完整勘探资料；D1 只确认公开竞争；D2 交付不含实物样本；D3 重装留营且剩1天。
- Produces: D 路线 7 条终局；D2-1 是唯一自动结果。

- [x] **Step 1: 完成 D0、D1、D2、D3 六文件**

  D0 报价声画不得暗示竞争者已获得机会；D1 不出现竞争者胜利；D2 交易物只出现地图、照片、坐标与勘探记录；D3 保持补给和调整缓冲接近归零。

- [x] **Step 2: 完成 D1-1—D1-3、D2-1、D3-1—D3-3**

  D1 三条只做安全撤收；D2-1 明确资本回收与永久退出；D3 三条均保持重装留弃，其中 D3-3 伤势与执行能力代价最高。

- [x] **Step 3: 交叉核对、测试与提交**

  Run: `rtk proxy npm test -- --run scripts/pavo-package.test.ts src/demo/redesignedStory.test.ts src/demo/storyBaseline.test.tsx`

  Expected: 52 个制作单元与 312 份文件全部通过；34 个终局目录、独立视频和 D2 自动结果通过。

  Commit: `docs: add production scripts for route D`

### Task 7：标记旧入口与共享剧情为废弃

**Files:**
- Create or update only marker files named `00_已废弃_禁止用于Pavo.md` in the old active-entry directories under `短剧制作资料/07_*` and `短剧制作资料/09_*`—`16_正式剧情树_v2.0/`.
- Create: `短剧制作资料/17_正式Pavo制作包_v3.0/99_旧素材参考_禁止直接投喂/00_说明.md`
- Modify: root `README.md` and `短剧制作资料/01_剧情脚本/README_当前剧本入口.md` when present.

**Interfaces:**
- Consumes: `00_总控/05_废弃资料清单.md`。
- Produces: 所有旧入口可见的 v3.0 跳转、允许参考范围与禁用范围；不移动或删除旧文件。

- [x] **Step 1: 只读盘点旧入口**

  使用 `rtk rg --files 短剧制作资料` 定位真实目录；不根据预计名称创建不存在的历史目录。

- [x] **Step 2: 添加废弃标记**

  每个标记写明废弃原因、v3.0 替代入口、允许作为人物/构图/动作参考的范围，以及禁止继续使用的 X1/X2/X3/共享 F 视频或旧提示词。

- [x] **Step 3: 更新入口并验证无删除**

  `git diff --name-status` 只能出现新增 marker 或 README 修改，不得出现 D/R 状态。

- [x] **Step 4: 提交**

  Commit: `docs: mark legacy story inputs as deprecated`

### Task 8：全量制作级剧本验收

**Files:**
- Modify only if verification finds an in-scope defect: files created by Tasks 1—7.
- Modify: `短剧制作资料/17_正式Pavo制作包_v3.0/00_总控/06_剧情验收报告.md`

**Interfaces:**
- Consumes: 52 个制作单元、34 条路径、69 份旧素材审查记录。
- Produces: `production-script-locked` 验收结论；仍不等于关键帧或视频验收。

- [x] **Step 1: 自动检查剧情与目录**

  Run: `rtk proxy npm test -- --run`

  Expected: 全量测试通过，含固定剧情 SHA、52 个制作单元、312 份规定文档、34 条独立结果和 Pavo 硬约束。

- [x] **Step 2: 构建检查**

  Run: `rtk proxy npm run build`

  Expected: TypeScript 与 Vite 构建成功。

- [x] **Step 3: 人工逐路线复核**

  对 A2 时间与空间、A3/B2/C2/D1 超期、B1 受潮、B3/D3 重装留弃、C3 权益让渡、D2 资料交易逐项核对；检查每个 K01 输入与父段 K03 一致或明确标为待实际尾帧替换。

- [x] **Step 4: 更新验收报告**

  把状态从 `story-locked` 提升为 `production-script-locked`，明确“关键帧未验收、69 份旧图仍仅审查、尚未投喂 Pavo”。记录实际测试数量、构建结果与正式剧情 SHA。

- [x] **Step 5: 最终卫生检查并提交**

  Run: `rtk git diff --check && rtk git status --short && rtk shasum -a 256 src/demo/redesignedStory.ts`

  Expected: 无空白错误；既有未跟踪旧图与 `部署交付/` 未被提交；SHA 与 Global Constraints 一致。

  Commit: `docs: lock v3 production scripts for keyframe review`

## 实施完成后的下一闸门

本计划完成后，只能进入“关键帧复用/生成审核”：先审 69 份旧素材，优先核对 B1 两张与 D1 一张阶段匹配候选；通过八项事实、水印和人物连续性后才复制为正式候选。未通过或缺失的节点再生成 K01/K02/K03；关键帧逐节点人工确认后，才允许向 Pavo 生成对应 S01/S02。
