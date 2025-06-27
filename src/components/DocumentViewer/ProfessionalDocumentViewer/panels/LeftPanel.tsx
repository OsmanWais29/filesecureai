
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
  AlertTriangle, 
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
    issueType: '',
    comment: '',
    pageNumber: 1,
    suggestedCorrection: ''
  });

  const handleSubmitFeedback = async () => {
    // Here you would submit to Supabase or your backend
    console.log('Feedback submitted:', feedbackForm);
    setFeedbackSubmitted(true);
    
    // Auto-return after 2 seconds
    setTimeout(() => {
      setShowTrusteeCoPilot(false);
      setFeedbackSubmitted(false);
      setFeedbackForm({
        issueType: '',
        comment: '',
        pageNumber: 1,
        suggestedCorrection: ''
      });
    }, 2000);
  };

  const issueTypes = [
    'Risk Incorrect',
    'Wrong BIA Citation', 
    'False Positive',
    'Missing Detection',
    'Incorrect Form Classification',
    'Other'
  ];

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
              <AlertTriangle className="h-3 w-3 mr-1" />
              Flag Analysis Error
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
                    Thank you for your feedback!
                  </h3>
                  <p className="text-green-700">
                    Your correction has been submitted and will help improve our AI accuracy.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Flag className="h-4 w-4 mr-2" />
                      Report Analysis Issue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Issue Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {issueTypes.map(type => (
                          <Button
                            key={type}
                            variant={feedbackForm.issueType === type ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setFeedbackForm(prev => ({ ...prev, issueType: type }))}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Page Number
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
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Comment
                      </label>
                      <Textarea
                        value={feedbackForm.comment}
                        onChange={(e) => setFeedbackForm(prev => ({ 
                          ...prev, 
                          comment: e.target.value 
                        }))}
                        placeholder="Describe the issue..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Suggested Correction (Optional)
                      </label>
                      <Textarea
                        value={feedbackForm.suggestedCorrection}
                        onChange={(e) => setFeedbackForm(prev => ({ 
                          ...prev, 
                          suggestedCorrection: e.target.value 
                        }))}
                        placeholder="What should the correct analysis be?"
                        rows={2}
                      />
                    </div>

                    <Button 
                      onClick={handleSubmitFeedback}
                      disabled={!feedbackForm.issueType || !feedbackForm.comment}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </Button>
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
