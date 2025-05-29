
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Mail, Clock, Search, Plus } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  lastUpdate: string;
  category: string;
}

export const ClientSupport = () => {
  const [tickets] = useState<SupportTicket[]>([
    {
      id: "1",
      subject: "Question about Form 47 completion",
      status: "resolved",
      priority: "medium",
      createdDate: "2024-01-15",
      lastUpdate: "2024-01-16",
      category: "Documentation"
    },
    {
      id: "2", 
      subject: "Need clarification on payment schedule",
      status: "in-progress",
      priority: "high",
      createdDate: "2024-01-20",
      lastUpdate: "2024-01-21",
      category: "Payments"
    }
  ]);

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    description: ''
  });

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
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Support Center</h1>
          <p className="text-gray-600 mt-2">
            Get help with your case or submit a support request
          </p>
        </div>
        <Button 
          onClick={() => setShowNewTicket(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Contact Information */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Phone Support</h3>
              <p className="text-sm text-gray-600 mt-1">(555) 123-4567</p>
              <p className="text-xs text-gray-500 mt-1">Mon-Fri 9AM-5PM</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Email Support</h3>
              <p className="text-sm text-gray-600 mt-1">support@securefiles.ai</p>
              <p className="text-xs text-gray-500 mt-1">24-48 hour response</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Live Chat</h3>
              <p className="text-sm text-gray-600 mt-1">Instant messaging</p>
              <p className="text-xs text-gray-500 mt-1">Mon-Fri 9AM-5PM</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
          <CardHeader>
            <CardTitle className="text-gray-800">Submit New Support Request</CardTitle>
            <CardDescription>
              Describe your issue and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                placeholder="Brief description of your issue"
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={newTicket.category}
                onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                className="w-full p-2 border border-blue-300 rounded-md focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a category</option>
                <option value="documentation">Documentation</option>
                <option value="payments">Payments</option>
                <option value="appointments">Appointments</option>
                <option value="technical">Technical Issues</option>
                <option value="general">General Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Please provide detailed information about your issue..."
                rows={4}
                className="border-blue-300 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Submit Ticket
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewTicket(false)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Tickets */}
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-800">My Support Tickets</CardTitle>
              <CardDescription>
                Track the status of your support requests
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input placeholder="Search tickets..." className="w-64 border-blue-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No support tickets</h3>
              <p className="text-gray-600">
                You haven't submitted any support requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border border-blue-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Category: {ticket.category} • Created: {formatDate(ticket.createdDate)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className={`${getPriorityColor(ticket.priority)} font-medium`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(ticket.status)} font-medium`}>
                        {ticket.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      Last updated: {formatDate(ticket.lastUpdate)}
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSupport;
