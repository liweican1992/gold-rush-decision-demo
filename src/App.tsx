import { LatestStoryPlay } from './components/LatestStoryPlay'
import { ReviewedStoryMapPage } from './components/ReviewedStoryMapPage'
import { TextStoryPlay } from './components/TextStoryPlay'
import { TeacherBriefingPage } from './components/TeacherBriefingPage'
import { TeacherStoryOutlinePage } from './components/TeacherStoryOutlinePage'

export function appSurfaceForPath(pathname: string) {
  return /^\/play\/story\/?$/.test(pathname) ? 'text-play' : /^\/docs\/story-map\/?$/.test(pathname) ? 'story-map' : /^\/docs\/story-outline\/?$/.test(pathname) ? 'story-outline' : /^\/teacher\/?$/.test(pathname) ? 'teacher' : 'game'
}

export default function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const surface = appSurfaceForPath(pathname)
  return surface === 'text-play' ? <TextStoryPlay /> : surface === 'story-map' ? <ReviewedStoryMapPage /> : surface === 'story-outline' ? <TeacherStoryOutlinePage /> : surface === 'teacher' ? <TeacherBriefingPage /> : <LatestStoryPlay />
}
