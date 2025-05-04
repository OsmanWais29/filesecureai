
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider as UIThemeProvider } from "./components/ui/theme-provider"
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UIThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <CustomThemeProvider>
            <App />
          </CustomThemeProvider>
        </UIThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
