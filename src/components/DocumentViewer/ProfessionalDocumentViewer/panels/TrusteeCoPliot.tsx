
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  CheckSquare, 
  Send
} from 'lucide-react';

interface TrusteeCoPliotProps {
  onClose: () => void;
}

interface FeedbackForm {
  problemDescription: string;
  pageNumber: number;
  whatWentWrong: string;
  expectedResult: string;
}

export const TrusteeCoPliot: React.FC<TrusteeCoPliotProps> = ({ onClose }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    problemDescription: '',
    pageNumber: 1,
    whatWentWrong: '',
    expectedResult: ''
  });

  const handleSubmitFeedback = async () => {
    // Here you would submit to Supabase or your backend for reinforcement learning
    console.log('Trustee Co-Pilot Feedback:', feedbackForm);
    setFeedbackSubmitted(true);
    
    // Auto-return after 3 seconds
    setTimeout(() => {
      onClose();
      setFeedbackSubmitted(false);
      setFeedbackForm({
        problemDescription: '',
        pageNumber: 1,
        whatWentWrong: '',
        expectedResult: ''
      });
    }, 3000);
  };

  if (feedbackSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Thank you for improving our AI!
          </h3>
          <p className="text-green-700">
            Your feedback will help train our analysis engine to be more accurate for trustees like you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Brain className="h-4 w-4 mr-2 text-blue-600" />
            Help Us Learn - Describe the Analysis Problem
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell us exactly what went wrong with the AI analysis so we can improve it for all trustees.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What page are you looking at?
            </label>
            <Input
              type="number"
              value={feedbackForm.pageNumber}
              onChange={(e) => setFeedbackForm(prev => ({ 
                ...prev, 
                pageNumber: parseInt(e.target.value) || 1 
              }))}
              className="w-20"
              min="1"
              placeholder="1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe the problem in your own words
            </label>
            <Textarea
              value={feedbackForm.problemDescription}
              onChange={(e) => setFeedbackForm(prev => ({ 
                ...prev, 
                problemDescription: e.target.value 
              }))}
              placeholder="For example: 'The AI flagged a missing signature, but the trustee signature is clearly visible in the bottom right corner of page 3...'"
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              What specifically went wrong with the AI analysis?
            </label>
            <Textarea
              value={feedbackForm.whatWentWrong}
              onChange={(e) => setFeedbackForm(prev => ({ 
                ...prev, 
                whatWentWrong: e.target.value 
              }))}
              placeholder="Be specific: 'False positive', 'Missed detection', 'Wrong BIA citation', 'Incorrect form classification', etc."
              rows={2}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              What should the correct analysis have been?
            </label>
            <Textarea
              value={feedbackForm.expectedResult}
              onChange={(e) => setFeedbackForm(prev => ({ 
                ...prev, 
                expectedResult: e.target.value 
              }))}
              placeholder="Tell us what the AI should have detected or not detected..."
              rows={2}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleSubmitFeedback}
            disabled={!feedbackForm.problemDescription.trim() || !feedbackForm.whatWentWrong.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit to Trustee Co-Pilot
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Your feedback helps improve AI accuracy for all Canadian insolvency professionals
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
