import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProvider } from './app/providers/app-provider'
import { ClerkProvider } from './app/providers/clerk-provider'
import { AxiosProvider } from './app/providers/axios-provider'
import { ViewProvider } from './shared/hooks/use-view'
import { PrivacyProvider } from './shared/hooks/use-privacy'
import { AppRouter } from './app/routes'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ClerkProvider>
        <AxiosProvider>
          <ViewProvider>
            <PrivacyProvider>
              <AppRouter />
            </PrivacyProvider>
          </ViewProvider>
        </AxiosProvider>
      </ClerkProvider>
    </AppProvider>
  </StrictMode>,
)
