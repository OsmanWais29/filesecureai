
import { ReactNode } from "react";
import { ClientHeader } from "./ClientHeader";
import { ClientSidebar } from "./ClientSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ClientPortalLayoutProps {
  children: ReactNode;
}

export const ClientPortalLayout = ({ children }: ClientPortalLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen w-full flex flex-col overflow-hidden bg-gray-50 dark:bg-background">
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar - desktop is fixed, mobile is in a sheet */}
        {!isMobile ? (
          <ClientSidebar />
        ) : (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <ClientSidebar />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main content */}
        <div className={cn("flex-1 flex flex-col w-full h-full overflow-hidden", !isMobile ? "pl-64" : "pl-0")}>
          <ClientHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
