import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error('Root element not found.')
}

const showFatalError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  rootEl.innerHTML = `
    <div style="max-width:640px;margin:48px auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;color:#111827;font:14px/1.6 'Space Grotesk',system-ui;">
      <h1 style="margin:0 0 8px;font-size:18px;">Something went wrong</h1>
      <p style="margin:0 0 8px;">The demo could not start. Please refresh the page and try again.</p>
      <pre style="white-space:pre-wrap;margin:0;color:#b91c1c;">${message}</pre>
    </div>
  `
}

window.addEventListener('error', (event) => {
  showFatalError(event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  showFatalError(event.reason)
})

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
