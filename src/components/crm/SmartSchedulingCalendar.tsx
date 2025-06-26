
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';
import { CalendarView } from './scheduling/CalendarView';

// Mock data for demonstration
const mockUpcomingAppointments = [
  { 
    id: 1, 
    title: 'Client Consultation - Sarah Johnson', 
    time: '10:00 AM', 
    duration: '1 hour',
    type: 'consultation',
    priority: 'high' 
  },
  { 
    id: 2, 
    title: 'Document Review - Mike Chen', 
    time: '2:00 PM', 
    duration: '30 mins',
    type: 'review',
    priority: 'medium' 
  },
  { 
    id: 3, 
    title: 'Court Filing - Estate #12345', 
    time: '4:30 PM', 
    duration: '45 mins',
    type: 'filing',
    priority: 'high' 
  }
];

const mockTodaysSchedule = [
  { 
    id: 1, 
    title: 'Morning Briefing', 
    time: '9:00 AM', 
    attendees: 4,
    status: 'confirmed' 
  },
  { 
    id: 2, 
    title: 'Client Meeting - ABC Corp', 
    time: '11:30 AM', 
    attendees: 2,
    status: 'pending' 
  },
  { 
    id: 3, 
    title: 'Legal Review Session', 
    time: '3:00 PM', 
    attendees: 3,
    status: 'confirmed' 
  }
];

const mockTeamMembers = [
  { 
    id: 1, 
    name: 'Sarah Wilson', 
    role: 'Senior Trustee', 
    status: 'available', 
    avatar: '/placeholder.svg',
    phone: '(555) 123-4567',
    email: 'sarah.wilson@firm.com',
    currentTask: 'Client consultation',
    nextAvailable: 'Now'
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    role: 'Associate Trustee', 
    status: 'busy', 
    avatar: '/placeholder.svg',
    phone: '(555) 234-5678',
    email: 'michael.chen@firm.com',
    currentTask: 'Document preparation',
    nextAvailable: '2:00 PM'
  },
  { 
    id: 3, 
    name: 'Emily Rodriguez', 
    role: 'Legal Assistant', 
    status: 'available', 
    avatar: '/placeholder.svg',
    phone: '(555) 345-6789',
    email: 'emily.rodriguez@firm.com',
    currentTask: 'Available for tasks',
    nextAvailable: 'Now'
  },
  { 
    id: 4, 
    name: 'David Park', 
    role: 'Administrator', 
    status: 'meeting', 
    avatar: '/placeholder.svg',
    phone: '(555) 456-7890',
    email: 'david.park@firm.com',
    currentTask: 'Team meeting',
    nextAvailable: '1:30 PM'
  }
];

export const SmartSchedulingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'meeting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI-Powered Calendar</h1>
            <p className="text-blue-100">Intelligent scheduling with predictive insights</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentDate.getDate()}</div>
            <div className="text-sm text-blue-200">
              {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Today's Meetings</p>
                <p className="text-2xl font-bold text-blue-900">8</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">5</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Team Available</p>
                <p className="text-2xl font-bold text-purple-900">3/5</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Efficiency</p>
                <p className="text-2xl font-bold text-orange-900">94%</p>
              </div>
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View - Takes up 3 columns */}
        <div className="lg:col-span-3">
          <CalendarView />
        </div>

        {/* Right Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTodaysSchedule.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-600">{appointment.time}</p>
                    <div className="flex items-center mt-1">
                      <Users className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{appointment.attendees} attendees</span>
                    </div>
                  </div>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Coming Up */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockUpcomingAppointments.map((appointment) => (
                <div key={appointment.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(appointment.priority)} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      <p className="text-sm text-gray-600">{appointment.time} • {appointment.duration}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {appointment.type}
                      </Badge>
                    </div>
                    <Badge variant={appointment.priority === 'high' ? 'destructive' : 'secondary'}>
                      {appointment.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team Status - Horizontal Layout */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                Team Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTeamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                  {/* Top Row: Avatar, Name, Role, Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant={member.status === 'available' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  {/* Bottom Row: Contact Info and Availability */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Current:</span>
                        <div className="text-gray-700">{member.currentTask}</div>
                      </div>
                      <div>
                        <span className="font-medium">Next available:</span>
                        <div className="text-gray-700">{member.nextAvailable}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
