import { Link } from 'react-router-dom'

import { ChatWidget } from '../components/chat/ChatWidget'
import { ExploreArrow } from '../components/explore/ExploreArrow'

export function LandingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-8 md:pt-12">
      <ChatWidget key="new-conversation" />

      <Link to="/explore" className="mt-8 block w-full max-w-4xl rounded-3xl border border-slate-200 bg-white/60 p-3 shadow-sm transition-all hover:border-sky-200 hover:shadow-[0_20px_35px_rgba(14,116,144,0.08)]">
        <ExploreArrow />
      </Link>
    </div>
  )
}
