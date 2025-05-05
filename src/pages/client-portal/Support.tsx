
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";

const Support = () => {
  const { user } = useAuthState();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get client name from user metadata or fallback to email
  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Client";
  
  const handleSendSupportRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'supportRequest',
          userId: 'admin', // This would target the admin or trustee in a real system
          notification: {
            message,
            action_url: "/support",
            metadata: {
              clientId: user?.id,
              clientName,
              requestTime: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success("Support request submitted", { 
        description: "A trustee will respond to your request shortly."
      });
      
      setMessage("");
    } catch (error) {
      console.error("Error sending support request:", error);
      toast.error("Failed to send request", {
        description: "Please try again or contact your trustee directly"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Support</h1>
      <p className="text-muted-foreground mb-6">
        Get help with your case or ask general questions.
      </p>
      
      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Your Trustee
            </CardTitle>
            <CardDescription>
              Send a message to your trustee and they'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSendSupportRequest}>
            <CardContent>
              <Textarea 
                placeholder="Describe your question or issue..." 
                className="min-h-[150px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card className="shadow-sm bg-muted/50">
          <CardHeader>
            <CardTitle>Common Questions</CardTitle>
            <CardDescription>
              Find answers to frequently asked questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold">What is a consumer proposal?</h3>
              <p className="text-sm text-muted-foreground">
                A consumer proposal is a formal, legally binding process that is administered by a Licensed Insolvency Trustee. In this process, we work with you to develop a "proposal"—an offer to pay creditors a percentage of what is owed to them, extend the time to pay off the debts, or both.
              </p>
            </div>
            
            <div className="border-b pb-2">
              <h3 className="font-semibold">How long does bankruptcy last?</h3>
              <p className="text-sm text-muted-foreground">
                The length of a bankruptcy depends on several factors including whether it's a first bankruptcy, your income level, and whether you have surplus income. For a first-time bankruptcy with no surplus income, it typically lasts 9 months.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">What documents do I need to submit monthly?</h3>
              <p className="text-sm text-muted-foreground">
                You are required to submit proof of income (pay stubs, government benefits, etc.) and expense receipts each month. These documents help calculate your surplus income payment obligations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
