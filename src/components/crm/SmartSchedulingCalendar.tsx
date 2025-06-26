
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarView } from "./scheduling/CalendarView";
import { format, isToday, isTomorrow } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Briefcase,
  Star,
  Activity
} from "lucide-react";

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    clientName: "John Smith",
    title: "Initial Consultation",
    type: "consultation",
    time: "9:00 AM",
    date: new Date(),
    priority: "high" as const,
    status: "confirmed" as const,
    documents: "complete" as const
  },
  {
    id: "2", 
    clientName: "Sarah Johnson",
    title: "Document Review",
    type: "review",
    time: "11:30 AM",
    date: new Date(),
    priority: "medium" as const,
    status: "pending" as const,
    documents: "incomplete" as const
  },
  {
    id: "3",
    clientName: "Mike Wilson",
    title: "Follow-up Meeting",
    type: "follow-up",
    time: "2:00 PM",
    date: new Date(Date.now() + 86400000), // Tomorrow
    priority: "normal" as const,
    status: "confirmed" as const,
    documents: "pending" as const
  }
];

// Enhanced team members data with more information
const teamMembers = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Senior Trustee",
    status: "available",
    avatar: "/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png",
    phone: "(555) 123-4567",
    email: "sarah.mitchell@trustee.com",
    nextAvailable: "Now",
    location: "Toronto Office",
    experience: "12 years",
    specialization: "Corporate Restructuring",
    currentCaseload: 8,
    rating: 4.9,
    todaysMeetings: 3,
    thisWeekCompleted: 12
  },
  {
    id: "2", 
    name: "David Chen",
    role: "Associate Trustee",
    status: "busy",
    avatar: "/lovable-uploads/7111ec34-de13-4b7d-b821-5f804822ebc5.png",
    phone: "(555) 234-5678",
    email: "david.chen@trustee.com",
    nextAvailable: "3:00 PM",
    location: "Vancouver Office",
    experience: "8 years",
    specialization: "Consumer Proposals",
    currentCaseload: 15,
    rating: 4.7,
    todaysMeetings: 5,
    thisWeekCompleted: 18
  },
  {
    id: "3",
    name: "Emily Rodriguez", 
    role: "Junior Trustee",
    status: "away",
    avatar: "/lovable-uploads/b8620d24-fab6-4068-9af7-3e91ace7b559.png",
    phone: "(555) 345-6789",
    email: "emily.rodriguez@trustee.com",
    nextAvailable: "Tomorrow 9:00 AM",
    location: "Calgary Office",
    experience: "3 years",
    specialization: "Personal Bankruptcy",
    currentCaseload: 12,
    rating: 4.5,
    todaysMeetings: 0,
    thisWeekCompleted: 8
  },
  {
    id: "4",
    name: "Michael Thompson",
    role: "Case Manager", 
    status: "available",
    avatar: "/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png",
    phone: "(555) 456-7890",
    email: "michael.thompson@trustee.com",
    nextAvailable: "Now",
    location: "Montreal Office",
    experience: "6 years",
    specialization: "Case Administration",
    currentCaseload: 25,
    rating: 4.8,
    todaysMeetings: 2,
    thisWeekCompleted: 22
  }
];

export const SmartSchedulingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month");

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'away': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'away': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const todayAppointments = mockAppointments.filter(apt => isToday(apt.date));
  const upcomingAppointments = mockAppointments.filter(apt => isTomorrow(apt.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Smart Scheduling Calendar</h2>
          <p className="text-muted-foreground">Manage appointments and team availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View - Left Side */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarView 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarView={calendarView}
                setCalendarView={setCalendarView}
                appointments={mockAppointments}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No appointments today</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{appointment.time}</p>
                        <p className="text-xs text-muted-foreground">{appointment.clientName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.title}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {appointment.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coming Up */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{format(appointment.date, 'MMM d')}</p>
                        <p className="text-xs text-muted-foreground">{appointment.time}</p>
                        <p className="text-xs text-muted-foreground">{appointment.clientName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.title}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Status - Enhanced Horizontal Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    {/* Header with name and status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {member.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(member.status)}
                        <Badge className={`${getStatusColor(member.status)} font-medium`}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact and Location Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{member.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-muted-foreground">{member.rating}/5.0</span>
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-white rounded-md p-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="font-medium">{member.experience}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Specialization:</span>
                        <span className="font-medium">{member.specialization}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Current Caseload:</span>
                        <Badge variant="outline">{member.currentCaseload} cases</Badge>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 rounded-md p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">{member.todaysMeetings}</div>
                        <div className="text-xs text-blue-600">Today</div>
                      </div>
                      <div className="bg-green-50 rounded-md p-2 text-center">
                        <div className="text-lg font-bold text-green-600">{member.thisWeekCompleted}</div>
                        <div className="text-xs text-green-600">This Week</div>
                      </div>
                      <div className="bg-purple-50 rounded-md p-2 text-center">
                        <div className="text-sm font-medium text-purple-600">{member.nextAvailable}</div>
                        <div className="text-xs text-purple-600">Next Available</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Activity className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
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
