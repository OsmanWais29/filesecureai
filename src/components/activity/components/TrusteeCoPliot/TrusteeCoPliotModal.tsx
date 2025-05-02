
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Bot, Mic, Send, ArrowRight, AlertCircle, CheckCircle, X, 
  FileCheck, AlertTriangle, CreditCard, Wallet, ReceiptText, 
  FileText, HelpCircle, ShieldAlert, ShieldCheck 
} from "lucide-react";

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
          addMessage("assistant", "Thank you for providing that information. I'll make a note of it in your file.");
          // Increase completion percentage
          setCompletionPercentage(Math.min(completionPercentage + 10, 100));
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
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> 
            TrusteeCo-Pilot Assistant
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
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
              <div className="px-4 pt-2">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="conversation">Conversation</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent 
                value="conversation" 
                className="flex-1 flex flex-col overflow-hidden mt-0 pt-4 px-4 pb-4"
              >
                <div className="flex-1 overflow-y-auto border rounded-md mb-4">
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

              <TabsContent 
                value="verification" 
                className="flex-1 flex flex-col overflow-hidden mt-0"
              >
                {/* Completely revamped verification tab with proper layout */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {/* Verification Overview Card */}
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Verification Overview</CardTitle>
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
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Risk Profile</CardTitle>
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
                          <AccordionItem key={section.id} value={section.id} className="border rounded-md overflow-hidden">
                            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline hover:bg-muted/50">
                              {section.title}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 pt-1">
                              <div className="space-y-2">
                                {section.items.map(item => (
                                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-md border border-gray-200 bg-card">
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
                  </div>
                  
                  {/* Sticky Action Button */}
                  <div className="sticky bottom-0 bg-background border-t p-4 mt-auto">
                    <Button className="w-full flex items-center justify-center gap-2">
                      Request Trustee Review
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Panel - Status & Stats */}
          <div className="w-full sm:w-64 p-4 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
            <div className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Directive 11R2 Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
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
                    <div className="pt-1">
                      <Progress value={75} className="h-2" />
                      <p className="text-xs mt-1">75% Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Assessment</CardTitle>
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
              
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileCheck className="h-4 w-4 text-green-500" />
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
              
              <Button className="w-full flex items-center gap-2">
                Request Trustee Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
