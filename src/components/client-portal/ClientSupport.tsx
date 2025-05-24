
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  title: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const ClientSupport = () => {
  const { user } = useAuthState();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (user) {
      fetchSupportTickets();
    }
  }, [user]);

  const fetchSupportTickets = async () => {
    try {
      // For now, we'll simulate some support tickets
      // In a real app, you'd fetch from a support_tickets table
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          title: 'Question about monthly payments',
          message: 'I need clarification about my upcoming payment schedule.',
          status: 'resolved',
          priority: 'medium',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-16T14:30:00Z'
        },
        {
          id: '2',
          title: 'Document upload issue',
          message: 'Having trouble uploading my bank statements.',
          status: 'in_progress',
          priority: 'high',
          created_at: '2024-01-20T09:00:00Z',
          updated_at: '2024-01-20T15:00:00Z'
        }
      ];
      
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const createSupportTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsCreatingTicket(true);
      
      // In a real app, you'd insert into a support_tickets table
      const mockNewTicket: SupportTicket = {
        id: Date.now().toString(),
        title: newTicket.title,
        message: newTicket.message,
        status: 'open',
        priority: newTicket.priority as 'low' | 'medium' | 'high',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTickets([mockNewTicket, ...tickets]);
      setNewTicket({ title: '', message: '', priority: 'medium' });
      toast.success('Support ticket created successfully');
      
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'secondary';
      case 'in_progress': return 'default';
      default: return 'destructive';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with your questions and issues
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-sm text-muted-foreground">1-800-123-4567</p>
                <p className="text-xs text-muted-foreground">Mon-Fri 9AM-5PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground">support@trustee.com</p>
                <p className="text-xs text-muted-foreground">24-48 hour response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Available now</p>
                <Button size="sm" className="mt-1">
                  Start Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>
            Describe your issue and we'll get back to you as soon as possible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Brief description of your issue"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Please provide details about your issue..."
              rows={4}
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
            />
          </div>

          <Button 
            onClick={createSupportTicket}
            disabled={isCreatingTicket}
            className="w-full"
          >
            {isCreatingTicket ? 'Submitting...' : 'Submit Support Request'}
          </Button>
        </CardContent>
      </Card>

      {/* Support Tickets History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Support Requests</h2>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader className="h-20 bg-muted"></CardHeader>
              </Card>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No support requests yet</h3>
                <p className="text-muted-foreground">
                  Submit your first support request using the form above
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                    {ticket.updated_at !== ticket.created_at && (
                      <> • Updated: {new Date(ticket.updated_at).toLocaleDateString()}</>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
