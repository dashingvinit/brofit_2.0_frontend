import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProvider } from './app/providers/app-provider'
import { ClerkProvider } from './app/providers/clerk-provider'
import { AxiosProvider } from './app/providers/axios-provider'
import { ViewProvider } from './shared/hooks/use-view'
import { AppRouter } from './app/routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ClerkProvider>
        <AxiosProvider>
          <ViewProvider>
            <AppRouter />
          </ViewProvider>
        </AxiosProvider>
      </ClerkProvider>
    </AppProvider>
  </StrictMode>,
)
