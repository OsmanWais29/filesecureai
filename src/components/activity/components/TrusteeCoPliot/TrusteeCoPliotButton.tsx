
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
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
        variant={variant} 
        size={size}
        className={`flex items-center gap-1.5 ${className} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm transition-all`}
        onClick={handleOpenModal}
      >
        <div className="bg-white/20 p-0.5 rounded-full">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <span className="font-medium">TrusteeCo-Pilot</span>
        <Sparkles className="h-3 w-3 ml-0.5" />
      </Button>
      
      <TrusteeCoPliotModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clientId={clientId}
      />
    </>
  );
};
