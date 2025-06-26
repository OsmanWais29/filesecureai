
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Clock, Users, TrendingUp, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react";
import { CalendarView } from "./scheduling/CalendarView";

const mockAppointments = [
  {
    id: "1",
    title: "Client Consultation - John Smith",
    time: "09:00 AM",
    duration: "1 hour",
    type: "consultation",
    status: "confirmed",
    client: "John Smith",
    location: "Office 201"
  },
  {
    id: "2",
    title: "Document Review - Sarah Johnson",
    time: "11:30 AM",
    duration: "45 minutes",
    type: "review",
    status: "pending",
    client: "Sarah Johnson",
    location: "Conference Room A"
  },
  {
    id: "3",
    title: "Court Hearing Prep",
    time: "02:00 PM",
    duration: "2 hours",
    type: "preparation",
    status: "confirmed",
    client: "Multiple",
    location: "Main Office"
  }
];

const upcomingAppointments = [
  {
    id: "4",
    title: "Initial Meeting - Michael Brown",
    date: "Tomorrow",
    time: "10:00 AM",
    type: "consultation",
    status: "confirmed"
  },
  {
    id: "5",
    title: "Follow-up - Lisa Davis",
    date: "Dec 28",
    time: "03:30 PM",
    type: "follow-up",
    status: "tentative"
  },
  {
    id: "6",
    title: "Asset Review - Robert Wilson",
    date: "Dec 29",
    time: "09:15 AM",
    type: "review",
    status: "confirmed"
  }
];

const teamMembers = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Senior Trustee",
    status: "available",
    avatar: "/placeholder.svg",
    phone: "(555) 123-4567",
    email: "sarah.mitchell@firm.com",
    currentTask: "Available",
    nextAvailable: "Now"
  },
  {
    id: "2",
    name: "David Chen",
    role: "Associate Trustee",
    status: "busy",
    avatar: "/placeholder.svg",
    phone: "(555) 234-5678",
    email: "david.chen@firm.com",
    currentTask: "Client Meeting",
    nextAvailable: "2:30 PM"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Case Administrator",
    status: "available",
    avatar: "/placeholder.svg",
    phone: "(555) 345-6789",
    email: "emily.rodriguez@firm.com",
    currentTask: "Document Review",
    nextAvailable: "Now"
  },
  {
    id: "4",
    name: "Michael Thompson",
    role: "Legal Assistant",
    status: "away",
    avatar: "/placeholder.svg",
    phone: "(555) 456-7890",
    email: "michael.thompson@firm.com",
    currentTask: "Out of Office",
    nextAvailable: "Tomorrow 9 AM"
  }
];

export const SmartSchedulingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "tentative": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "busy": return "bg-red-500";
      case "away": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Calendar</h2>
              <p className="text-gray-600">Intelligent scheduling with predictive insights</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            95% Efficiency Rate
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Meetings</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Hours</p>
                <p className="text-2xl font-bold text-green-600">4.5h</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Online</p>
                <p className="text-2xl font-bold text-blue-600">6/8</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Suggestions</p>
                <p className="text-2xl font-bold text-purple-600">3</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <CalendarView />
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{appointment.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{appointment.location}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {appointment.time} • {appointment.duration}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Coming Up */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-green-600" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{appointment.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{appointment.date} at {appointment.time}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Status - Horizontal Layout */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getTeamStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="truncate">{member.currentTask}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Next: {member.nextAvailable}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
