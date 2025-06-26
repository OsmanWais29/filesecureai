
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
  XCircle
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

// Mock team status data
const teamMembers = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Senior Trustee",
    status: "available",
    avatar: "/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png",
    phone: "(555) 123-4567",
    email: "sarah.mitchell@trustee.com",
    nextAvailable: "Now"
  },
  {
    id: "2", 
    name: "David Chen",
    role: "Associate Trustee",
    status: "busy",
    avatar: "/lovable-uploads/7111ec34-de13-4b7d-b821-5f804822ebc5.png",
    phone: "(555) 234-5678",
    email: "david.chen@trustee.com",
    nextAvailable: "3:00 PM"
  },
  {
    id: "3",
    name: "Emily Rodriguez", 
    role: "Junior Trustee",
    status: "away",
    avatar: "/lovable-uploads/b8620d24-fab6-4068-9af7-3e91ace7b559.png",
    phone: "(555) 345-6789",
    email: "emily.rodriguez@trustee.com",
    nextAvailable: "Tomorrow 9:00 AM"
  },
  {
    id: "4",
    name: "Michael Thompson",
    role: "Case Manager", 
    status: "available",
    avatar: "/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png",
    phone: "(555) 456-7890",
    email: "michael.thompson@trustee.com",
    nextAvailable: "Now"
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

      {/* Team Status - Horizontal Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg min-w-[280px]">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    {getStatusIcon(member.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                  <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                    {member.status}
                  </Badge>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Next: {member.nextAvailable}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
