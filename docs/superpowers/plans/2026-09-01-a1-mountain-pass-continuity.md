# A1 Mountain Pass Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成 A1 三段连续视频所需的可用关键帧和 Pavo 提示词，使“翻过山口”具有真实空间推进。

**Architecture:** 以 A0 真实尾帧为 A1-1 首帧，顺序生成三个目标尾帧；每个目标尾帧又作为下一段首帧。所有生成物放入独立的 A1 优化版目录，并用一份 Markdown 固定上传顺序、动作和对白。

**Tech Stack:** Codex Image Generation、Pavo 图生视频、FFmpeg 抽帧/验收。

## Global Constraints

- 16:9、第一人称、写实电影质感。
- 人物形象、服装、绳索、受伤左手和天气连续。
- 禁止字幕、可读文字、数字、水印、油画感和原地踏步。

---

### Task 1: 建立 A1 优化版素材结构

**Files:**
- Create: `短剧制作资料/07_Pavo上传素材/图片/A路线_A1_继续冲过山口_优化版/`
- Create: `短剧制作资料/07_Pavo上传素材/图片/A路线_A1_继续冲过山口_优化版/A1_三段分镜与Pavo提示词.md`

- [x] 复制 A0 真实尾帧为 `01_A1-1输入首帧_山口前上坡.png`。
- [x] 在 Markdown 中写明三段上传顺序和人物锁定信息。

### Task 2: 生成三张连续目标尾帧

**Files:**
- Create: `02_A1-1目标尾帧_登上鞍部.png`
- Create: `03_A1-2目标尾帧_跨过分水岭.png`
- Create: `04_A1-3目标尾帧_抵达背风坡.png`

- [x] 用首帧人物作身份参考，生成鞍部最高点尾帧。
- [x] 以上一张为连续性参考，生成脊线已在身后上方的跨越尾帧。
- [x] 以上一张为连续性参考，生成风雪减弱的背风坡结果尾帧。
- [x] 逐张检查人物数量、服装、手指、绳索、空间方向和油画感。

### Task 3: 编写 Pavo 三段提示词并验收

**Files:**
- Modify: `短剧制作资料/07_Pavo上传素材/图片/A路线_A1_继续冲过山口_优化版/A1_三段分镜与Pavo提示词.md`

- [x] 为每段写 8–10 秒的动作节奏和首尾帧说明。
- [x] 把设备箱滑落限制在 A1-2，把结果对白限制在 A1-3。
- [x] 检查文件名、顺序、对白和战略结果与主分支设计一致。
- [x] 只保留最终可上传图片和说明文档。
