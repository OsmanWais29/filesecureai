
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Bot, HelpCircle, MessageCircle, Search, Send } from "lucide-react";
import { toast } from "sonner";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [message, setMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { id: 1, content: "Hello! I'm your AI assistant. How can I help you today?", sender: "ai" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // FAQs for the knowledge base
  const faqs = [
    {
      id: 1,
      question: "How do I upload documents?",
      answer: "You can upload documents by going to the Documents section and clicking on the Upload button. We accept PDF, Word, and image files.",
      category: "documents"
    },
    {
      id: 2,
      question: "When will my bankruptcy discharge happen?",
      answer: "For a first-time bankruptcy, discharge typically occurs after 9 months, provided all requirements are met. Your trustee will provide the exact timeline for your specific case.",
      category: "legal"
    },
    {
      id: 3,
      question: "How do I complete my monthly income and expense reports?",
      answer: "You can complete your monthly income and expense reports through the Tasks section. Click on the pending task and fill out the required information by the specified deadline.",
      category: "tasks"
    },
    {
      id: 4,
      question: "I forgot my password. How do I reset it?",
      answer: "Click on the 'Forgot Password' link on the login page. You will receive an email with instructions to reset your password.",
      category: "account"
    },
    {
      id: 5,
      question: "How do I schedule an appointment with my trustee?",
      answer: "Navigate to the Appointments section and click on 'Schedule New Appointment'. Follow the instructions to choose an available time slot.",
      category: "appointments"
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    // In a real application, this would submit to a backend API
    toast.success("Support ticket submitted successfully. We'll respond to you shortly.");
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setAiMessages([...aiMessages, { id: aiMessages.length + 1, content: message, sender: "user" }]);
    setMessage('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your question. Based on your case details, I can provide the following information...",
        "Thank you for your question. Let me check the relevant information for you...",
        "That's a good question. Here's what you need to know about this topic...",
        "I'm looking into that for you. Based on your case status, here's what I can tell you..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setAiMessages(prev => [...prev, { id: prev.length + 1, content: randomResponse, sender: "ai" }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Support</h1>
            <p className="text-muted-foreground">Get help with your insolvency case or technical issues</p>
          </div>
          <Button onClick={() => setShowAIChat(!showAIChat)} className="flex items-center gap-2">
            <Bot size={18} />
            <span>{showAIChat ? "Close AI Assistant" : "AI Assistant"}</span>
          </Button>
        </div>

        {showAIChat && (
          <Card className="border shadow-sm">
            <CardHeader className="bg-primary text-white p-3">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <CardTitle className="text-base">AI Support Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-80 overflow-y-auto flex flex-col gap-3">
              {aiMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "user" ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:400ms]"></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 border-t">
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Type your question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="faq">Help Center</TabsTrigger>
            <TabsTrigger value="new-ticket">Create Ticket</TabsTrigger>
            <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Browse frequently asked questions or search for specific topics</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">{faq.question}</h3>
                          <p className="text-muted-foreground mt-1">{faq.answer}</p>
                          <div className="mt-2">
                            <Badge variant="outline">{faq.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No results found</h3>
                    <p className="text-muted-foreground mt-1">
                      We couldn't find any FAQs matching "{searchQuery}". 
                      Please try another search or create a support ticket.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new-ticket">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>Submit a new support request and our team will get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                    <Input id="subject" placeholder="Brief description of your issue" required />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                    <select
                      id="category"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="account">Account Issues</option>
                      <option value="documents">Document Problems</option>
                      <option value="technical">Technical Support</option>
                      <option value="payments">Payment Questions</option>
                      <option value="legal">Legal Questions</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Description</label>
                    <Textarea id="message" placeholder="Please provide details about your issue" rows={5} required />
                  </div>
                  <div>
                    <label htmlFor="attachment" className="block text-sm font-medium mb-1">Attachment (optional)</label>
                    <Input id="attachment" type="file" />
                  </div>
                  <Button type="submit" className="w-full">Submit Ticket</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="my-tickets">
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>Track and manage your existing support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "TKT-1234",
                      subject: "Question about monthly reporting",
                      status: "Open",
                      date: "May 1, 2025",
                      lastUpdated: "3 days ago"
                    },
                    {
                      id: "TKT-1189",
                      subject: "Document upload error",
                      status: "In Progress",
                      date: "April 25, 2025",
                      lastUpdated: "Yesterday"
                    },
                    {
                      id: "TKT-1023",
                      subject: "Meeting request with trustee",
                      status: "Closed",
                      date: "April 10, 2025",
                      lastUpdated: "April 15, 2025"
                    }
                  ].map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                            <Badge 
                              variant={ticket.status === "Closed" ? "outline" : "default"}
                              className={
                                ticket.status === "Open" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : 
                                ticket.status === "In Progress" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : 
                                "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                              }
                            >
                              {ticket.status}
                            </Badge>
                          </div>
                          <h3 className="font-medium mt-1">{ticket.subject}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created on {ticket.date} • Last updated {ticket.lastUpdated}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Empty state for when there are no tickets */}
                  {false && (
                    <div className="text-center py-10">
                      <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No tickets yet</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        You haven't created any support tickets yet
                      </p>
                      <Button>Create Your First Ticket</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;
