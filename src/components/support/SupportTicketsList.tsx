
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Ticket, Clock, AlertCircle, CheckCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SupportTicketsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for tickets
  const tickets = [
    {
      id: "TCK-001",
      subject: "Can't upload PDF documents",
      category: "general",
      priority: "high",
      status: "open",
      createdAt: "2 days ago",
      updatedAt: "1 hour ago",
      assignedTo: "Support Team"
    },
    {
      id: "TCK-002",
      subject: "AI analysis not working correctly",
      category: "ai",
      priority: "medium",
      status: "in-progress",
      createdAt: "5 days ago",
      updatedAt: "3 hours ago",
      assignedTo: "AI Support"
    },
    {
      id: "TCK-003",
      subject: "Need help with legal document templates",
      category: "legal",
      priority: "low",
      status: "closed",
      createdAt: "2 weeks ago",
      updatedAt: "1 week ago",
      assignedTo: "Legal Team"
    }
  ];

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Clock className="h-3 w-3 mr-1" /> Open
        </Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" /> In Progress
        </Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Resolved
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-600 hover:bg-amber-200">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Ticket className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">My Support Tickets</h2>
        </div>
        <Button onClick={() => navigate("/support/new")}>New Ticket</Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-1">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 pt-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md cursor-pointer transition-shadow" onClick={() => navigate(`/support/tickets/${ticket.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <div className="flex justify-between text-sm">
                      <span>Assigned to: {ticket.assignedTo}</span>
                      <span>Created: {ticket.createdAt} • Updated: {ticket.updatedAt}</span>
                    </div>
                  </CardDescription>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No tickets found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchQuery ? `No results for "${searchQuery}"` : "You haven't created any support tickets yet"}
              </p>
              <Button onClick={() => navigate("/support/new")}>Create Your First Ticket</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="open">
          {/* Filter by open status */}
          <div className="pt-4">
            {filteredTickets.filter(t => t.status === 'open').length > 0 ? (
              filteredTickets.filter(t => t.status === 'open').map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md cursor-pointer transition-shadow mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      <div className="flex justify-between text-sm">
                        <span>Assigned to: {ticket.assignedTo}</span>
                        <span>Created: {ticket.createdAt} • Updated: {ticket.updatedAt}</span>
                      </div>
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No open tickets</h3>
                <p className="text-muted-foreground mt-1">No open tickets found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          {/* Filter by in-progress status */}
          <div className="pt-4">
            {filteredTickets.filter(t => t.status === 'in-progress').length > 0 ? (
              filteredTickets.filter(t => t.status === 'in-progress').map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md cursor-pointer transition-shadow mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      <div className="flex justify-between text-sm">
                        <span>Assigned to: {ticket.assignedTo}</span>
                        <span>Created: {ticket.createdAt} • Updated: {ticket.updatedAt}</span>
                      </div>
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No tickets in progress</h3>
                <p className="text-muted-foreground mt-1">No tickets are currently being worked on</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="closed">
          {/* Filter by closed status */}
          <div className="pt-4">
            {filteredTickets.filter(t => t.status === 'closed').length > 0 ? (
              filteredTickets.filter(t => t.status === 'closed').map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md cursor-pointer transition-shadow mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      <div className="flex justify-between text-sm">
                        <span>Assigned to: {ticket.assignedTo}</span>
                        <span>Created: {ticket.createdAt} • Updated: {ticket.updatedAt}</span>
                      </div>
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No closed tickets</h3>
                <p className="text-muted-foreground mt-1">You have no resolved tickets</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
