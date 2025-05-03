
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { TrusteeCoPliotModal } from "./TrusteeCoPliotModal";

interface TrusteeCoPliotButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  clientId?: string;
}

export const TrusteeCoPliotButton = ({ 
  variant = "secondary", 
  size = "lg", 
  className = "",
  clientId
}: TrusteeCoPliotButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    console.log("Opening TrusteeCo-Pilot Modal");
    setIsModalOpen(true);
  };
  
  return (
    <>
      <Button 
        variant="default" 
        size={size}
        className={`flex items-center gap-2 ${className} bg-gradient-to-r from-primary/90 to-primary hover:opacity-90 transition-all shadow-md`}
        onClick={handleOpenModal}
      >
        <div className="bg-white/30 rounded-full p-1">
          <Bot className="h-4 w-4" />
        </div>
        <span className="font-medium text-primary-foreground">TrusteeCo-Pilot</span>
      </Button>
      
      <TrusteeCoPliotModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clientId={clientId}
      />
    </>
  );
};
