// @ts-expect-error Node builtin used only by Vitest; this project has no @types/node.
import { createHash } from 'node:crypto'
// @ts-expect-error Node builtin used only by Vitest; do not add dependencies for this guard.
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { it, expect } from 'vitest'
import { REDESIGNED_STORY, validateRedesignedStory, getTerminalPathCount } from './redesignedStory'
import { StoryMapPage } from '../components/StoryMapPage'

it('preserves the approved story bytes and all route results during rendering', () => {
  const bytes = () => readFileSync(new URL('./redesignedStory.ts', import.meta.url))
  const expected = '4ba27d2c4bcae0bf2904b714900935296651d1fb58ac06dae408d577f13e8ad6'
  const before = JSON.stringify(REDESIGNED_STORY)
  expect(createHash('sha256').update(bytes()).digest('hex')).toBe(expected)
  renderToStaticMarkup(<StoryMapPage />)
  expect(JSON.stringify(REDESIGNED_STORY)).toBe(before)
  expect(createHash('sha256').update(bytes()).digest('hex')).toBe(expected)
  expect(getTerminalPathCount()).toBe(34)
  expect(validateRedesignedStory()).toEqual([])
})
