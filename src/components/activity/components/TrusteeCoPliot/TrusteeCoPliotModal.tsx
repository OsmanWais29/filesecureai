
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Mic, Send, ArrowRight, AlertCircle, CheckCircle, FileUp, X } from "lucide-react";
import { FileUploadSection } from "../../form/upload/FileUploadSection";

interface TrusteeCoPliotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
}

export const TrusteeCoPliotModal = ({
  open,
  onOpenChange,
  clientId
}: TrusteeCoPliotModalProps) => {
  const [activeTab, setActiveTab] = useState<string>("conversation");
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(23);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hi there! I'm your TrusteeCo-Pilot. Let's get started on your monthly Form 65. What was your source of income this month?" },
  ]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulating microphone access
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(stream => {
          console.log("Microphone accessed");
          // In a real implementation, we would start recording here
          // For simulation, we'll just set a fake response after 2 seconds
          setTimeout(() => {
            addMessage("user", "I received my regular salary plus some cash from a side job.");
            setTimeout(() => {
              addMessage("assistant", "Thank you. For your regular salary, could you upload a paystub? For the side job income, we'll need to document this carefully. Can you tell me approximately how much you earned from your side job?");
            }, 1000);
          }, 2000);
        })
        .catch(err => {
          console.error("Error accessing microphone:", err);
          addMessage("assistant", "I couldn't access your microphone. You can type your response instead.");
        });
    } else {
      // Would stop recording here in a real implementation
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      addMessage("user", message);
      setMessage("");
      
      // Simulate AI response
      setTimeout(() => {
        if (message.toLowerCase().includes("paystub") || message.toLowerCase().includes("upload")) {
          addMessage("assistant", "Great! Please upload your paystub or income statement in the Documents tab. I'll help you verify the information.");
          setActiveTab("documents");
        } else if (message.toLowerCase().includes("$")) {
          addMessage("assistant", "I've noted that amount. Could you provide any documentation for this income? If not, we'll need to create an exception memo explaining why.");
          // Increase completion percentage
          setCompletionPercentage(Math.min(completionPercentage + 10, 100));
        } else {
          addMessage("assistant", "I understand. Let's continue with your income verification. Did you receive any government benefits this month?");
        }
      }, 1000);
    }
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setChatMessages(prev => [...prev, { role, content }]);
  };

  const handleDocumentUpload = (documentId: string) => {
    console.log("Document uploaded:", documentId);
    
    // Simulate document processing
    setTimeout(() => {
      addMessage("assistant", "Thank you for uploading the document. I've analyzed it and found the following information:\n\n- Net Pay: $2,420.35\n- Employer: ABC Company\n- Pay Period: July 1-15, 2024\n\nIs this correct? This differs from your entered amount of $2,000.");
      setActiveTab("conversation");
      setCompletionPercentage(Math.min(completionPercentage + 15, 100));
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> 
            TrusteeCo-Pilot Assistant
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              AI-Powered
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 overflow-hidden">
          {/* Left Panel - Chat & Documents */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md mb-4">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content.split('\n').map((text, i) => (
                          <React.Fragment key={i}>
                            {text}
                            {i < msg.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    size="icon" 
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <FileUploadSection 
                    clientName={clientId ? `Client-${clientId}` : "New Client"}
                    onDocumentUpload={handleDocumentUpload}
                  />
                </div>
              </TabsContent>

              <TabsContent value="verification" className="flex-1 overflow-y-auto">
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Form Completion Status</CardTitle>
                    <CardDescription>
                      {completionPercentage < 50 
                        ? "You still have several items to complete" 
                        : completionPercentage < 90 
                          ? "Good progress, just a few more items needed" 
                          : "Almost done!"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={completionPercentage} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">{completionPercentage}% complete</p>
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Income Details</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">Primary income verified with paystub</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-medium">Additional Income</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">Side income requires documentation</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium">Expense Verification</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">Rent receipt needed</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Panel - Status & Stats */}
          <div className="w-full sm:w-64 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Directive 11R2 Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">Net Income</p>
                    <p className="text-muted-foreground">$2,420.35</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Threshold</p>
                    <p className="text-muted-foreground">$2,203.00</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Surplus</p>
                    <p className="text-muted-foreground">$217.35</p>
                  </div>
                  <div className="pt-2">
                    <Progress value={75} className="h-2" />
                    <p className="text-xs mt-1">75% Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Risk</span>
                  <span className="text-xs text-muted-foreground">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium Risk</span>
                  <span className="text-xs text-muted-foreground">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Risk</span>
                  <span className="text-xs text-muted-foreground">3</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Uploaded</span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <span className="text-xs text-muted-foreground">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Verified</span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button className="w-full flex items-center gap-2">
              Request Trustee Review
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
