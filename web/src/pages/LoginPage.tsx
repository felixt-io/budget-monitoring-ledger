import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isDemoMode } from '../lib/runtime'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (isDemoMode || !supabase) {
    return <Navigate to="/" replace />
  }
  const client = supabase

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Magic link sent. Check your email to continue.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell-main">
        <div className="auth-page auth-page--stacked">
          <div className="auth-card">
            <div className="auth-brand">Budget</div>
            <h1>Sign in with a magic link</h1>
            <p className="muted">
              Use your email address to access your private ledger on any device.
            </p>
            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Sending link...' : 'Send magic link'}
              </button>
            </form>
            {message && <div className="notice">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
