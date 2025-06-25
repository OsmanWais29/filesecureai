
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, MessageSquare, Brain, CheckCircle, XCircle } from "lucide-react";

interface AISidebarProps {
  onClose: () => void;
  uploadedFile: File | null;
  extractedFields: any[];
}

interface AIPrompt {
  id: string;
  text: string;
  type: 'suggestion' | 'question' | 'action';
}

interface AIResponse {
  id: string;
  promptId: string;
  content: string;
  confidence: number;
  accepted?: boolean;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  onClose,
  uploadedFile,
  extractedFields
}) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [responses, setResponses] = useState<AIResponse[]>([]);

  const quickPrompts: AIPrompt[] = [
    { id: '1', text: 'Fix incorrect values', type: 'action' },
    { id: '2', text: 'Re-run OCR on page 3 only', type: 'action' },
    { id: '3', text: 'Explain why this field is blank', type: 'question' },
    { id: '4', text: 'What BIA clause applies to Line 15000?', type: 'question' },
    { id: '5', text: 'Validate against Form 65 template', type: 'action' },
    { id: '6', text: 'Suggest missing required fields', type: 'suggestion' }
  ];

  const handleQuickPrompt = (prompt: AIPrompt) => {
    // Simulate AI response
    const response: AIResponse = {
      id: Date.now().toString(),
      promptId: prompt.id,
      content: `AI analysis for "${prompt.text}": Based on the current document, I suggest checking field values for accuracy. The confidence level for extracted data is currently 85%.`,
      confidence: 0.85
    };
    setResponses(prev => [...prev, response]);
  };

  const handleCustomPrompt = () => {
    if (!customPrompt.trim()) return;
    
    const response: AIResponse = {
      id: Date.now().toString(),
      promptId: 'custom',
      content: `AI response to "${customPrompt}": I'll analyze this request and provide recommendations based on the current document state.`,
      confidence: 0.78
    };
    setResponses(prev => [...prev, response]);
    setCustomPrompt("");
  };

  const handleAcceptSuggestion = (responseId: string) => {
    setResponses(prev => prev.map(r => 
      r.id === responseId ? { ...r, accepted: true } : r
    ));
  };

  const handleRejectSuggestion = (responseId: string) => {
    setResponses(prev => prev.map(r => 
      r.id === responseId ? { ...r, accepted: false } : r
    ));
  };

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Quick Prompts */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
          <div className="space-y-1">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => handleQuickPrompt(prompt)}
              >
                <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                <span className="text-xs">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Ask AI</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about the document..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleCustomPrompt}>
              Send
            </Button>
          </div>
        </div>

        {/* AI Responses */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">AI Suggestions</h3>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {responses.map((response) => (
                <Card key={response.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        Confidence: {Math.round(response.confidence * 100)}%
                      </Badge>
                      {response.accepted !== undefined && (
                        <Badge 
                          className={response.accepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {response.accepted ? 'Accepted' : 'Rejected'}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs leading-relaxed">{response.content}</p>
                    
                    {response.accepted === undefined && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleAcceptSuggestion(response.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleRejectSuggestion(response.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Document Stats */}
        {uploadedFile && (
          <Card className="p-3">
            <h3 className="text-sm font-medium mb-2">Document Analysis</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Fields Extracted: {extractedFields.length}</div>
              <div>Confidence: 87% avg</div>
              <div>Form Type: Detected as Form 65</div>
              <div>Status: Ready for review</div>
            </div>
          </Card>
        )}
      </CardContent>
    </div>
  );
};
