
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, ArrowLeft, Upload, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthState } from "@/hooks/useAuthState";

const NewSupportTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim() || !category) {
      toast.error("Please fill all required fields", {
        description: "Subject, category and message are required."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'supportRequest',
          userId: 'admin', // This would target the admin or support team
          notification: {
            message: message,
            action_url: "/support",
            metadata: {
              subject: subject,
              userId: user?.id,
              userName: user?.user_metadata?.full_name || user?.email,
              priority: priority,
              category: category,
              requestTime: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success("Support ticket submitted", { 
        description: "We'll get back to you as soon as possible."
      });
      
      // Redirect back to the support page after successful submission
      setTimeout(() => navigate("/support"), 1000);
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast.error("Failed to submit ticket", {
        description: "Please try again or contact support directly."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/support")} 
          className="mb-6 hover:bg-transparent px-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Support
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">New Support Ticket</h1>
          <p className="text-muted-foreground">Submit a detailed support request and we'll get back to you shortly</p>
        </div>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Support Ticket Details</CardTitle>
            <CardDescription>
              Provide as much information as possible to help us resolve your issue quickly
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Subscription</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="ai">AI & Analysis</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="priority">Priority</Label>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      priority === "low" ? "bg-green-500" : 
                      priority === "normal" ? "bg-amber-500" : 
                      "bg-red-500"
                    }`} />
                    <span className="text-xs text-muted-foreground">
                      {priority === "low" ? "Low" : priority === "normal" ? "Normal" : "High"}
                    </span>
                  </div>
                </div>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Low - General inquiry or minor issue</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span>Normal - Standard support request</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>High - Urgent issue affecting workflow</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail including any error messages you received..."
                  className="min-h-[200px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Supports: PDF, PNG, JPG, DOCX (Max 10MB each)
                  </p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Paperclip className="h-4 w-4" />
                    Choose Files
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" type="button" onClick={() => navigate("/support")}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !subject.trim() || !message.trim() || !category}
              >
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewSupportTicket;
