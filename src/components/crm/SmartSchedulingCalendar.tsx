
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Phone, Mail, Users, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarView } from './scheduling/calendar/CalendarView';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'available' | 'busy' | 'away';
  location: string;
  phone: string;
  email: string;
  activeCases: number;
  completedToday: number;
  nextAppointment?: string;
}

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarView: 'month' | 'week' | 'day';
  setCalendarView: (view: 'month' | 'week' | 'day') => void;
  appointments: any[];
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Trustee',
    avatar: '/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png',
    status: 'available',
    location: 'Toronto, ON',
    phone: '(416) 555-0123',
    email: 'sarah.johnson@example.com',
    activeCases: 23,
    completedToday: 5,
    nextAppointment: '2:00 PM - Client Meeting'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Licensed Trustee',
    avatar: '/lovable-uploads/7111ec34-de13-4b7d-b821-5f804822ebc5.png',
    status: 'busy',
    location: 'Vancouver, BC',
    phone: '(604) 555-0456',
    email: 'michael.chen@example.com',
    activeCases: 18,
    completedToday: 3,
    nextAppointment: '3:30 PM - Court Hearing'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Associate Trustee',
    avatar: '/lovable-uploads/b8620d24-fab6-4068-9af7-3e91ace7b559.png',
    status: 'away',
    location: 'Calgary, AB',
    phone: '(403) 555-0789',
    email: 'emily.rodriguez@example.com',
    activeCases: 15,
    completedToday: 2,
    nextAppointment: 'Available after 4:00 PM'
  },
  {
    id: '4',
    name: 'David Wilson',
    role: 'Senior Trustee',
    status: 'available',
    location: 'Montreal, QC',
    phone: '(514) 555-0321',
    email: 'david.wilson@example.com',
    activeCases: 20,
    completedToday: 4,
    nextAppointment: '1:30 PM - Document Review'
  }
];

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-500';
    case 'busy':
      return 'bg-red-500';
    case 'away':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: TeamMember['status']) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'busy':
      return 'Busy';
    case 'away':
      return 'Away';
    default:
      return 'Unknown';
  }
};

export const SmartSchedulingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [appointments] = useState([]);

  return (
    <div className="space-y-6">
      {/* Enhanced Calendar Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Smart Scheduling Calendar
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage appointments and team collaboration
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
              <CalendarIcon className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CalendarView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            appointments={appointments}
          />
        </CardContent>
      </Card>

      {/* Team Status & Caseload Sharing Section - Moved to Bottom */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Team Status & Caseload Sharing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current team availability and case distribution
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="border rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-sm ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{member.role}</p>
                    <Badge variant="outline" className={`text-xs mt-1 ${
                      member.status === 'available' ? 'border-green-200 text-green-700 bg-green-50' :
                      member.status === 'busy' ? 'border-red-200 text-red-700 bg-red-50' :
                      'border-yellow-200 text-yellow-700 bg-yellow-50'
                    }`}>
                      {getStatusText(member.status)}
                    </Badge>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span>{member.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 text-purple-500" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-bold text-blue-600">{member.activeCases}</span> Active Cases
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        <span className="font-bold text-green-600">{member.completedToday}</span> Completed Today
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Appointment */}
                {member.nextAppointment && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 text-sm p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-orange-700 dark:text-orange-300">Next:</span>
                      <span className="text-muted-foreground">{member.nextAppointment}</span>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 hover:bg-blue-50 hover:border-blue-200">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 hover:bg-green-50 hover:border-green-200">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 hover:bg-purple-50 hover:border-purple-200">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
