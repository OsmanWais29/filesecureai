
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CalendarView } from "./scheduling/CalendarView";
import { FilterDialog } from "./scheduling/FilterDialog";
import { QuickBookDialog } from "./scheduling/QuickBookDialog";
import { appointments, aiSuggestions, staffAvailability } from "./scheduling/mockData";
import { 
  Calendar,
  Filter,
  Plus,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Activity
} from "lucide-react";
import { format, isToday, isTomorrow, addDays, isSameDay } from "date-fns";

export const SmartSchedulingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [filters, setFilters] = useState({
    showHighPriority: true,
    showMediumPriority: true,
    showRegularMeetings: true,
    showSelfBooked: true
  });

  // Get today's appointments
  const todaysAppointments = appointments.filter(apt => 
    isSameDay(apt.date, new Date())
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Get upcoming appointments (next 7 days, excluding today)
  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return apt.date > today && apt.date <= nextWeek;
  }).sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    return a.time.localeCompare(b.time);
  }).slice(0, 5);

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEE, MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-amber-600';
      case 'cancelled': return 'text-red-600';
      case 'self-booked': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      case 'self-booked': return <User className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent scheduling with predictive insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="hover:bg-blue-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            size="sm"
            onClick={() => setIsQuickBookOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Book
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View - Left Side */}
        <div className="lg:col-span-3">
          <CalendarView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            appointments={appointments}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Today's Schedule */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No appointments today
                </div>
              ) : (
                todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{appointment.time}</span>
                        <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                          {appointment.priority}
                        </Badge>
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </div>
                    </div>
                    <div className="text-sm font-medium">{appointment.title}</div>
                    <div className="text-xs text-muted-foreground">{appointment.clientName}</div>
                    {appointment.alert && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {appointment.alert}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coming Up */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No upcoming appointments
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-muted-foreground font-medium">
                        {getDateDisplay(appointment.date)}
                      </div>
                      <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                        {appointment.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      <div className={`flex items-center gap-1 text-xs ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                      </div>
                    </div>
                    <div className="text-sm font-medium">{appointment.title}</div>
                    <div className="text-xs text-muted-foreground">{appointment.clientName}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Detailed Team Status */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Team Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staffAvailability.map((staff) => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todaySchedule = staff.schedule.find((s) => s.day === today) || {
                  day: today,
                  busy: [],
                };

                return (
                  <div key={staff.id} className="p-3 rounded-lg border bg-card/50">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback className={staff.color}>
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{staff.name}</h4>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{staff.role}</p>
                        
                        {/* Contact Info */}
                        <div className="flex flex-col gap-1 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{staff.name.toLowerCase().replace(' ', '.')}@company.com</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>+1 (555) 123-4567</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Office 2A</span>
                          </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium">Today's Schedule</span>
                          </div>
                          {todaySchedule.busy.length > 0 ? (
                            <div className="space-y-1">
                              {todaySchedule.busy.map((time, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-xs">
                                  <span className="font-medium">Busy: {time}</span>
                                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                    Occupied
                                  </Badge>
                                </div>
                              ))}
                              <div className="text-xs text-muted-foreground mt-2">
                                Available for meetings outside busy hours
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-green-700 font-medium">Available all day</span>
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  Free
                                </Badge>
                              </div>
                              <div className="text-green-600 text-xs mt-1">
                                Ready for new appointments
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Weekly Capacity */}
                        <Separator className="my-3" />
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Weekly Capacity</span>
                            <span className="font-medium">
                              {staff.schedule.reduce((acc, day) => acc + day.busy.length, 0)}/40 hours
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${(staff.schedule.reduce((acc, day) => acc + day.busy.length, 0) / 40) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <FilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        setFilters={setFilters}
      />

      <QuickBookDialog
        open={isQuickBookOpen}
        onOpenChange={setIsQuickBookOpen}
      />
    </div>
  );
};
