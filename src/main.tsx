
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TrackingProvider } from "@/contexts/TrackingContext";
import { ThemeProvider } from "@/components/theme-provider";
import { performanceMonitor } from "@/utils/performance";

// Initialize performance monitoring
performanceMonitor.init();

// Create a client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
      onSettled: (data, error, variables, context) => {
        if (error) {
          console.error('Mutation error:', error);
        }
      }
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TrackingProvider>
            <App />
            <Toaster />
            <SonnerToaster position="top-right" />
          </TrackingProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
