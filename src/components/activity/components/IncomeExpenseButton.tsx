
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { IncomeExpenseModal } from "../form/IncomeExpenseModal";
import { Client } from "../types";

interface IncomeExpenseButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClientCreated?: (clientId: string, clientName: string) => void;
}

export const IncomeExpenseButton = ({ 
  variant = "default", 
  size = "lg", 
  className = "",
  onClientCreated
}: IncomeExpenseButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    console.log("Opening Income & Expense Form Modal");
    setIsModalOpen(true);
  };
  
  const handleClientCreated = (clientId: string, clientName: string) => {
    if (onClientCreated) {
      onClientCreated(clientId, clientName);
    }
  };
  
  return (
    <>
      <Button 
        variant="default" 
        size={size}
        className={`flex items-center justify-center gap-2 ${className} hover:opacity-90 transition-all shadow-sm`}
        onClick={handleOpenModal}
      >
        <FileText className="h-5 w-5" />
        <span>Create Income & Expense Form</span>
      </Button>
      
      <IncomeExpenseModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClientCreated={handleClientCreated}
      />
    </>
  );
};
