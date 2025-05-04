
import { ReactNode } from "react";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { MainHeader } from "@/components/header/MainHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen h-screen w-full flex overflow-hidden bg-white dark:bg-background">
      <MainSidebar />
      <div className={`flex-1 flex flex-col w-full overflow-hidden ${!isMobile ? 'pl-64' : 'pl-0'}`}>
        <MainHeader />
        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 bg-gray-50 dark:bg-background w-full">
          <div className="container mx-auto max-w-full pb-16 sm:pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
