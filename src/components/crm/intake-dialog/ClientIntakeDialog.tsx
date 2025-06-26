
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Mic, MicOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormData } from '../types';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { SchedulingStep } from './steps/SchedulingStep';

interface ClientIntakeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formProgress: number;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleEmploymentTypeChange: (value: string) => void;
  handleSubmitForm: () => void;
}

export const ClientIntakeDialog = ({
  isOpen,
  onClose,
  currentStep,
  setCurrentStep,
  formProgress,
  formData,
  handleInputChange,
  handleSelectChange,
  handleEmploymentTypeChange,
  handleSubmitForm
}: ClientIntakeDialogProps) => {
  const [isVoiceRecording, setIsVoiceRecording] = React.useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', tabValue: 'step-1' },
    { id: 2, title: 'Business', tabValue: 'step-2' },
    { id: 3, title: 'Documents', tabValue: 'step-3' },
    { id: 4, title: 'Schedule', tabValue: 'step-4' }
  ];

  const toggleVoiceRecording = () => {
    setIsVoiceRecording(!isVoiceRecording);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitForm();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderGamificationBadges = () => (
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            AI-Powered Client Intake
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleVoiceRecording}
            className={isVoiceRecording ? "animate-pulse text-red-500" : ""}
          >
            {isVoiceRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(formProgress)}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>

          {/* Gamification Badges */}
          {renderGamificationBadges()}

          {/* AI Assistant */}
          {renderAIAssistant()}

          {/* Voice Recording Indicator */}
          {isVoiceRecording && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Voice recording active - speak naturally to fill out the form
              </p>
            </div>
          )}

          {/* Step Tabs */}
          <Tabs value={`step-${currentStep}`} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              {steps.map((step) => (
                <TabsTrigger 
                  key={step.id} 
                  value={step.tabValue}
                  disabled={step.id > currentStep + 1}
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                >
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="step-1" className="space-y-4">
              <BasicInfoStep 
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
              />
            </TabsContent>

            <TabsContent value="step-2" className="space-y-4">
              <BusinessDetailsStep 
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleEmploymentTypeChange={handleEmploymentTypeChange}
              />
            </TabsContent>

            <TabsContent value="step-3" className="space-y-4">
              <DocumentUploadStep />
            </TabsContent>

            <TabsContent value="step-4" className="space-y-4">
              <SchedulingStep 
                formData={formData}
                handleSelectChange={handleSelectChange}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === 4 ? "Complete Intake" : "Next"}
              {currentStep < 4 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
