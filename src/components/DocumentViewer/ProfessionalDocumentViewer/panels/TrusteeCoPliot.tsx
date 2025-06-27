
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  CheckSquare, 
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send
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
  const [currentStep, setCurrentStep] = useState<'chat' | 'feedback' | 'complete'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your Trustee Co-Pilot. I noticed you're reviewing this document. How did our AI analysis perform?",
      timestamp: new Date()
    },
    {
      id: '2', 
      type: 'ai',
      content: "Did the risk assessment accurately identify all compliance issues in this document?",
      timestamp: new Date()
    }
  ]);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>({ rating: null, reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = () => {
    if (!userResponse.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserResponse('');

    // AI follow-up based on response
    setTimeout(() => {
      const followUpMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Thank you for that feedback. Based on your response, would you rate the overall AI analysis as helpful?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, followUpMessage]);
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
    
    // Here you would submit to Supabase or your backend for reinforcement learning
    const feedbackData = {
      rating,
      reason: reason || feedback.reason,
      messages,
      documentPage: 1, // Get from current page
      timestamp: new Date(),
      analysisContext: 'Document AI Analysis Feedback'
    };
    
    console.log('Trustee Co-Pilot Feedback:', feedbackData);
    
    setTimeout(() => {
      setCurrentStep('complete');
      setIsSubmitting(false);
      
      // Auto-return after 3 seconds
      setTimeout(() => {
        onClose();
        setCurrentStep('chat');
        setMessages([
          {
            id: '1',
            type: 'ai',
            content: "Hi! I'm your Trustee Co-Pilot. I noticed you're reviewing this document. How did our AI analysis perform?",
            timestamp: new Date()
          },
          {
            id: '2', 
            type: 'ai',
            content: "Did the risk assessment accurately identify all compliance issues in this document?",
            timestamp: new Date()
          }
        ]);
        setFeedback({ rating: null, reason: '' });
      }, 3000);
    }, 1000);
  };

  if (currentStep === 'complete') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Thank you for improving our AI!
          </h3>
          <p className="text-green-700">
            Your feedback helps train our analysis engine to provide better insights for all trustees.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Brain className="h-4 w-4 mr-2 text-blue-600" />
            Trustee Co-Pilot™
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Help us improve our AI analysis with your expert feedback
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          {currentStep === 'chat' && (
            <div className="flex gap-2">
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Share your thoughts about the AI analysis..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!userResponse.trim()}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Rating Section */}
          {currentStep === 'feedback' && (
            <div className="space-y-4 border-t pt-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-4">Rate the AI analysis:</p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleRating('up')}
                    className="flex flex-col items-center gap-2 h-auto py-4 px-6"
                    disabled={isSubmitting}
                  >
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Helpful</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleRating('down')}
                    className="flex flex-col items-center gap-2 h-auto py-4 px-6"
                    disabled={isSubmitting}
                  >
                    <ThumbsDown className="h-6 w-6 text-red-600" />
                    <span className="text-sm">Not Helpful</span>
                  </Button>
                </div>
              </div>

              {/* Feedback Form for Thumbs Down */}
              {feedback.rating === 'down' && (
                <div className="space-y-3 border-t pt-4">
                  <label className="text-sm font-medium">
                    Help us improve - What went wrong?
                  </label>
                  <Textarea
                    value={feedback.reason}
                    onChange={(e) => setFeedback(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please describe what the AI got wrong or missed. Be as specific as possible..."
                    rows={3}
                    className="resize-none"
                  />
                  <Button 
                    onClick={() => handleSubmitFeedback('down')}
                    disabled={!feedback.reason.trim() || isSubmitting}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
