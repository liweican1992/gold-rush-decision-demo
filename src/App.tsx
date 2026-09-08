import MainlineDemo from './MainlineDemo'
import { StoryMapPage } from './components/StoryMapPage'

export function appSurfaceForPath(pathname: string) {
  return /^\/docs\/story-map\/?$/.test(pathname) ? 'story-map' : 'game'
}

export default function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  return appSurfaceForPath(pathname) === 'story-map' ? <StoryMapPage /> : <MainlineDemo />
}
