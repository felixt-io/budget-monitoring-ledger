import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isDemoMode } from '../lib/runtime'
import { AuthContext } from './authContext'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const demoMode = isDemoMode || !supabase
  const [loading, setLoading] = useState(!demoMode)

  useEffect(() => {
    if (demoMode || !supabase) {
      return
    }
    const client = supabase
    let mounted = true
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = client.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return
      setSession(next)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [demoMode])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
    }),
    [session, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
