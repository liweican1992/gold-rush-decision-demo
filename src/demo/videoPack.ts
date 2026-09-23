export type VideoPackStatus = 'idle' | 'estimating' | 'downloading' | 'ready' | 'failed'

export type AutoDownloadContext = {
  launchVisible: boolean
  coreVideoPending: boolean
  requestActive: boolean
  status: VideoPackStatus
}

export function shouldAutoStartFullPack(context: AutoDownloadContext) {
  return context.launchVisible
    && !context.coreVideoPending
    && !context.requestActive
    && context.status !== 'ready'
    && context.status !== 'failed'
}

export function shouldPromptBeforeStarting(status: VideoPackStatus) {
  return status !== 'ready'
}

export async function measureVideoPackBytes(
  sources: string[],
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
) {
  const sizes: Array<number | undefined> = new Array(sources.length).fill(undefined)
  let nextIndex = 0

  const checkNextSize = async () => {
    while (!signal.aborted) {
      const index = nextIndex
      nextIndex += 1
      const source = sources[index]
      if (!source) return

      try {
        const response = await fetcher(source, { method: 'HEAD', signal })
        const size = Number(response.headers.get('content-length'))
        if (response.ok && Number.isFinite(size) && size > 0) sizes[index] = size
      } catch (error) {
        if (signal.aborted) throw error
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, sources.length) }, () => checkNextSize()))
  if (signal.aborted) throw new DOMException('Size check cancelled', 'AbortError')
  if (sizes.some((size) => size === undefined)) return 0
  return sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0)
}
