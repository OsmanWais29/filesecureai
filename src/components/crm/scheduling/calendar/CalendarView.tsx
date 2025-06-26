
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Users,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Mock data for appointments
  const todaysAppointments = [
    { id: 1, time: "9:00 AM", client: "John Smith", type: "Consultation", priority: "high" },
    { id: 2, time: "11:30 AM", client: "Sarah Johnson", type: "Review", priority: "medium" },
    { id: 3, time: "2:00 PM", client: "Mike Davis", type: "Initial Meeting", priority: "high" },
    { id: 4, time: "4:00 PM", client: "Lisa Brown", type: "Follow-up", priority: "low" }
  ];

  const upcomingAppointments = [
    { id: 5, date: "Tomorrow", time: "10:00 AM", client: "Tom Wilson", type: "Consultation" },
    { id: 6, date: "Friday", time: "2:30 PM", client: "Emma Thompson", type: "Review" },
    { id: 7, date: "Monday", time: "9:15 AM", client: "David Lee", type: "Initial Meeting" }
  ];

  const teamStatus = [
    { name: "Alex Thompson", status: "Available", caseload: 12, color: "bg-green-500" },
    { name: "Sarah Mitchell", status: "In Meeting", caseload: 8, color: "bg-yellow-500" },
    { name: "John Rodriguez", status: "Busy", caseload: 15, color: "bg-red-500" },
    { name: "Emily Chen", status: "Available", caseload: 10, color: "bg-green-500" }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Calendar
          </h1>
          <p className="text-gray-600 mt-1">Manage your schedule and team workload</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            New Appointment
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Large Calendar - Takes up 8 columns */}
        <div className="col-span-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="calendar-container" style={{ transform: 'scale(1.2)', transformOrigin: 'top left' }}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-lg border-0 shadow-none"
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center hidden",
                    caption_label: "text-lg font-semibold",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-slate-500 rounded-md w-12 h-12 font-semibold text-sm flex items-center justify-center",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-50 [&:has([aria-selected].day-outside)]:bg-blue-50/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    day: "h-12 w-12 p-0 font-normal text-base hover:bg-blue-100 hover:text-blue-900 rounded-lg transition-colors flex items-center justify-center",
                    day_range_end: "day-range-end",
                    day_selected: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700 hover:text-white focus:bg-gradient-to-r focus:from-blue-600 focus:to-purple-600 focus:text-white shadow-md",
                    day_today: "bg-blue-100 text-blue-900 font-semibold",
                    day_outside: "day-outside text-slate-400 opacity-50 aria-selected:bg-blue-50/50 aria-selected:text-slate-400 aria-selected:opacity-30",
                    day_disabled: "text-slate-400 opacity-50",
                    day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-900",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Takes up 4 columns */}
        <div className="col-span-4 space-y-6">
          {/* Today's Schedule */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all duration-200 border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                        {appointment.priority}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-800">{appointment.client}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Coming Up */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-purple-700">{appointment.date}</span>
                      <span className="text-sm text-gray-600">{appointment.time}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{appointment.client}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Notes */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Quick Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                placeholder="Add your notes here..."
                className="w-full h-24 p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gradient-to-br from-amber-50 to-orange-50"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Status & Caseload - Bottom Section */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-6 w-6 text-green-600" />
            Team Status & Caseload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamStatus.map((member, index) => (
              <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${member.color} shadow-sm`}></div>
                  <span className="font-semibold text-gray-800">{member.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {member.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Caseload:</span>
                    <span className="font-semibold text-blue-600">{member.caseload}</span>
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
