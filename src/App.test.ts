import { describe, expect, it } from 'vitest'
import { appSurfaceForPath } from './App'

describe('app pathname surface', () => {
  it('opens the director map only on the story-map path', () => {
    expect(appSurfaceForPath('/')).toBe('game')
    expect(appSurfaceForPath('/docs/story-map')).toBe('story-map')
    expect(appSurfaceForPath('/docs/story-map/')).toBe('story-map')
  })
})
