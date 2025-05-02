
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Bot, Mic, Send, ArrowRight, AlertCircle, CheckCircle, X, 
  FileCheck, AlertTriangle, CreditCard, Wallet, ReceiptText, 
  FileText, HelpCircle, ShieldAlert, ShieldCheck, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Enhanced verification data
  const verificationData = {
    sections: [
      {
        id: "income",
        title: "Income Verification",
        items: [
          { id: "primary", status: "verified", label: "Primary income", details: "Paystub verified ($2,420.35)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "secondary", status: "pending", label: "Secondary income", details: "Cash income needs documentation", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
          { id: "spouse", status: "missing", label: "Spouse income", details: "Documentation missing", icon: <X className="h-5 w-5 text-red-500" /> }
        ]
      },
      {
        id: "expenses",
        title: "Expense Verification",
        items: [
          { id: "rent", status: "verified", label: "Housing expenses", details: "Rent receipt verified ($1,200)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "utilities", status: "verified", label: "Utilities", details: "Matches average ($275)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "food", status: "flagged", label: "Food expenses", details: "Above threshold for household size", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> },
          { id: "transportation", status: "verified", label: "Transportation", details: "Within acceptable range", icon: <CheckCircle className="h-5 w-5 text-green-500" /> }
        ]
      },
      {
        id: "compliance",
        title: "Regulatory Compliance",
        items: [
          { id: "surplus", status: "flagged", label: "Surplus income", details: "Exceeds threshold by $217.35", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
          { id: "directive", status: "verified", label: "Directive 11R2", details: "Calculation follows current guidelines", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "exceptions", status: "required", label: "Exception memo", details: "Required for cash income", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> }
        ]
      },
      {
        id: "consistency",
        title: "Data Consistency",
        items: [
          { id: "month-over-month", status: "flagged", label: "Month-over-month", details: "15% increase in discretionary expenses", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
          { id: "family-size", status: "verified", label: "Family size alignment", details: "All dependents accounted for", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "cross-document", status: "verified", label: "Cross-document validation", details: "Form 65 matches intake data", icon: <CheckCircle className="h-5 w-5 text-green-500" /> }
        ]
      }
    ],
    riskProfile: {
      level: "medium",
      primaryFactors: [
        "Cash income without proper documentation",
        "Above-threshold food expenses",
        "Surplus income exceeds BIA guidelines"
      ],
      recommendations: [
        "Request exception memo for cash income",
        "Schedule verification meeting for expense review",
        "Review surplus income implications with trustee"
      ]
    },
    stats: {
      verified: 7,
      flagged: 4, 
      missing: 1,
      overallScore: 75
    }
  };

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      toast({
        title: "Microphone active",
        description: "Listening for your response...",
      });
      
      // Simulate microphone access
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(stream => {
          console.log("Microphone accessed");
          // Simulate voice recognition after a delay
          setTimeout(() => {
            addMessage("user", "I received my regular salary plus some cash from a side job.");
            setTimeout(() => {
              addMessage("assistant", "Thank you. For your regular salary, could you upload a paystub? For the side job income, we'll need to document this carefully. Can you tell me approximately how much you earned from your side job?");
              setIsRecording(false);
            }, 1000);
          }, 2000);
        })
        .catch(err => {
          console.error("Error accessing microphone:", err);
          addMessage("assistant", "I couldn't access your microphone. You can type your response instead.");
          setIsRecording(false);
          toast({
            variant: "destructive",
            title: "Microphone error",
            description: "Could not access your microphone. Please check permissions.",
          });
        });
    } else {
      // Stop recording
      setIsRecording(false);
      toast({
        title: "Microphone disabled",
        description: "Voice recording stopped.",
      });
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      addMessage("user", message);
      setMessage("");
      
      // Simulate progress increment
      setCompletionPercentage(prev => Math.min(prev + 5, 100));
      
      // Simulate AI response
      setTimeout(() => {
        if (message.toLowerCase().includes("paystub") || message.toLowerCase().includes("upload")) {
          addMessage("assistant", "Thank you for providing that information. I've made a note to verify the paystub when you upload it.");
          setCompletionPercentage(Math.min(completionPercentage + 10, 100));
        } else if (message.toLowerCase().includes("$")) {
          addMessage("assistant", "I've noted that amount. Could you provide any documentation for this income? If not, we'll need to create an exception memo explaining why.");
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

  // Helper function to get color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'required': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get risk level color
  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> 
            TrusteeCo-Pilot Assistant
            <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
              AI-Powered
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Chat & Verification */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-4 pt-4 border-b">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="conversation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Conversation
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Verification
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent 
                value="conversation" 
                className="flex-1 flex flex-col overflow-hidden mt-0 pt-4 px-4 pb-4"
              >
                <div id="chat-container" className="flex-1 overflow-y-auto border rounded-md mb-4">
                  <div className="p-4 space-y-4">
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
                </div>

                <div className="flex items-center space-x-2 p-2 border rounded-md bg-card">
                  <Button 
                    type="button" 
                    size="icon"
                    variant={isRecording ? "destructive" : "outline"}
                    className={cn(
                      "transition-all",
                      isRecording && "animate-pulse"
                    )}
                    onClick={toggleRecording}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[40px] resize-none"
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
                    variant="default"
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent 
                value="verification" 
                className="flex-1 overflow-y-auto m-0 p-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Verification Overview Card */}
                    <Card className="border shadow-sm bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          Verification Overview
                        </CardTitle>
                        <CardDescription>
                          {verificationData.stats.overallScore < 50 
                            ? "Significant verification issues detected" 
                            : verificationData.stats.overallScore < 80 
                              ? "Additional documentation may be required" 
                              : "Good progress, minor issues to address"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Progress value={verificationData.stats.overallScore} className="h-2 mb-2" />
                        <div className="text-sm text-muted-foreground flex justify-between">
                          <span>{verificationData.stats.overallScore}% verified</span>
                          <div className="flex gap-4">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {verificationData.stats.verified} verified
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              {verificationData.stats.flagged} flagged
                            </span>
                            <span className="flex items-center gap-1">
                              <X className="h-3 w-3 text-red-500" />
                              {verificationData.stats.missing} missing
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Risk Profile Card */}
                    <Card className="border shadow-sm bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            Risk Profile
                          </CardTitle>
                          <Badge className={getRiskLevelColor(verificationData.riskProfile.level)}>
                            {verificationData.riskProfile.level.charAt(0).toUpperCase() + verificationData.riskProfile.level.slice(1)} Risk
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Primary Risk Factors</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {verificationData.riskProfile.primaryFactors.map((factor, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">{factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {verificationData.riskProfile.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Detailed Verification Sections */}
                    <Accordion type="multiple" defaultValue={["income"]} className="space-y-3">
                      {verificationData.sections.map(section => (
                        <AccordionItem key={section.id} value={section.id} className="border rounded-md overflow-hidden bg-card">
                          <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline hover:bg-muted/50">
                            {section.title}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 pt-1">
                            <div className="space-y-2">
                              {section.items.map(item => (
                                <div key={item.id} className="flex items-start gap-3 p-2 rounded-md border border-gray-200 bg-background">
                                  <div className="mt-0.5">{item.icon}</div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <h4 className="font-medium">{item.label}</h4>
                                      <Badge className={getStatusColor(item.status)}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.details}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  {/* Sticky Action Button */}
                  <div className="sticky bottom-0 bg-background border-t p-4 w-full">
                    <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90">
                      <FileText className="h-4 w-4 mr-2" />
                      Request Trustee Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Panel - Status & Stats */}
          <div className="w-full sm:w-64 p-4 border-l border-gray-200 dark:border-gray-800 overflow-y-auto bg-muted/30">
            <div className="space-y-4">
              <Card className="border shadow-sm bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Directive 11R2 Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Net Income</p>
                      <p className="text-muted-foreground">$2,420.35</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Threshold</p>
                      <p className="text-muted-foreground">$2,203.00</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Surplus</p>
                      <p className="font-medium text-yellow-600">$217.35</p>
                    </div>
                    <div className="pt-1">
                      <Progress value={completionPercentage} className="h-2 mb-2" />
                      <p className="text-xs text-center">{completionPercentage}% Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      High Risk
                    </span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Medium Risk
                    </span>
                    <span className="text-xs text-muted-foreground">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Low Risk
                    </span>
                    <span className="text-xs text-muted-foreground">3</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Verified
                      </span>
                      <span className="text-xs text-muted-foreground">{verificationData.stats.verified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Flagged
                      </span>
                      <span className="text-xs text-muted-foreground">{verificationData.stats.flagged}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <X className="h-4 w-4 text-red-500" />
                        Missing
                      </span>
                      <span className="text-xs text-muted-foreground">{verificationData.stats.missing}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Help Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      BIA Guidelines
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Wallet className="h-4 w-4 mr-2" />
                      Surplus Calculator
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ReceiptText className="h-4 w-4 mr-2" />
                      Expense Standards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
