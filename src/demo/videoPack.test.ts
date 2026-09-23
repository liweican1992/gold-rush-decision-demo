import { describe, expect, it } from 'vitest'
import { measureVideoPackBytes, shouldAutoStartFullPack, shouldPromptBeforeStarting, type AutoDownloadContext, type VideoPackStatus } from './videoPack'

describe('automatic full pack startup', () => {
  it('starts on the launch screen after core media settles, but never duplicates active work', () => {
    const readyToStart: AutoDownloadContext = { launchVisible: true, coreVideoPending: false, requestActive: false, status: 'idle' }
    expect(shouldAutoStartFullPack(readyToStart)).toBe(true)
    expect(shouldAutoStartFullPack({ ...readyToStart, status: 'estimating' })).toBe(true)
    expect(shouldAutoStartFullPack({ ...readyToStart, launchVisible: false })).toBe(false)
    expect(shouldAutoStartFullPack({ ...readyToStart, coreVideoPending: true })).toBe(false)
    expect(shouldAutoStartFullPack({ ...readyToStart, requestActive: true })).toBe(false)
    expect(shouldAutoStartFullPack({ ...readyToStart, status: 'ready' })).toBe(false)
    expect(shouldAutoStartFullPack({ ...readyToStart, status: 'failed' })).toBe(false)
  })

  it('requires a choice before action starts unless the full pack is ready', () => {
    const unfinished: VideoPackStatus[] = ['idle', 'estimating', 'downloading', 'failed']
    unfinished.forEach(status => expect(shouldPromptBeforeStarting(status)).toBe(true))
    expect(shouldPromptBeforeStarting('ready')).toBe(false)
  })
})

describe('full video pack size', () => {
  it('sums every clip size before a download starts', async () => {
    const sizes: Record<string, number> = { '/clip-a.mp4': 100, '/clip-b.mp4': 250, '/clip-c.mp4': 400 }
    const requests: Array<{ url: string; method: string | undefined }> = []
    const fetcher: typeof fetch = async (input, init) => {
      const url = String(input)
      requests.push({ url, method: init?.method })
      return new Response(null, { headers: { 'Content-Length': String(sizes[url]) } })
    }

    const total = await measureVideoPackBytes(Object.keys(sizes), new AbortController().signal, fetcher)

    expect(total).toBe(750)
    expect(requests).toHaveLength(3)
    expect(requests.every(({ method }) => method === 'HEAD')).toBe(true)
  })

  it('reports an unknown total when any clip does not provide its size', async () => {
    const fetcher: typeof fetch = async (input) => {
      if (String(input) === '/known.mp4') return new Response(null, { headers: { 'Content-Length': '500' } })
      return new Response(null, { status: 405 })
    }

    const total = await measureVideoPackBytes(['/known.mp4', '/unknown.mp4'], new AbortController().signal, fetcher)

    expect(total).toBe(0)
  })
})
