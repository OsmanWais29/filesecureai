
import React, { useState } from 'react';
import { DocumentDetails } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Brain, 
  CheckSquare, 
  X, 
  Send,
  User,
  Clock,
  Flag
} from 'lucide-react';
import { CollaborationPanel } from '../../CollaborationPanel';
import { TaskManager } from '../../TaskManager';

interface LeftPanelProps {
  document: DocumentDetails;
  onClose?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ document, onClose }) => {
  const [showTrusteeCoPilot, setShowTrusteeCoPilot] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
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
      setShowTrusteeCoPilot(false);
      setFeedbackSubmitted(false);
      setFeedbackForm({
        problemDescription: '',
        pageNumber: 1,
        whatWentWrong: '',
        expectedResult: ''
      });
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Toggle */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {showTrusteeCoPilot ? 'Trustee Co-Pilot™' : 'Collaboration'}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={showTrusteeCoPilot ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTrusteeCoPilot(!showTrusteeCoPilot)}
              className="text-xs"
            >
              <Brain className="h-3 w-3 mr-1" />
              Trustee Co-Pilot
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showTrusteeCoPilot ? (
          <div className="h-full p-4">
            {feedbackSubmitted ? (
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
            ) : (
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
            )}
          </div>
        ) : (
          <Tabs defaultValue="comments" className="h-full flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="comments" className="flex items-center text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center text-xs">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Tasks
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="comments" className="mt-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <CollaborationPanel 
                      document={document}
                      onCommentAdded={() => console.log('Comment added')}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <TaskManager
                      documentId={document.id}
                      onTaskUpdate={() => console.log('Task updated')}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};
