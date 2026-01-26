import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isDemoMode } from '../lib/runtime'

export const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const demoMode = isDemoMode || !supabase

  useEffect(() => {
    if (demoMode || !supabase) return
    const client = supabase
    let mounted = true
    let timeoutId: number | undefined
    let subscription: { unsubscribe: () => void } | null = null

    const finalize = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const errorMessage =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error')

      if (errorMessage) {
        setError(decodeURIComponent(errorMessage))
        return
      }

      const { data, error: sessionError } = await client.auth.getSession()
      if (!mounted) return

      if (sessionError) {
        setError(sessionError.message)
        return
      }

      if (data.session) {
        navigate('/')
        return
      }

      const { data: listener } = client.auth.onAuthStateChange((_event, next) => {
        if (!mounted || !next) return
        navigate('/')
      })

      subscription = listener.subscription
      timeoutId = window.setTimeout(() => {
        if (!mounted) return
        setError('Missing session. Try signing in again.')
      }, 8000)
    }

    void finalize()

    return () => {
      mounted = false
      subscription?.unsubscribe()
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [demoMode, navigate])

  if (demoMode) {
    return <Navigate to="/" replace />
  }

  if (error) {
    return (
      <div className="auth-shell">
        <div className="auth-shell-main">
          <div className="auth-page auth-page--stacked">
            <div className="card">
              <h2>Sign-in failed</h2>
              <p className="muted">{error}</p>
              <button className="primary-button" onClick={() => navigate('/login')}>
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell-main">
        <div className="auth-page auth-page--stacked">
          <div className="card">Finalizing your session...</div>
        </div>
      </div>
    </div>
  )
}
