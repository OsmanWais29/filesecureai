
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
interface SubmitButtonProps {
  isAnalyzing: boolean;
  overallStatus: 'pending' | 'failed' | 'passed';
  onValidationComplete: (isValid: boolean) => void;
}

export const SubmitButton = ({ 
  isAnalyzing, 
  overallStatus, 
  onValidationComplete 
}: SubmitButtonProps) => {
  const handleClick = async () => {
    onValidationComplete(overallStatus === 'passed');
    
    // Only create notification if validation is passed
    if (overallStatus === 'passed') {
      try {
        const userData = await supabase.auth.getUser();
        if (userData.data.user) {
          await sfaiFunctions.invoke('handle-notifications', {
            body: {
              action: 'create',
              userId: userData.data.user.id,
              notification: {
                title: 'Document Validated Successfully',
                message: 'Your document has passed validation and is ready for e-filing',
                type: 'success',
                category: 'file_activity',
                priority: 'normal',
                action_url: '/e-filing',
                metadata: {
                  validationStatus: 'passed',
                  timestamp: new Date().toISOString()
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('Error creating validation notification:', error);
        // Continue with the process even if notification fails
      }
    }
  };
  
  return (
    <Button 
      className="w-full mt-6"
      onClick={handleClick}
      disabled={isAnalyzing || overallStatus === 'failed'}
    >
      {isAnalyzing ? (
        <>Analyzing Document...</>
      ) : overallStatus === 'passed' ? (
        <>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirm Document Review
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Review Required Issues
        </>
      )}
    </Button>
  );
};
