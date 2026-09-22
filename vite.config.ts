import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { readdir, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

function pruneArchivedMediaFromBuild() {
  return {
    name: 'prune-archived-media-from-build',
    apply: 'build' as const,
    async closeBundle() {
      const output = resolve('dist')
      let commit = process.env.RELEASE_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA
      if (!commit) {
        try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() }
        catch { commit = 'local-build' }
      }
      await writeFile(resolve(output, 'version.json'), JSON.stringify({ commit, builtAt: new Date().toISOString() }) + '\n')
      await Promise.all([
        rm(resolve(output, 'source'), { recursive: true, force: true }),
        rm(resolve(output, 'videos/demo'), { recursive: true, force: true }),
        rm(resolve(output, 'videos/web'), { recursive: true, force: true }),
        rm(resolve(output, 'images/choice-frames'), { recursive: true, force: true }),
      ])

      const videos = resolve(output, 'videos')
      for (const entry of await readdir(videos)) {
        if (entry.startsWith('mainline-') && entry.endsWith('.mp4')) {
          await rm(resolve(videos, entry), { force: true })
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), pruneArchivedMediaFromBuild()],
  test: {
    environment: 'node',
  },
})
