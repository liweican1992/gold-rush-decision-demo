# E01-S02 Keyframe Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成 E01-S02 的中间动作帧和桌面尾帧，并保存到项目的分镜关键帧目录。

**Architecture:** 使用豆包样片尾帧作为主视觉参考，沈岚角色设定图作为身份和服装补充参考。先生成中间帧，再以样片与中间帧共同约束尾帧。

**Tech Stack:** Codex 内置图像生成工具、项目本地 PNG 素材。

## Global Constraints

- 16:9，第一人称视角。
- 沈岚身份、发型和服装保持一致。
- 帐篷内暖黄，帐篷外冷蓝。
- 无字幕、无可读文字、无水印。
- 生成结果保存到 `短剧制作资料/02_主线分镜/关键帧/E01-S02/`。

---

### Task 1: 中间动作帧

**Files:**
- Create: `短剧制作资料/02_主线分镜/关键帧/E01-S02/E01-S02_mid.png`

- [x] 使用样片尾帧和沈岚角色设定图生成转身动作。
- [x] 检查人物身份、服装、矿石和运动方向。
- [x] 将通过检查的图片保存到目标目录。

### Task 2: 桌面尾帧

**Files:**
- Create: `短剧制作资料/02_主线分镜/关键帧/E01-S02/E01-S02_end.png`

- [x] 使用样片尾帧和中间动作帧生成桌面构图。
- [x] 检查矿石、地图、工具、受伤左手和冷暖光线。
- [x] 将通过检查的图片保存到目标目录。
