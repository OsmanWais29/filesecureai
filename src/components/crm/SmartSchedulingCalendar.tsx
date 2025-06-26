
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
      {/* Team Status Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status & Caseload Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 space-y-4">
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <Badge variant="outline" className="text-xs">
                      {getStatusText(member.status)}
                    </Badge>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{member.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-semibold">{member.activeCases}</span> Active Cases
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        <span className="font-semibold">{member.completedToday}</span> Completed Today
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Appointment */}
                {member.nextAppointment && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Next:</span>
                      <span className="text-muted-foreground">{member.nextAppointment}</span>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Smart Scheduling Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            appointments={appointments}
          />
        </CardContent>
      </Card>
    </div>
  );
};
