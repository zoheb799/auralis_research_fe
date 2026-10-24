import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRightLeft, History, Menu, MoonStar, Sparkles, SunMedium, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../theme/ThemeProvider'
import { Button } from '../ui/button'

const navItems = [{ path: '/history', label: 'History' }]

export function Navbar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout, user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMobileClose = () => setMobileOpen(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-sky-300/60 bg-sky-600 text-white shadow-[0_10px_30px_rgba(14,116,144,0.18)] backdrop-blur-sm dark:border-sky-500/50 dark:bg-sky-700">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3" onClick={handleMobileClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/10 shadow-inner shadow-white/10">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">Auralis</div>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive || (location.pathname.startsWith('/history') && item.path === '/history')
                      ? 'bg-white/12 text-white'
                      : 'text-sky-50/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15"
              aria-label="Toggle theme"
              type="button"
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMobileOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15"
              aria-label="Toggle navigation menu"
              type="button"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </motion.button>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15"
              aria-label="Toggle theme"
              type="button"
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </motion.button>

            {!loading && isAuthenticated ? (
              <>
                <div className="hidden text-sm text-sky-50 lg:block">{user?.name || 'Investor'}</div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void logout()}
                  className="hidden bg-white/10 text-white hover:bg-white/15 sm:inline-flex"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-sky-50/90 hover:bg-white/10 hover:text-white">
                  Log in
                </NavLink>
                <NavLink to="/register" className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleMobileClose}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-slate-200 bg-white p-5 shadow-2xl md:hidden dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Auralis</div>
                </div>
                <button
                  type="button"
                  onClick={handleMobileClose}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleMobileClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive || (location.pathname.startsWith('/history') && item.path === '/history')
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <History className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      void logout()
                      handleMobileClose()
                    }}
                    className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={handleMobileClose}
                      className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Log in
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={handleMobileClose}
                      className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Sign up
                    </NavLink>
                  </>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
