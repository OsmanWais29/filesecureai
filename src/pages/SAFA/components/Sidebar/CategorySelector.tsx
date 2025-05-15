
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Scale, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  activeModule: 'document' | 'legal' | 'help' | 'client';
  setActiveModule: (module: 'document' | 'legal' | 'help' | 'client') => void;
  handleStartConsultation: () => void;
  showConversation: boolean;
  isProcessing: boolean;
  onUploadComplete: (documentId: string) => Promise<void>;
  collapsed?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  activeModule,
  setActiveModule,
  handleStartConsultation,
  showConversation,
  isProcessing,
  collapsed = false
}) => {
  const modules = [
    { id: 'document', name: 'Document Analysis', icon: FileText },
    { id: 'legal', name: 'Legal & Regulatory', icon: Scale },
    { id: 'help', name: 'Training & Help', icon: BookOpen },
    { id: 'client', name: 'Client Connect', icon: Users },
  ];

  return (
    <div className="space-y-2">
      {modules.map(module => (
        <Button
          key={module.id}
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            collapsed ? "w-10 h-10" : "w-full justify-start",
            activeModule === module.id && "bg-primary/10 text-primary"
          )}
          onClick={() => setActiveModule(module.id as any)}
          disabled={isProcessing}
        >
          <module.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>{module.name}</span>}
        </Button>
      ))}
      
      {!collapsed && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleStartConsultation}
          disabled={isProcessing || (activeModule === 'client' && showConversation)}
        >
          <Users className="mr-2 h-4 w-4" />
          Start Consultation
        </Button>
      )}
    </div>
  );
};
