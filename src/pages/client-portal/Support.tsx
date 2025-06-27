
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Clock,
  Send
} from "lucide-react";

const faqItems = [
  {
    question: "How do I upload documents?",
    answer: "You can upload documents through the Documents section. Click on 'Request Document' and follow the instructions to securely upload your files."
  },
  {
    question: "When is my next payment due?",
    answer: "Payment schedules vary by case. Check your dashboard or contact your trustee for specific payment dates and amounts."
  },
  {
    question: "How can I contact my trustee?",
    answer: "You can contact your trustee through the messaging system in this portal, by phone, or email. Contact information is available in your case details."
  },
  {
    question: "What happens if I miss a payment?",
    answer: "Contact your trustee immediately if you anticipate missing a payment. They can discuss options and help you stay on track with your plan."
  }
];

const supportTickets = [
  {
    id: 1,
    subject: "Question about monthly report",
    status: "Open",
    date: "2024-01-15",
    lastUpdate: "2 hours ago"
  },
  {
    id: 2,
    subject: "Document upload issue",
    status: "Resolved",
    date: "2024-01-10",
    lastUpdate: "3 days ago"
  }
];

export const ClientSupport = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log("Submitting ticket:", { subject, message });
    setSubject("");
    setMessage("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600 mt-1">Get help and find answers to your questions</p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Chat with our support team</p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Phone className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-4">Call us directly</p>
            <Button variant="outline" className="w-full">
              (555) 123-4567
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">Send us an email</p>
            <Button variant="outline" className="w-full">
              support@example.com
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Support Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit Support Ticket
            </CardTitle>
            <CardDescription>
              Describe your issue and we'll get back to you soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Please provide detailed information about your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Your Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Support Tickets
            </CardTitle>
            <CardDescription>
              Track the status of your submitted tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{ticket.subject}</h4>
                  <Badge variant={ticket.status === "Open" ? "default" : "secondary"}>
                    {ticket.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Created: {ticket.date}</p>
                  <p>Last update: {ticket.lastUpdate}</p>
                </div>
              </div>
            ))}
            {supportTickets.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No support tickets submitted yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
