# A3 Retreat to Valley Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重做 A3 两段式关键帧和 Pavo 脚本，使撤回方向与错过期限的战略结果清楚可信。

**Architecture:** 使用 A0 无水印真实尾帧作为起点，顺序生成“山脊下撤”中继帧和“河谷岔口”结果帧；第二张严格参考第一张以维持人物与地理连续。

**Tech Stack:** Codex Image Generation、OpenMontage cinematic scene review、Pavo 图生视频、FFprobe。

## Global Constraints

- 两段各约10秒，总时长约20秒。
- 16:9、第一人称、写实电影质感。
- 第一段人物始终背向镜头下降；第二段抵达河谷后才转身对白。
- 最终上传包只保留三张图片和一份 Markdown。

---

### Task 1: 建立 A3 最终版并固定首帧

- [x] 创建 `短剧制作资料/07_Pavo上传素材/图片/A路线_A3_20秒最终版/`。
- [x] 复制 A0 无水印尾帧为 `01_第一段首帧_山脊决定点.png`。

### Task 2: 生成两张连续目标尾帧

- [x] 生成 `02_第一段尾帧兼第二段首帧_下撤雪坡.png`，三人背向镜头向下。
- [x] 以上一张为连续性参考生成 `03_第二段尾帧_河谷路线结果.png`，沈岚持地图说明代价。
- [x] 检查人物、绳索、服装、地理方向、手指和写实质感。

### Task 3: 编写脚本并验收

- [x] 创建 `A3_20秒版_Pavo提示词.md`，明确两段首尾帧组合。
- [x] 第一段只表现转身和下撤，无对白。
- [x] 第二段只表现进入河谷、停下和结果对白。
- [x] 验证三张图的16:9尺寸和最终目录文件数量。
