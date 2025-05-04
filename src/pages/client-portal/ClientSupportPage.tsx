
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  MessageCircle, 
  Send, 
  Search, 
  FileQuestion, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  PhoneCall,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const ClientSupportPage = () => {
  const [query, setQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("ai");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down' | null>>({});
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  
  // Mock data - in a real implementation, this would come from your API
  const faqs = [
    { 
      id: "1", 
      question: "How long does my bankruptcy last?", 
      answer: "For a first-time bankruptcy, the standard period is 9 months, though this can vary based on your surplus income and other factors. Your trustee will provide specific information based on your situation."
    },
    { 
      id: "2", 
      question: "What is surplus income?", 
      answer: "Surplus income is the amount you earn above the threshold set by the Office of the Superintendent of Bankruptcy. If your income exceeds this threshold, you may need to make additional payments to your creditors."
    },
    { 
      id: "3", 
      question: "How do I complete my monthly income and expense forms?", 
      answer: "Log into your client portal, navigate to 'Documents', and select 'Form 65'. Follow the on-screen instructions to submit your income and expenses for the month. You'll need to provide paystubs and evidence of expenses."
    },
    { 
      id: "4", 
      question: "When will my creditors stop contacting me?", 
      answer: "Once your bankruptcy or proposal is filed, an automatic stay of proceedings is put in place. This legally prevents creditors from contacting you directly. If you still receive calls, inform them of your filing and provide your trustee's contact information."
    },
    { 
      id: "5", 
      question: "How do I schedule a meeting with my trustee?", 
      answer: "You can schedule a meeting directly through the 'Appointments' section of your client portal. Choose your preferred date, time, and meeting method (phone, video, or in-person)."
    }
  ];

  const aiMessages = [
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your SecureFiles AI assistant. How can I help you with your bankruptcy or consumer proposal today?",
      timestamp: new Date().toISOString()
    }
  ];

  const categories = [
    { id: "technical", label: "Technical Issue" },
    { id: "account", label: "Account Management" },
    { id: "documents", label: "Document Problems" },
    { id: "financial", label: "Financial Questions" },
    { id: "other", label: "Other" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would search for FAQs or knowledge base articles here
    console.log("Searching for:", query);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, you would send this to your backend and update the state accordingly
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this ticket to your backend
    console.log("Submitting ticket:", { ticketTitle, ticketDescription, ticketCategory, ticketPriority });
    setTicketTitle("");
    setTicketDescription("");
    setTicketCategory("");
    setTicketPriority("medium");
    // Show confirmation or redirect
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackGiven(prev => ({ ...prev, [id]: type }));
    // In a real app, you would send this feedback to your backend
    console.log(`${type === 'up' ? 'Positive' : 'Negative'} feedback given for FAQ #${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">Find answers and get help with your questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Left column - Search and FAQs */}
        <div className="md:col-span-2 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for answers..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    Search
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Help Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex flex-col items-center p-4">
                  <FileQuestion className="h-10 w-10 text-blue-500 mb-2" />
                  <h3 className="font-medium text-center">Bankruptcy FAQ</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex flex-col items-center p-4">
                  <Sparkles className="h-10 w-10 text-purple-500 mb-2" />
                  <h3 className="font-medium text-center">Using The Portal</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex flex-col items-center p-4">
                  <PhoneCall className="h-10 w-10 text-green-500 mb-2" />
                  <h3 className="font-medium text-center">Contact Us</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to common questions about your bankruptcy or proposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-end gap-2">
                        <p className="text-xs text-muted-foreground mr-2">Was this helpful?</p>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={feedbackGiven[faq.id] === 'up' ? 'bg-green-100' : ''}
                          onClick={() => handleFeedback(faq.id, 'up')}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className={feedbackGiven[faq.id] === 'down' ? 'bg-red-100' : ''}
                          onClick={() => handleFeedback(faq.id, 'down')}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full flex items-center justify-between">
                <span>View more FAQs</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Submit a Ticket */}
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Let us know how we can help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ticket-title">Title</Label>
                  <Input
                    id="ticket-title"
                    placeholder="Brief summary of your issue"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ticket-category">Category</Label>
                  <select
                    id="ticket-category"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <RadioGroup
                    id="ticket-priority" 
                    value={ticketPriority}
                    onValueChange={setTicketPriority}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ticket-description">Description</Label>
                  <Textarea
                    id="ticket-description"
                    placeholder="Please provide details about your issue or question"
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">Submit Ticket</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column - AI Chat and Contact */}
        <div className="space-y-6">
          {/* AI Chat */}
          <Card className="flex flex-col h-[500px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Get immediate help with your questions
              </CardDescription>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {aiMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[90%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t mt-auto">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask me anything..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Answers are AI-generated and may not always be accurate
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Need to reach your trustee team?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <PhoneCall className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-muted-foreground">Monday - Friday, 9am - 5pm</p>
                    <p className="font-medium mt-1">1-800-555-1234</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-muted-foreground">Usually replies within 24 hours</p>
                    <p className="font-medium mt-1">support@securefilesai.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Office Hours</p>
                    <p className="text-muted-foreground">For in-person appointments</p>
                    <p className="mt-1">Monday - Friday: 9am - 5pm</p>
                    <p>Saturday: 10am - 2pm (by appointment)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientSupportPage;
