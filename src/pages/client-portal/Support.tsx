
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const ClientSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      subject: 'Question about Form 47',
      message: 'I need clarification on section 3 of my consumer proposal form.',
      status: 'in_progress',
      priority: 'medium',
      created_at: '2024-03-10T10:30:00Z',
      updated_at: '2024-03-11T14:15:00Z'
    },
    {
      id: '2',
      subject: 'Document upload issue',
      message: 'Having trouble uploading my bank statements. The file seems too large.',
      status: 'resolved',
      priority: 'low',
      created_at: '2024-03-08T09:00:00Z',
      updated_at: '2024-03-08T16:30:00Z'
    }
  ]);

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium' as const
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      subject: newTicket.subject,
      message: newTicket.message,
      status: 'open',
      priority: newTicket.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: '', message: '', priority: 'medium' });
    setShowNewTicket(false);
    toast.success('Support ticket submitted successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">
            Get help and support for your case
          </p>
        </div>
        <Button onClick={() => setShowNewTicket(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Support Request
        </Button>
      </div>

      {/* Contact Information */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Phone className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-medium mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Call us for immediate assistance
            </p>
            <p className="font-medium">1-800-TRUSTEE</p>
            <p className="text-xs text-muted-foreground">Mon-Fri 9AM-5PM EST</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-medium mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Send us your questions via email
            </p>
            <p className="font-medium">support@securefiles.ai</p>
            <p className="text-xs text-muted-foreground">Response within 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-medium mb-2">Online Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Submit a support ticket online
            </p>
            <Button variant="outline" size="sm" onClick={() => setShowNewTicket(true)}>
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <Card>
          <CardHeader>
            <CardTitle>New Support Request</CardTitle>
            <CardDescription>
              Describe your issue and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Provide detailed information about your issue..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit Request</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Tickets</CardTitle>
          <CardDescription>Track the status of your support requests</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No support tickets</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any support requests yet
              </p>
              <Button onClick={() => setShowNewTicket(true)}>
                Create Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {formatDate(ticket.created_at)}</span>
                        <span>Updated: {formatDate(ticket.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">How do I upload documents?</h4>
              <p className="text-sm text-muted-foreground">
                Go to the Documents section and use the upload button. Ensure your files are in PDF format and under 10MB.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">When will I hear back from my trustee?</h4>
              <p className="text-sm text-muted-foreground">
                Trustees typically respond within 1-2 business days. For urgent matters, please call our support line.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Can I reschedule my appointment?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can reschedule appointments up to 24 hours in advance through the Appointments section.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSupport;
