
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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50 dark:bg-background">
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
      
      <ClientHeader />
      
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar - desktop is fixed, mobile is in a sheet */}
        {!isMobile ? (
          <div className="w-64 flex-shrink-0">
            <ClientSidebar />
          </div>
        ) : (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <ClientSidebar />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
