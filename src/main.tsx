
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider as UIThemeProvider } from "./components/ui/theme-provider"
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initDebugMode, recordSessionEvent, logAuthEvent } from './utils/debugMode'
import { authDebug } from './utils/authDebug'
import { runStorageDiagnostics } from './utils/browserDiagnostics'
import App from './App'
import './index.css'

// Initialize debug mode
initDebugMode();

// Record application start time
recordSessionEvent('app_init_start');
logAuthEvent('Application initialization started');

// Check for storage issues early
runStorageDiagnostics().then(diagnostics => {
  if (diagnostics.hasStorageIssue) {
    console.warn('⚠️ Storage issues detected that may affect authentication:', diagnostics.recommendations);
  }
});

// Create a client with improved error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      onError: (error) => {
        logAuthEvent(`Query error: ${error instanceof Error ? error.message : String(error)}`);
      },
    },
    mutations: {
      onError: (error) => {
        logAuthEvent(`Mutation error: ${error instanceof Error ? error.message : String(error)}`);
      },
    }
  },
})

// Log when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  recordSessionEvent('dom_content_loaded');
  logAuthEvent('DOM content loaded');

  // Check auth state when DOM is ready to diagnose any early auth issues
  authDebug.checkAuthState().then(state => {
    if (!state.hasSession) {
      logAuthEvent('No auth session detected at DOMContentLoaded');
    }
  });
});

// Check auth state before hydration to capture any pre-render auth state
authDebug.checkAuthState().catch(error => {
  logAuthEvent(`Pre-render auth check failed: ${error instanceof Error ? error.message : String(error)}`);
});

// Log when window is fully loaded
window.addEventListener('load', () => {
  recordSessionEvent('window_loaded');
  logAuthEvent('Window fully loaded');
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
logAuthEvent('Application render complete');

// Perform auth check after initial render
setTimeout(() => {
  authDebug.checkAuthState().then(state => {
    logAuthEvent('Post-render auth state:', state);
    recordSessionEvent('post_render_auth_check_complete');
  });
}, 500);
