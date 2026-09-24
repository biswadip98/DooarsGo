import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, gender, avatar_url, is_driver, is_admin, driver_status, rating_avg')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadProfile(data.session?.user?.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess)
      await loadProfile(sess?.user?.id)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    profile,
    loading,
    user: session?.user ?? null,
    async signIn(email, password) {
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signUp({ email, password, fullName, phone, gender }) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone, gender: gender || null } },
      })
      // Make sure name, phone & gender land on the profile row even if the
      // database trigger doesn't copy them from sign-up metadata.
      const uid = res.data?.user?.id
      if (uid && res.data?.session) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName, phone, gender: gender || null })
          .eq('id', uid)
        await loadProfile(uid)
      }
      return res
    },
    async signOut() {
      await supabase.auth.signOut()
      setProfile(null)
    },
    refreshProfile: () => loadProfile(session?.user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
