
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  CheckSquare, 
  ThumbsUp,
  ThumbsDown,
  Send,
  User,
  Bot
} from 'lucide-react';

interface TrusteeCoPliotProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface FeedbackState {
  rating: 'up' | 'down' | null;
  reason: string;
}

export const TrusteeCoPliot: React.FC<TrusteeCoPliotProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<'initial' | 'chat' | 'feedback' | 'complete'>('initial');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>({ rating: null, reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInitialSubmit = () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages([userMessage]);
    setUserInput('');
    setCurrentStep('chat');

    // AI responds after user's initial message
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Thanks for sharing that context! Now I can provide more targeted feedback. Based on what you've described, how would you rate the accuracy of our AI risk assessment for this document?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setCurrentStep('feedback');
    }, 1000);
  };

  const handleRating = (rating: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, rating }));
    
    if (rating === 'up') {
      handleSubmitFeedback(rating, '');
    }
  };

  const handleSubmitFeedback = async (rating: 'up' | 'down', reason?: string) => {
    setIsSubmitting(true);
    
    const feedbackData = {
      rating,
      reason: reason || feedback.reason,
      messages,
      documentContext: userInput,
      timestamp: new Date(),
      analysisContext: 'Trustee Co-Pilot Feedback'
    };
    
    console.log('Trustee Co-Pilot Feedback:', feedbackData);
    
    setTimeout(() => {
      setCurrentStep('complete');
      setIsSubmitting(false);
      
      setTimeout(() => {
        onClose();
        // Reset state for next use
        setCurrentStep('initial');
        setMessages([]);
        setUserInput('');
        setFeedback({ rating: null, reason: '' });
      }, 3000);
    }, 1000);
  };

  if (currentStep === 'complete') {
    return (
      <div className="p-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-sm text-green-700">
              Your input helps improve our AI analysis for all trustees.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Trustee Co-Pilot™</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Help us improve AI analysis with your expert insight
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {currentStep === 'initial' ? (
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                <p>Hi! I'm here to help improve our AI analysis.</p>
                <p className="mt-1">Before we discuss the risk assessment, could you tell me what specific aspect of this document you were focusing on or any concerns you had while reviewing it?</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., I was looking for signature compliance issues, or I noticed some missing client information..."
                rows={3}
                className="text-sm resize-none"
              />
              <Button 
                onClick={handleInitialSubmit}
                disabled={!userInput.trim()}
                size="sm"
                className="w-full"
              >
                <Send className="h-3 w-3 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-100'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-3 w-3 text-white" />
                    ) : (
                      <Bot className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 max-w-[85%] text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Rating Section */}
            {currentStep === 'feedback' && (
              <div className="p-4 border-t bg-gray-50">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-center">Rate our AI analysis:</p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRating('up')}
                      disabled={isSubmitting}
                      className="flex flex-col items-center gap-1 h-auto py-3 px-4"
                    >
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs">Helpful</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRating('down')}
                      disabled={isSubmitting}
                      className="flex flex-col items-center gap-1 h-auto py-3 px-4"
                    >
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs">Not Helpful</span>
                    </Button>
                  </div>

                  {/* Feedback Form for Thumbs Down */}
                  {feedback.rating === 'down' && (
                    <div className="space-y-3 border-t pt-4">
                      <label className="text-xs font-medium">
                        Help us improve - What went wrong?
                      </label>
                      <Textarea
                        value={feedback.reason}
                        onChange={(e) => setFeedback(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Please be specific about what the AI missed or got wrong..."
                        rows={3}
                        className="text-sm resize-none"
                      />
                      <Button 
                        onClick={() => handleSubmitFeedback('down')}
                        disabled={!feedback.reason.trim() || isSubmitting}
                        size="sm"
                        className="w-full"
                      >
                        <Send className="h-3 w-3 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
