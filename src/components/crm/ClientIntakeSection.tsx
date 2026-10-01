
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Bot,
  ChevronRight,
  PauseCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { FormSteps } from "./FormSteps";
import { FormData } from "./types";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
export const ClientIntakeSection = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState("");
  const totalSteps = 4;

  // Basic form state
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",
    notes: "",
    mobilePhone: "",
    city: "",
    province: "",
    postalCode: "",
    dateOfBirth: "",
    sin: "",
    maritalStatus: "",
    leadSource: "",
    otherLeadSourceDetails: "",
    leadDescription: "",
    accountStatus: "lead",
    preferredContactMethod: "email",
    preferredLanguage: "english"
  });

  const handleTranscriptionUpdate = (text: string) => {
    setTranscription(text);
    
    // Try to extract information from voice input
    if (text.toLowerCase().includes('name is')) {
      const name = text.split('name is')[1].trim();
      setFormData(prev => ({ ...prev, fullName: name }));
    }
  };

  const { isRecording, toggleRecording } = useVoiceRecognition(handleTranscriptionUpdate);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Update progress based on filled fields
    const filledFields = Object.values(formData).filter(val => val && typeof val === 'string' && val.length > 0).length;
    setProgress((filledFields / Object.keys(formData).length) * 100);
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Update progress based on filled fields
    const filledFields = Object.values(formData).filter(val => val && typeof val === 'string' && val.length > 0).length;
    setProgress((filledFields / Object.keys(formData).length) * 100);
  };

  const handleEmploymentTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      employmentType: value
    }));
    // Update progress based on filled fields
    const filledFields = Object.values(formData).filter(val => val && typeof val === 'string' && val.length > 0).length;
    setProgress((filledFields / Object.keys(formData).length) * 100);
  };

  const handleNextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit the final form data
      try {
        const { data, error } = await sfaiFunctions.invoke('process-client-intake', {
          body: { formData, transcription }
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Client intake form submitted successfully.",
        });

        // Reset form
        setFormData({
          fullName: "",
          companyName: "",
          email: "",
          phone: "",
          address: "",
          businessType: "",
          notes: "",
          mobilePhone: "",
          city: "",
          province: "",
          postalCode: "",
          dateOfBirth: "",
          sin: "",
          maritalStatus: "",
          leadSource: "",
          otherLeadSourceDetails: "",
          leadDescription: "",
          accountStatus: "lead",
          preferredContactMethod: "email",
          preferredLanguage: "english"
        });
        setCurrentStep(1);
        setProgress(0);
      } catch (error) {
        console.error('Error submitting form:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit form. Please try again.",
        });
      }
    }
  };

  const renderBadges = () => (
    <div className="flex gap-2 mb-4">
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Progress Badge
      </Badge>
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Quick Learner
      </Badge>
      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
        Detail Master
      </Badge>
    </div>
  );

  const renderAIAssistant = () => (
    <div className="bg-slate-50 p-4 rounded-lg mb-4 flex items-start gap-3">
      <Bot className="h-6 w-6 text-primary mt-1" />
      <div>
        <h4 className="font-medium mb-1">AI Assistant Tips</h4>
        <p className="text-sm text-muted-foreground">
          {currentStep === 1 && "Start with your basic information. You can use voice input for faster entry!"}
          {currentStep === 2 && "Tell us about your business. This helps us tailor our services to your needs."}
          {currentStep === 3 && "Upload any relevant documents that might help us understand your situation better."}
          {currentStep === 4 && "Choose a time that works best for your initial consultation."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>New Client Intake</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleRecording}
              className={isRecording ? "animate-pulse" : ""}
            >
              {isRecording ? (
                <PauseCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {renderBadges()}
            {renderAIAssistant()}

            {isRecording && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  Transcribing: {transcription}
                </p>
              </div>
            )}

            <Tabs value={`step-${currentStep}`} className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="step-1">Basic Info</TabsTrigger>
                <TabsTrigger value="step-2">Business</TabsTrigger>
                <TabsTrigger value="step-3">Documents</TabsTrigger>
                <TabsTrigger value="step-4">Schedule</TabsTrigger>
              </TabsList>

              <FormSteps 
                currentStep={currentStep}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleEmploymentTypeChange={handleEmploymentTypeChange}
              />
            </Tabs>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={currentStep === totalSteps}
                className="gap-2"
              >
                {currentStep === totalSteps ? "Complete" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
