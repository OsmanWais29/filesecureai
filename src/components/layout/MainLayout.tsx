
import { ReactNode } from "react";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { MainHeader } from "@/components/header/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen h-screen w-full flex overflow-hidden bg-gray-50/50 dark:bg-background/50 backdrop-blur-sm">
      <MainSidebar />
      <div className={cn(
        "flex-1 flex flex-col w-full overflow-hidden transition-all duration-300",
        !isMobile ? 'pl-64' : 'pl-0'
      )}>
        <MainHeader />
        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 bg-gray-50/80 dark:bg-background/80 w-full">
          <div className="container mx-auto max-w-full pb-16 sm:pb-20 page-transition">
            {children}
          </div>
        </main>
        {showFooter && (
          <Footer compact className="bg-white/90 dark:bg-background/90 backdrop-blur-sm border-t border-primary/5" />
        )}
      </div>
    </div>
  );
};
