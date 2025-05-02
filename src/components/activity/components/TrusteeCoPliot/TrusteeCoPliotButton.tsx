
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Headset, MessageSquare } from "lucide-react";
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
        className={`flex items-center gap-2 ${className}`}
        onClick={handleOpenModal}
      >
        <Bot className="h-4 w-4" />
        <Headset className="h-4 w-4" />
        TrusteeCo-Pilot
      </Button>
      
      <TrusteeCoPliotModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clientId={clientId}
      />
    </>
  );
};
