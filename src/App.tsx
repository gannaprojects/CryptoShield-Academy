import { useEffect, useRef, useState } from 'react'
import { Icon, Logo, type IconName } from './components/ui'
import About from './pages/About'
import Challenges from './pages/Challenges'
import Home from './pages/Home'
import Lab from './pages/Lab'
import Learn from './pages/Learn'
import Progress from './pages/Progress'
import Reports from './pages/Reports'

const NAV: { id: string; label: string; icon: IconName }[] = [
  { id: '', label: 'Home', icon: 'lock' },
  { id: 'learn', label: 'Learn', icon: 'book' },
  { id: 'lab', label: 'Crypto Lab', icon: 'flask' },
  { id: 'challenges', label: 'Challenges', icon: 'flag' },
  { id: 'reports', label: 'Reports', icon: 'doc' },
  { id: 'progress', label: 'My Progress', icon: 'chart' },
]

/** Hash routing (#/learn/caesar) so the built site works from any static host without server rewrites. */
function useRoute(): string[] {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
}

export default function App() {
  const route = useRoute()
  const [page = '', ...rest] = route
  const [menuOpen, setMenuOpen] = useState(false)
  const main = useRef<HTMLElement>(null)
  const first = useRef(true)

  // Lab tab switches stay on one page, so they must not steal focus from the tab list.
  const viewKey = page === 'lab' ? 'lab' : route.join('/')
  useEffect(() => {
    setMenuOpen(false)
    if (first.current) return void (first.current = false)
    scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [viewKey])

  const view =
    page === '' ? <Home />
    : page === 'learn' ? <Learn id={rest[0]} />
    : page === 'lab' ? <Lab tab={rest[0]} />
    : page === 'challenges' ? <Challenges id={rest[0]} />
    : page === 'reports' ? <Reports mode={rest[0]} arg={rest[1]} />
    : page === 'progress' ? <Progress />
    : page === 'about' ? <About />
    : (
      <div className="card">
        <h1 className="h1">Page not found</h1>
        <p className="muted mt-2">That address does not match a page in CryptoShield Academy.</p>
        <a href="#/" className="btn btn-primary mt-4">Go to Home</a>
      </div>
    )

  const navLink = (n: (typeof NAV)[number], mobile: boolean) => (
    <a
      key={n.id}
      href={`#/${n.id}`}
      aria-current={page === n.id ? 'page' : undefined}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold no-underline ${mobile ? 'min-h-11' : ''} ${
        page === n.id ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon name={n.icon} className="h-4 w-4" />
      {n.label}
    </a>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" onClick={(e) => (e.preventDefault(), main.current?.focus())} className="btn btn-primary sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="#/" className="flex items-center gap-2 text-lg font-bold text-slate-900 no-underline">
            <Logo />
            CryptoShield Academy
          </a>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => navLink(n, false))}
          </nav>
          <button type="button" className="btn shrink-0 lg:hidden" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((o) => !o)}>
            <Icon name={menuOpen ? 'x' : 'menu'} />
            Menu
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="grid gap-1 border-t border-slate-200 px-4 py-3 lg:hidden">
            {NAV.map((n) => navLink(n, true))}
          </nav>
        )}
      </header>

      <main id="main" ref={main} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:py-10">
        {view}
      </main>

      <footer className="border-t border-slate-200 bg-white print:hidden">
        <div className="muted mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            A student educational project. Not an official NTI website. Progress and report drafts are saved only in this browser on this device.
          </p>
          <a href="#/about" className="link shrink-0">
            About the Project
          </a>
        </div>
      </footer>
    </div>
  )
}
