import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { CRMProvider } from "@/crm/store";
import { CRM } from "@/crm/CRM";
import "./index.css";

// App entry: shared CRM store + toast notifications around the CRM
createRoot(document.getElementById("root")!).render(
  <CRMProvider>
    <CRM />
    <Toaster position="top-right" richColors />
  </CRMProvider>,
);
