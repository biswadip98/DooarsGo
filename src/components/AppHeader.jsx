import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import logoFull from '../assets/dooarsgo-logo-full.png'

/**
 * Drop this at the top of every page (Landing, Login, Signup, CustomerHome,
 * DriverHome, BookRide, Profile, admin pages, etc.) so the logo, login
 * state, and account menu are identical everywhere — one source of truth
 * instead of copy-pasted nav markup per page.
 */
export default function AppHeader() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [fullName, setFullName] = useState('')
  const [isDriver, setIsDriver] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setAuthLoaded(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setFullName('')
      setIsDriver(false)
      return
    }
    let active = true
    supabase
      .from('profiles')
      .select('full_name, is_driver')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!active || !data) return
        setFullName(data.full_name || 'Account')
        setIsDriver(!!data.is_driver)
      })
    return () => {
      active = false
    }
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    navigate('/')
  }

  const dashboardPath = isDriver ? '/driver' : '/home'
  const displayLabel = authLoaded && session ? (fullName || 'Account') : 'Login'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoFull} alt="DooarsGo" className="h-9 w-auto sm:h-10" />
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-[#15803d] hover:text-[#15803d]"
          >
            {displayLabel}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {session ? (
                <>
                  <Link role="menuitem" to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    My profile
                  </Link>
                  <Link role="menuitem" to={dashboardPath} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Go to dashboard
                  </Link>
                  <button role="menuitem" onClick={handleLogout} className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link role="menuitem" to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Log in
                  </Link>
                  <Link role="menuitem" to="/signup" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
