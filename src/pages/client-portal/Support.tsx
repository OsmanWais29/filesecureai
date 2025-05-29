
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  lastUpdate: string;
  description: string;
}

export const ClientSupport = () => {
  const { user } = useAuthState();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: ''
  });

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setTickets([
        {
          id: "1",
          subject: "Question about my proposal",
          status: "resolved",
          priority: "medium",
          createdDate: "2024-01-10",
          lastUpdate: "2024-01-12",
          description: "I have a question about the terms of my consumer proposal."
        },
        {
          id: "2",
          subject: "Document upload issue",
          status: "in-progress",
          priority: "high",
          createdDate: "2024-01-15",
          lastUpdate: "2024-01-16",
          description: "I'm unable to upload my latest income statement."
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const ticket: SupportTicket = {
        id: (tickets.length + 1).toString(),
        subject: newTicket.subject,
        status: 'open',
        priority: newTicket.priority,
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
        description: newTicket.description
      };

      setTickets([ticket, ...tickets]);
      setNewTicket({ subject: '', priority: 'medium', description: '' });
      setShowNewTicket(false);
      toast.success("Support ticket created successfully");
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white">
              <CardHeader className="h-20 bg-gray-100 rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-2">
              Get help with your questions and issues
            </p>
          </div>
          <Button 
            onClick={() => setShowNewTicket(!showNewTicket)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Quick Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-gray-900">Phone Support</CardTitle>
              <CardDescription className="text-gray-600">Call us for immediate assistance</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold text-gray-900">(416) 555-0123</p>
              <p className="text-sm text-gray-600">Mon-Fri: 9AM-5PM EST</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="text-center">
              <Mail className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-gray-900">Email Support</CardTitle>
              <CardDescription className="text-gray-600">Send us an email anytime</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold text-gray-900">support@trustee.com</p>
              <p className="text-sm text-gray-600">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-gray-900">Live Chat</CardTitle>
              <CardDescription className="text-gray-600">Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Start Chat
              </Button>
              <p className="text-sm text-gray-600 mt-2">Available during business hours</p>
            </CardContent>
          </Card>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Create New Support Ticket</CardTitle>
              <CardDescription className="text-gray-600">
                Describe your issue and we'll get back to you soon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-gray-700">Subject *</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    className="mt-1 border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="text-gray-700">Priority</Label>
                  <select
                    id="priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  placeholder="Please provide details about your issue..."
                  rows={4}
                  className="mt-1 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSubmitTicket} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
                <Button variant="outline" onClick={() => setShowNewTicket(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Tickets */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Your Support Tickets</CardTitle>
            <CardDescription className="text-gray-600">
              Track the status of your submitted tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-gray-900">No support tickets</h3>
                <p className="text-gray-600">
                  You haven't submitted any support tickets yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getStatusIcon(ticket.status)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Created: {formatDate(ticket.createdDate)}</span>
                            <span>Updated: {formatDate(ticket.lastUpdate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(ticket.status)} font-medium`}>
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(ticket.priority)} font-medium`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSupport;
