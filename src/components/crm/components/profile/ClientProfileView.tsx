
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Globe, User, Tag, AlertTriangle, CheckCircle, Brain, Activity, Calendar, FileText, MessageSquare } from "lucide-react";

export const ClientProfileView = () => {
  const [selectedClient, setSelectedClient] = useState("John Doe");

  // Mock data based on the image
  const clientData = {
    name: "John Doe",
    company: "Acme Corporation",
    role: "Chief Financial Officer",
    email: "client@example.com",
    phone: "(555) 123-4567",
    website: "www.clientwebsite.com",
    assignedTo: "Sarah Johnson",
    status: "Needs Attention",
    leadStatus: "In Progress",
    healthScore: 74,
    tags: ["Lead", "Financial Services", "High Value"]
  };

  const activities = [
    {
      type: "email",
      title: "Email opened: Monthly Newsletter",
      time: "about 2 hours ago",
      icon: <Mail className="h-4 w-4 text-blue-500" />
    },
    {
      type: "form",
      title: "Form submitted: Contact Request",
      time: "2 days ago",
      icon: <FileText className="h-4 w-4 text-green-500" />
    },
    {
      type: "call",
      title: "Call completed: Initial consultation",
      time: "7 days ago",
      icon: <Phone className="h-4 w-4 text-purple-500" />
    },
    {
      type: "meeting",
      title: "Meeting booked: Financial planning session",
      time: "14 days ago",
      icon: <Calendar className="h-4 w-4 text-indigo-500" />
    }
  ];

  const caseProgress = [
    { label: "Initial Contact Made", completed: true },
    { label: "Needs Assessment", completed: true },
    { label: "Proposal Sent", completed: true },
    { label: "Contract Negotiation", completed: false },
    { label: "Deal Closed", completed: false }
  ];

  return (
    <div className="h-full flex gap-6 p-6 bg-gray-50">
      {/* Left Panel - Client Profile */}
      <div className="w-80 flex-shrink-0">
        <Card className="p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-blue-700">{clientData.name}'s Profile</h2>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {clientData.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">View All Clients</Button>
            </div>
          </div>

          <div className="text-center mb-6">
            <Avatar className="h-24 w-24 mx-auto mb-3">
              <AvatarFallback className="text-2xl bg-gray-200">JD</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{clientData.name}</h3>
            <p className="text-gray-600">{clientData.company}</p>
            <p className="text-gray-500 text-sm">{clientData.role}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Contact Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{clientData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{clientData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{clientData.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Assigned to: {clientData.assignedTo}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Categories & Tags</h4>
              <div className="flex flex-wrap gap-2">
                {clientData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Panel - Activity & Timeline */}
      <div className="flex-1">
        <Card className="p-6 h-full">
          <h2 className="text-lg font-semibold mb-4">Client Activity & Timeline</h2>
          
          {/* Activity Alerts */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">Client hasn't been contacted in 14 days.</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-orange-700">
                Last touchpoint was a form submission on 6/23/2025. Consider follow-up.
              </span>
            </div>
          </div>

          <Tabs defaultValue="activity" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Activity Feed</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes & Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-4 space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="mt-0.5">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Timeline view</p>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Notes & Files</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Panel - Client Intelligence */}
      <div className="w-80 flex-shrink-0">
        <Card className="p-6 h-full">
          <h2 className="text-lg font-semibold mb-4">Client Intelligence</h2>
          
          <div className="space-y-6">
            {/* Lead Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Lead Status</label>
              <Select defaultValue="in-progress">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Health Score */}
            <div>
              <h3 className="font-medium mb-3">Account Health Score</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-teal-100 text-teal-700">Healthy</Badge>
                  <span className="font-bold text-lg">{clientData.healthScore}%</span>
                </div>
                <Progress value={clientData.healthScore} className="h-2" />
              </div>
            </div>

            {/* Risk Assessment */}
            <div>
              <h3 className="font-medium mb-3">Risk Assessment</h3>
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">High bounce rate.</span>
              </div>
            </div>

            {/* Case Progress */}
            <div>
              <h3 className="font-medium mb-3">Case Progress</h3>
              <Progress value={60} className="h-2 mb-3" />
              <div className="space-y-2">
                {caseProgress.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                      item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                AI Insights
              </h3>
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No insights available</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
