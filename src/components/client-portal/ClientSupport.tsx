
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";

interface Message {
  id: string;
  content: string;
  sender: "client" | "trustee";
  timestamp: Date;
  read: boolean;
}

export const ClientSupport = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthState();
  
  // Placeholder messages for demonstration
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg1",
      content: "Welcome to the support center! How can we help you today?",
      sender: "trustee",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the message to the backend
      // For now, we'll just simulate adding it to the list
      const newMessage: Message = {
        id: `msg${Date.now()}`,
        content: message,
        sender: "client",
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
      
      toast.success("Message sent successfully", {
        description: "Your trustee will respond soon"
      });
      
      // Simulate a response for demonstration purposes
      setTimeout(() => {
        const responseMessage: Message = {
          id: `msg${Date.now() + 1}`,
          content: "Thank you for your message. A trustee will review it and get back to you as soon as possible.",
          sender: "trustee",
          timestamp: new Date(),
          read: false
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message", {
        description: "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <p className="text-muted-foreground mb-6">
        Need assistance? Send a message to your trustee.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Support messages */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Support Messages
              </CardTitle>
              <CardDescription>
                Your conversation with the support team
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === 'client' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 flex items-center ${
                      msg.sender === 'client' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {msg.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t p-4">
              <div className="w-full flex items-center gap-2">
                <Textarea 
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isSubmitting || !message.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Support info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Support Information</CardTitle>
              <CardDescription>Ways to get help</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Contact Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 5:00 PM
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Emergency Contact</h3>
                <p className="text-sm text-muted-foreground">
                  For urgent matters outside regular hours:
                  <br />
                  Phone: (555) 123-4567
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 1 business day.
                </p>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
                <ul className="space-y-1">
                  <li className="text-sm underline cursor-pointer text-primary">
                    How do I update my personal information?
                  </li>
                  <li className="text-sm underline cursor-pointer text-primary">
                    What documents do I need to upload?
                  </li>
                  <li className="text-sm underline cursor-pointer text-primary">
                    How can I schedule an appointment?
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
