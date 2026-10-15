import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import Avatar from './Avatar.jsx'
import Logo from './Logo.jsx'

const CLIENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z' },
  { to: '/projects', label: 'Projects', icon: 'M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2' },
  { to: '/freelancers', label: 'Freelancers', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8M19 8v6M22 11h-6' },
  { to: '/invoices', label: 'Invoices', icon: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6' },
  { to: '/profile', label: 'Profile', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0' },
]

const FREELANCER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z' },
  { to: '/clients', label: 'Clients', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8M22 21v-2a4 4 0 00-3-3.87' },
  { to: '/projects', label: 'Projects', icon: 'M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2' },
  { to: '/invoices', label: 'Invoices', icon: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6' },
  { to: '/profile', label: 'Profile', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const isFreelancer = user.role === 'freelancer'

  const nav = isFreelancer ? FREELANCER_NAV : CLIENT_NAV
  const activeTab = isFreelancer ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
  const badge = isFreelancer
    ? 'bg-indigo-500/20 text-indigo-300'
    : 'bg-emerald-500/20 text-emerald-300'

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function onKeyDown(event) {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.target.closest?.('input, textarea, [contenteditable="true"]')) return

      const current = nav.findIndex(
        (item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/')
      )
      if (current === -1) return

      const step = event.key === 'ArrowRight' ? 1 : -1
      event.preventDefault()
      navigate(nav[(current + step + nav.length) % nav.length].to)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [nav, location.pathname, navigate])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900 text-slate-200">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3 max-md:flex max-md:flex-wrap max-md:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-[15px] font-extrabold tracking-[0.14em] text-white max-sm:hidden">
              DOCKET
            </span>
            <span className={'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' + badge}>
              {isFreelancer ? 'Freelancer' : 'Client'}
            </span>
          </div>

          {/* Centred tab menu */}
          <nav className="no-scrollbar flex items-center gap-1 max-md:order-3 max-md:w-full max-md:overflow-x-auto">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  'inline-flex shrink-0 items-center gap-2 rounded-[10px] px-3.5 py-2 text-[14px] font-medium transition ' +
                  (isActive ? activeTab : 'text-slate-400 hover:bg-slate-800 hover:text-white')
                }
              >
                <svg
                  className="h-[17px] w-[17px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User + sign out */}
          <div className="flex items-center justify-end gap-2.5">
            <Avatar name={user.name} color={user.color} photoURL={user.photoURL} size={34} />
            <div className="flex min-w-0 flex-col max-sm:hidden">
              <strong className="truncate text-[13px] leading-tight">{user.name}</strong>
              <span className="truncate text-[11px] leading-tight text-slate-400">
                {user.company || user.title || user.role}
              </span>
            </div>
            <button
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-transparent px-3.5 py-2 text-sm font-semibold transition hover:bg-white/10"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1160px] flex-col px-[34px] pb-[60px] pt-[30px] max-md:px-[18px] max-md:pb-[50px] max-md:pt-[22px]">
        <div className="flex-1">
          <Outlet />
        </div>

        <footer className="mt-6 border-t border-slate-200 pt-4 text-center text-[13px] text-slate-500">
          © 2026 DOCKET
        </footer>
      </main>
    </div>
  )
}
