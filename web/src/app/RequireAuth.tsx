import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { AppShell } from './AppShell'

export const RequireAuth = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="centered">
        <div className="card">Loading your budget space...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
