import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

type AppShellProps = {
  children: React.ReactNode
}

export const AppShell = ({ children }: AppShellProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">Budget</div>
          <span className="brand-sub">Personal ledger</span>
        </div>
        <div className="header-actions">
          <div className="user-meta">
            <span className="sync-dot" />
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="ghost-button" onClick={() => navigate('/settings')}>
            Settings
          </button>
          <button className="primary-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
