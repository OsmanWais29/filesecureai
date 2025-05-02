
import { ReactNode } from "react";
import { ClientHeader } from "./ClientHeader";

interface ClientPortalLayoutProps {
  children: ReactNode;
}

export const ClientPortalLayout = ({ children }: ClientPortalLayoutProps) => {
  return (
    <div className="min-h-screen h-screen w-full flex overflow-hidden bg-white dark:bg-background">
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <ClientHeader />
        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 bg-gray-50 dark:bg-background w-full">
          <div className="container mx-auto max-w-full pb-16 sm:pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
