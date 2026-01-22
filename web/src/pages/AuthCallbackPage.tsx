import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const finalize = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (!code) {
        setError('Missing auth code. Try signing in again.')
        return
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        setError(exchangeError.message)
        return
      }

      navigate('/')
    }

    void finalize()
  }, [navigate])

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
            <footer className="site-footer">© 2026 Felix Tom</footer>
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
          <footer className="site-footer">© 2026 Felix Tom</footer>
        </div>
      </div>
    </div>
  )
}
