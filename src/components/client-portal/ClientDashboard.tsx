
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, FileTextIcon, CheckSquare, MessageCircle, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const ClientDashboard = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  
  // Get client name from user metadata or fallback to email
  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Client";

  // Upcoming payments data
  const upcomingPayments = [
    {
      date: "June 15, 2025",
      amount: "$450.00",
      status: "Upcoming"
    },
    {
      date: "May 15, 2025",
      amount: "$450.00",
      status: "Completed"
    },
    {
      date: "April 15, 2025",
      amount: "$450.00",
      status: "Completed"
    }
  ];

  // Handle assistance request
  const handleAssistanceRequest = async () => {
    if (!user) return;
    
    if (!helpMessage.trim()) {
      toast.error("Please provide details about your request");
      return;
    }
    
    setIsSubmittingRequest(true);
    
    try {
      // Create a notification in the system for staff
      const { error } = await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'supportRequest',
          userId: 'admin', // This would target the admin or trustee in a real system
          notification: {
            message: helpMessage,
            action_url: "/support",
            metadata: {
              clientId: user.id,
              clientName,
              requestTime: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success("Assistance request sent", {
        description: "A trustee will contact you shortly"
      });
      
      setIsHelpDialogOpen(false);
      setHelpMessage("");
    } catch (error) {
      console.error("Error sending assistance request:", error);
      toast.error("Failed to send request", {
        description: "Please try again or contact your trustee directly"
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-background min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/90 to-primary p-6 rounded-lg shadow-md text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {clientName}</h1>
            <p className="text-primary-foreground/90 max-w-xl">
              Access your documents, tasks, and appointments from your secure client portal. Your journey to financial recovery is well underway.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                Your Case Status
              </CardTitle>
              <CardDescription>Current status of your consumer proposal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-700 dark:text-green-500">
                    Active - Proposal Approved
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Next Important Date</p>
                  <div className="bg-primary/5 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Monthly Payment Due</p>
                      <p className="text-sm text-muted-foreground">June 15, 2025</p>
                    </div>
                    <Badge>$450.00</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileTextIcon className="h-5 w-5 mr-2 text-primary" />
                Upcoming Payments
              </CardTitle>
              <CardDescription>Track your payment schedule</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left font-medium text-sm px-4 py-3">Date</th>
                      <th className="text-left font-medium text-sm px-4 py-3">Amount</th>
                      <th className="text-right font-medium text-sm px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {upcomingPayments.map((payment, index) => (
                      <tr key={index} className={index === 0 ? "bg-primary/5" : ""}>
                        <td className="px-4 py-3 text-sm">{payment.date}</td>
                        <td className="px-4 py-3 text-sm font-medium">{payment.amount}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={payment.status === "Upcoming" ? "outline" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest interactions and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {[
                  { title: "Income Statement Uploaded", date: "May 2, 2025", icon: FileTextIcon, description: "Document reviewed by your trustee" },
                  { title: "Monthly Reporting Completed", date: "April 29, 2025", icon: CheckSquare, description: "April income and expense form submitted" },
                  { title: "Review Meeting Scheduled", date: "April 25, 2025", icon: CalendarIcon, description: "Virtual meeting with John Smith" }
                ].map((activity, index) => (
                  <li key={index} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex gap-4">
                      <div className="mt-0.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <activity.icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Assistance</DialogTitle>
            <DialogDescription>
              Explain what you need help with and a trustee will respond to your request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Please describe what you need help with..."
              className="min-h-[120px]"
              value={helpMessage}
              onChange={(e) => setHelpMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsHelpDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssistanceRequest} 
              disabled={isSubmittingRequest || !helpMessage.trim()}
            >
              {isSubmittingRequest ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
