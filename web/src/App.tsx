import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './app/AuthProvider'
import { RequireAuth } from './app/RequireAuth'
import { isDemoMode } from './lib/runtime'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {isDemoMode ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/auth/callback" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </>
        )}
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
