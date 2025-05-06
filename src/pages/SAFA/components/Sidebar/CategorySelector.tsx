
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Scale, BookOpen, Users } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ModuleCard } from "../ModuleContent/ModuleCard";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CategorySelectorProps {
  activeModule: 'document' | 'legal' | 'help' | 'client';
  setActiveModule: (module: 'document' | 'legal' | 'help' | 'client') => void;
  handleStartConsultation: () => Promise<void>;
  showConversation: boolean;
  isProcessing: boolean;
  onUploadComplete: (documentId: string) => Promise<void>;
  collapsed?: boolean; // Add the collapsed prop as an optional boolean
}

export const CategorySelector = ({ 
  activeModule, 
  setActiveModule, 
  handleStartConsultation, 
  showConversation,
  isProcessing,
  onUploadComplete,
  collapsed = false // Set default to false
}: CategorySelectorProps) => {
  // If collapsed, we'll render a simpler version of the component
  if (collapsed) {
    return (
      <div className="space-y-4">
        <Tabs value={activeModule} onValueChange={(value: any) => setActiveModule(value)} className="w-full">
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="document" className="p-2" title="Document Analysis">
              <FileText className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="legal" className="p-2" title="Legal & Regulatory">
              <Scale className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="client" className="p-2" title="Client Connect">
              <Users className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="help" className="p-2" title="Training & Help">
              <BookOpen className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  }

  // Regular expanded view
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Categories</h2>
      <Tabs value={activeModule} onValueChange={(value: any) => setActiveModule(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-1 h-auto">
          <TabsTrigger value="document" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Document Analysis
          </TabsTrigger>
          <TabsTrigger value="legal" className="w-full justify-start">
            <Scale className="mr-2 h-4 w-4" />
            Legal & Regulatory
          </TabsTrigger>
          <TabsTrigger value="client" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Client Connect
          </TabsTrigger>
          <TabsTrigger value="help" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Training & Help
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="mt-4">
          <ModuleCard
            icon={FileText}
            title="Document Analysis Tool"
            description="Upload documents for comprehensive analysis including client details, risk assessment, and detailed solutions with references to Canadian insolvency regulations."
            actions={<FileUpload onUploadComplete={onUploadComplete} />}
          />
        </TabsContent>

        <TabsContent value="legal" className="mt-4">
          <ModuleCard
            icon={Scale}
            title="Legal Advisory"
            description="Ask questions about Canadian insolvency laws, BIA regulations, OSB guidelines, and receive expert guidance based on current legal framework."
            actions={
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Legal Consultation
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="client" className="mt-4">
          <ModuleCard
            icon={Users}
            title="AI Client Assistant"
            description="Enhanced multimodal chatbot with voice, text, and sentiment analysis capabilities. Seamlessly integrates with CRM for real-time client updates and engagement tracking."
            actions={
              !showConversation && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleStartConsultation}
                  disabled={isProcessing}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {isProcessing ? "Starting..." : "Start Consultation"}
                </Button>
              )
            }
          />
        </TabsContent>

        <TabsContent value="help" className="mt-4">
          <ModuleCard
            icon={BookOpen}
            title="Training & Support"
            description="Access application guidance, contribute training data, and help improve the AI's understanding of Canadian insolvency practices."
            actions={
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Upload Training Data
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  View Documentation
                </Button>
              </div>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
