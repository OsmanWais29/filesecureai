
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider as UIThemeProvider } from "./components/ui/theme-provider"
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initDebugMode, recordSessionEvent } from './utils/debugMode'
import App from './App'
import './index.css'

// Initialize debug mode
initDebugMode();

// Record application start time
recordSessionEvent('app_init_start');

// Create a client with improved error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
    mutations: {
      // Empty object for mutations to avoid the error
    }
  },
})

// Log when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  recordSessionEvent('dom_content_loaded');
});

// Log when window is fully loaded
window.addEventListener('load', () => {
  recordSessionEvent('window_loaded');
});

// Find root element
const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// Render the app
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

// Record render complete
recordSessionEvent('app_rendered');
