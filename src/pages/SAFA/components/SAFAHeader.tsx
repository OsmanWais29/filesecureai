
import React from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

interface SAFAHeaderProps {
  toggleSidebar: () => void;
}

const SAFAHeader: React.FC<SAFAHeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">SecureFiles AI Assistant</h1>
      </div>
    </header>
  );
};

export default SAFAHeader;
