import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { CRM } from "@/crm/CRM";
import "./index.css";

// App entry: data cache (React Query) + toast notifications around the CRM
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={new QueryClient()}>
    <CRM intake />
    <Toaster position="top-right" richColors />
  </QueryClientProvider>,
);
