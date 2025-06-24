
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import TrusteeDocumentsPage from "./pages/trustee/DocumentsPage";
import DeepSeekTestPage from "./pages/DeepSeekTestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<TrusteeDocumentsPage />} />
        <Route path="/deepseek-test" element={<DeepSeekTestPage />} />
        {navItems.map(({ to, page }) => (
          <Route key={to} path={to} element={React.createElement(page)} />
        ))}
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
