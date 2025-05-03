
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
        variant="secondary" 
        size={size}
        className={`flex items-center justify-center gap-2 ${className} hover:bg-secondary/90 transition-all border border-border/50 shadow-sm`}
        onClick={handleOpenModal}
      >
        <Bot className="h-5 w-5 text-primary" />
        <span className="font-medium">TrusteeCo-Pilot</span>
      </Button>
      
      <TrusteeCoPliotModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clientId={clientId}
      />
    </>
  );
};
