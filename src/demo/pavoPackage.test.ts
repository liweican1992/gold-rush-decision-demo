import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { REDESIGNED_STORY } from './redesignedStory'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const packageRoot = resolve(root, '短剧制作资料/17_正式Pavo制作包_v3.0')
const requiredFiles = [
  '00_节点状态卡.md',
  '01_逐镜文字脚本.md',
  '02_对白与声音.md',
  '03_Pavo正式提示词.md',
  '04_关键帧生成提示词.md',
  '05_首尾帧承接契约.md',
] as const
const requiredDirectories = ['关键帧', 'Pavo原片', '字幕', '验收'] as const

type ProductionUnit = {
  id: string
  kind: 'common' | 'situation' | 'outcome' | 'finale'
  directory: string
  video?: string
}

function productionUnits(): ProductionUnit[] {
  const common = REDESIGNED_STORY.common.map(node => ({
    id: node.id,
    kind: 'common' as const,
    directory: resolve(packageRoot, '01_公共开场', node.id),
  }))
  const routes = REDESIGNED_STORY.routes.flatMap((route, index) => {
    const routeRoot = resolve(packageRoot, `0${index + 2}_${route.id}路线`)
    return [
      { id: route.situation.id, kind: 'situation' as const, directory: resolve(routeRoot, route.situation.id) },
      ...route.outcomes.flatMap(outcome => [
        { id: outcome.id, kind: 'outcome' as const, directory: resolve(routeRoot, outcome.id) },
        ...outcome.finales.map(finale => ({
          id: finale.id,
          kind: 'finale' as const,
          directory: resolve(routeRoot, outcome.id, finale.id),
          video: finale.video,
        })),
      ]),
    ]
  })
  return [...common, ...routes]
}

describe('v3 Pavo production package', () => {
  const units = productionUnits()

  it('keeps the formal story source byte-for-byte locked', () => {
    const story = readFileSync(resolve(root, 'src/demo/redesignedStory.ts'))
    expect(createHash('sha256').update(story).digest('hex')).toBe('4ba27d2c4bcae0bf2904b714900935296651d1fb58ac06dae408d577f13e8ad6')
  })

  it('derives exactly 52 production units and 34 unique finale videos', () => {
    expect(units).toHaveLength(52)
    const finales = units.filter(unit => unit.kind === 'finale')
    expect(finales).toHaveLength(34)
    expect(new Set(finales.map(unit => unit.id)).size).toBe(34)
    expect(new Set(finales.map(unit => unit.video)).size).toBe(34)
    expect(finales.filter(unit => unit.id.startsWith('D2-')).map(unit => unit.id)).toEqual(['D2-1'])
  })

  it('provides six production documents and four review directories for every unit', () => {
    for (const unit of units) {
      expect(existsSync(unit.directory), `missing unit directory: ${unit.id}`).toBe(true)
      for (const file of requiredFiles) {
        expect(existsSync(resolve(unit.directory, file)), `missing ${unit.id}/${file}`).toBe(true)
      }
      for (const directory of requiredDirectories) {
        const path = resolve(unit.directory, directory)
        expect(existsSync(path) && statSync(path).isDirectory(), `missing ${unit.id}/${directory}/`).toBe(true)
      }
    }
  })

  it('keeps every production document node-specific and reviewable', () => {
    for (const unit of units) {
      const state = readFileSync(resolve(unit.directory, '00_节点状态卡.md'), 'utf8')
      const script = readFileSync(resolve(unit.directory, '01_逐镜文字脚本.md'), 'utf8')
      const audio = readFileSync(resolve(unit.directory, '02_对白与声音.md'), 'utf8')
      const pavo = readFileSync(resolve(unit.directory, '03_Pavo正式提示词.md'), 'utf8')
      const frames = readFileSync(resolve(unit.directory, '04_关键帧生成提示词.md'), 'utf8')
      const handoff = readFileSync(resolve(unit.directory, '05_首尾帧承接契约.md'), 'utf8')

      for (const [name, content] of Object.entries({ state, script, audio, pavo, frames, handoff })) {
        expect(content, `${unit.id}/${name} lacks node id`).toContain(unit.id)
      }
      for (const heading of ['进入状态', '离开状态', '不可逆事实', '玩家已知事实']) expect(state).toContain(heading)
      expect(script).toMatch(/S01[\s\S]*\d{1,2}\s*秒/)
      expect(audio).toContain('对白')
      for (const rule of ['16:9', '无字幕', '无可读文字', '无UI', '无水印', '左手']) expect(pavo).toContain(rule)
      for (const frame of ['K01', 'K02', 'K03', '未验收']) expect(frames).toContain(frame)
      for (const contract of ['输入来源', '目标尾帧']) expect(handoff).toContain(contract)
    }
  })
})
