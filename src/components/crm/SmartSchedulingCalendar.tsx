
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Filter,
  CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Clock4,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bot,
  Users,
  MapPin,
  Phone
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday } from "date-fns";

// Import components
import { CalendarView } from "./scheduling/CalendarView";
import { AppointmentsList } from "./scheduling/AppointmentsList";
import { AIRecommendations } from "./scheduling/AIRecommendations";
import { StaffAvailability } from "./scheduling/StaffAvailability";
import { QuickActions } from "./scheduling/QuickActions";
import { FilterDialog } from "./scheduling/FilterDialog";
import { QuickBookDialog } from "./scheduling/QuickBookDialog";

// Import mock data
import { appointments, staffAvailability, aiSuggestions } from "./scheduling/mockData";

export const SmartSchedulingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("week");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isQuickBookDialogOpen, setIsQuickBookDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    showHighPriority: true,
    showMediumPriority: true,
    showRegularMeetings: true,
    showSelfBooked: true
  });
  
  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(appointment => {
    if (appointment.priority === 'high' && !filters.showHighPriority) return false;
    if (appointment.priority === 'medium' && !filters.showMediumPriority) return false;
    if (appointment.priority === 'normal' && appointment.status !== 'self-booked' && !filters.showRegularMeetings) return false;
    if (appointment.status === 'self-booked' && !filters.showSelfBooked) return false;
    return true;
  });

  // Handle calendar view change
  const handleViewChange = (view: "day" | "week" | "month") => {
    setCalendarView(view);
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (calendarView === "day") {
      setSelectedDate(addDays(selectedDate, -1));
    } else if (calendarView === "week") {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    }
  };

  const navigateNext = () => {
    if (calendarView === "day") {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (calendarView === "week") {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    }
  };

  const getTodaysAppointments = () => {
    return filteredAppointments.filter(apt => isSameDay(apt.date, new Date()));
  };

  const getUpcomingAppointments = () => {
    return filteredAppointments.filter(apt => apt.date > new Date()).slice(0, 3);
  };

  return (
    <div className="space-y-6 p-6">
      {/* AI-Powered Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <h1 className="text-2xl font-bold">AI-Powered Smart Calendar</h1>
            </div>
            <p className="text-blue-100">
              Intelligent scheduling with AI recommendations and automated insights
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getTodaysAppointments().length}</div>
            <div className="text-sm text-blue-100">appointments today</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Today's Meetings</p>
                <p className="text-2xl font-bold text-green-900">{getTodaysAppointments().length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">This Week</p>
                <p className="text-2xl font-bold text-blue-900">{filteredAppointments.length}</p>
              </div>
              <Clock4 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">AI Suggestions</p>
                <p className="text-2xl font-bold text-amber-900">{aiSuggestions.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Available Staff</p>
                <p className="text-2xl font-bold text-purple-900">{staffAvailability.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={navigatePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <CardTitle className="text-xl">
                      {format(selectedDate, "MMMM yyyy")}
                    </CardTitle>
                    <CardDescription>
                      {calendarView === "day" && format(selectedDate, "EEEE, MMMM d")}
                      {calendarView === "week" && `${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d")}`}
                      {calendarView === "month" && "Monthly Overview"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={navigateNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger 
                      value="day" 
                      onClick={() => handleViewChange("day")}
                      className={calendarView === "day" ? "bg-primary text-primary-foreground" : ""}
                    >
                      Day
                    </TabsTrigger>
                    <TabsTrigger 
                      value="week" 
                      onClick={() => handleViewChange("week")}
                      className={calendarView === "week" ? "bg-primary text-primary-foreground" : ""}
                    >
                      Week
                    </TabsTrigger>
                    <TabsTrigger 
                      value="month" 
                      onClick={() => handleViewChange("month")}
                      className={calendarView === "month" ? "bg-primary text-primary-foreground" : ""}
                    >
                      Month
                    </TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsFilterDialogOpen(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={() => setIsQuickBookDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CalendarView 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarView={calendarView}
                setCalendarView={setCalendarView}
                appointments={filteredAppointments}
              />
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          {isToday(selectedDate) && (
            <Card className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <CalendarIcon className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTodaysAppointments().length > 0 ? (
                  <div className="space-y-3">
                    {getTodaysAppointments().map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="font-medium">{appointment.title}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock4 className="h-3 w-3" />
                              {appointment.time}
                            </p>
                          </div>
                        </div>
                        <Badge variant={appointment.priority === 'high' ? 'destructive' : 'secondary'}>
                          {appointment.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Bot className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIRecommendations suggestions={aiSuggestions} />
            </CardContent>
          </Card>

          {/* Staff Availability */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Team Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaffAvailability staffList={staffAvailability} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock4 className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="h-5 w-5" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingAppointments().map((appointment) => (
                  <div key={appointment.id} className="flex items-start gap-3 p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{appointment.title}</p>
                      <p className="text-xs text-gray-600">
                        {format(appointment.date, "MMM d")} at {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog 
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Quick Book Dialog */}
      <QuickBookDialog
        open={isQuickBookDialogOpen}
        onOpenChange={setIsQuickBookDialogOpen}
      />
    </div>
  );
};
