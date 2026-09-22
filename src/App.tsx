import { LatestStoryPlay } from './components/LatestStoryPlay'
import { ReviewedStoryMapPage } from './components/ReviewedStoryMapPage'
import { TextStoryPlay } from './components/TextStoryPlay'

export function appSurfaceForPath(pathname: string) {
  return /^\/play\/story\/?$/.test(pathname) ? 'text-play' : /^\/docs\/story-map\/?$/.test(pathname) ? 'story-map' : 'game'
}

export default function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  return appSurfaceForPath(pathname) === 'text-play' ? <TextStoryPlay /> : appSurfaceForPath(pathname) === 'story-map' ? <ReviewedStoryMapPage /> : <LatestStoryPlay />
}
