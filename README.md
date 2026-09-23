# 最后十四天 · 战略决策教学体验

当前 Web 为四条路线的视频互动版本，包含校准字幕、决策记录、黑屏叙事过场、进度恢复和战略管理学习复盘。

## 运行与检查

```bash
npm ci
npm run dev -- --host 127.0.0.1
npm test -- --run
npm run typecheck
npm run subtitles:check
npm run build
```

字幕校验需要本机安装 FFmpeg/ffprobe。部分历史制作包测试仅用于保有本地生产资料的工作环境。

- `/`：当前视频互动体验。
- `/docs/story-map/`：剧情结构与关键帧核对页。
- `/play/story/`：保留的旧文字试玩，不作为新版学生入口。

## 发布

正式项目：Vercel `gold-rush-decision-demo`。正式域名：https://gold.thumem.top 。

```bash
npx vercel --prod --yes
```

`.vercelignore` 只允许应用源码、当前图片、字幕和 `public/videos/latest/` 的压缩视频进入 CLI 部署。构建也会移除旧视频与原始素材。原始视频、制作包和压缩前备份保留在本地，不纳入本次提交。当前视频共 33 个，约 192 MiB；五条结局合片共约 14 MiB。

`/version.json` 显示构建提交号和时间，用于核对线上版本；入口和同名视频更新时须重新验证缓存。部署前需通过测试、类型检查、字幕校验与构建，发布后核对正式域名版本、媒体响应及实际播放。

## 当前主要代码

- `src/components/LatestStoryPlay.tsx`：播放、选择与结算。
- `src/demo/latestStory.ts`：可玩路线与视频映射。
- `src/demo/narrativeBridges.ts`：影片内与节点间过场。
- `src/demo/storySession.ts`：本地存档与尝试记录。
- `src/components/LatestDecisionReport.tsx`：学习复盘。
- `src/demo/latestSubtitles.json`：当前视频校准字幕源。

剧情来源及改编边界见 `新剧情共创记录/最后十四天_FINAL_20260911/`。
