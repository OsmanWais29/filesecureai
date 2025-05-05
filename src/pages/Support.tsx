
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MessageCircle, Send, FilePlus, ArrowRight, ArrowUpRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
  const { user } = useAuthState();
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSendSupportRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !subject.trim()) {
      toast.error("Please enter both subject and message");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'supportRequest',
          userId: 'admin', // This would target the admin or trustee in a real system
          notification: {
            message: message,
            action_url: "/support",
            metadata: {
              subject: subject,
              userId: user?.id,
              userName: user?.user_metadata?.full_name || user?.email,
              requestTime: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success("Support request submitted", { 
        description: "Our team will respond to your request shortly."
      });
      
      setMessage("");
      setSubject("");
    } catch (error) {
      console.error("Error sending support request:", error);
      toast.error("Failed to send request", {
        description: "Please try again or contact support directly"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample FAQ questions
  const faqItems = [
    {
      question: "How do I upload multiple documents at once?",
      answer: "You can upload multiple documents by selecting them all in the file picker, or by dragging and dropping multiple files into the upload area."
    },
    {
      question: "How can I share documents with clients securely?",
      answer: "Navigate to the document you want to share, click on the 'Share' button, and choose your client from the dropdown. You can set permissions and expiration dates for added security."
    },
    {
      question: "Can I customize the AI analysis settings?",
      answer: "Yes, you can configure AI analysis settings in the Settings page under the 'AI & Analysis' tab to adjust sensitivity, detection thresholds, and focus areas."
    },
    {
      question: "How do I generate reports for client cases?",
      answer: "Go to the client's profile, select the 'Reports' tab, and choose from available report templates. You can customize the data points and export as PDF or Excel."
    }
  ];
  
  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-muted-foreground">Get help with SecureFiles AI or submit a support request</p>
          </div>
          <Link to="/support/new">
            <Button className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              New Support Ticket
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Send a message to our support team and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSendSupportRequest}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input 
                      id="subject" 
                      placeholder="Brief description of your issue" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea 
                      id="message"
                      placeholder="Describe your question or issue in detail..." 
                      className="min-h-[150px] resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !message.trim() || !subject.trim()}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Priority Support</CardTitle>
                  <CardDescription>For urgent matters requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact our priority support line for time-sensitive issues related to financial reporting, compliance, or system access problems.
                  </p>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Schedule Call
                    <ArrowUpRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Knowledge Base</CardTitle>
                  <CardDescription>Explore our comprehensive documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our knowledge base contains detailed guides, tutorials, and answers to frequently asked questions about SecureFiles AI.
                  </p>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    Browse Articles
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <Card key={index} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Support Tickets</CardTitle>
                <CardDescription>Track the status of your support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">File Upload Issue</h3>
                      <p className="text-sm text-muted-foreground">Unable to upload PDF files larger than 5MB</p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted: May 2, 2025</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Client Access Rights</h3>
                      <p className="text-sm text-muted-foreground">Need help setting up client permissions</p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted: April 28, 2025</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Resolved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Support;
