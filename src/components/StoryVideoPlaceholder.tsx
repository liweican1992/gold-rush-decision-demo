export function StoryVideoPlaceholder({
  nodeId,
  title,
  synopsis,
  onContinue,
}: {
  nodeId: string
  title: string
  synopsis: string
  expectedVideo: string
  onContinue: () => void
}) {
  return (
    <section className="story-video-placeholder">
      <div className="story-video-placeholder-mark">{nodeId}</div>
      <div>
        <span>真实视频待生成 · 剧情概要降级</span>
        <h1>{title}</h1>
        <p>{synopsis}</p>
        <div className="material-notice"><i />节点已接入故事图，替换真实视频后将自动播放</div>
        <button className="demo-action-primary" type="button" onClick={onContinue}>继续决策</button>
      </div>
    </section>
  )
}
