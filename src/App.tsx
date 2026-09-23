import { LatestStoryPlay } from './components/LatestStoryPlay'
import { ReviewedStoryMapPage } from './components/ReviewedStoryMapPage'
import { TextStoryPlay } from './components/TextStoryPlay'
import { TeacherBriefingPage } from './components/TeacherBriefingPage'

export function appSurfaceForPath(pathname: string) {
  return /^\/play\/story\/?$/.test(pathname) ? 'text-play' : /^\/docs\/story-map\/?$/.test(pathname) ? 'story-map' : /^\/teacher\/?$/.test(pathname) ? 'teacher' : 'game'
}

export default function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const surface = appSurfaceForPath(pathname)
  return surface === 'text-play' ? <TextStoryPlay /> : surface === 'story-map' ? <ReviewedStoryMapPage /> : surface === 'teacher' ? <TeacherBriefingPage /> : <LatestStoryPlay />
}
