import { NavLink } from 'react-router-dom'

const exploreItems = [
  { path: '/explore/stocks', label: 'Stocks' },
  { path: '/explore/ipos', label: 'IPOs' },
  { path: '/explore/mutual-funds', label: 'Mutual Funds' },
]

export function ExploreTabs() {
  return (
    <nav
      aria-label="Explore investment types"
      className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
    >
      {exploreItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
