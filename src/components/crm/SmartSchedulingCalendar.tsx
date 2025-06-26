
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Filter,
  CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Clock4,
  Maximize2
} from "lucide-react";
import { Link } from "react-router-dom";

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
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day");
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
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Dashboard Modules</h2>
        <p className="text-muted-foreground">Access tools and features to manage your clients efficiently.</p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-2 border-primary">
          <CardContent className="p-4 text-center">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Scheduling</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">Documents</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">AI Workflow</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock4 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">Analytics</h3>
          </CardContent>
        </Card>
      </div>

      {/* Sub-navigation */}
      <div className="flex justify-center space-x-1 bg-muted p-1 rounded-lg w-fit mx-auto">
        <Button variant="default" size="sm">Calendar View</Button>
        <Button variant="ghost" size="sm">Client Self-Booking</Button>
        <Button variant="ghost" size="sm">Scheduling Analytics</Button>
      </div>

      {/* Main Smart Scheduling System */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Smart Scheduling System</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={() => setIsQuickBookDialogOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" />
            Quick Book
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Area */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>AI-Powered Calendar</CardTitle>
                <div className="flex gap-2">
                  <Link 
                    to="/calendar-fullscreen" 
                    state={{ 
                      initialDate: selectedDate,
                      initialView: "week"
                    }}
                  >
                    <Button variant="ghost" size="icon" title="Open fullscreen calendar">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </Link>
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
                </div>
              </div>
              <CardDescription>
                Schedule appointments, view deadlines, and manage your calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Calendar View Component */}
              <CalendarView 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarView={calendarView}
                setCalendarView={setCalendarView}
                appointments={filteredAppointments}
              />
              
              {/* Appointments List Component */}
              <AppointmentsList 
                appointments={filteredAppointments}
                selectedDate={selectedDate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with AI Recommendations and Alerts */}
        <div className="col-span-1 space-y-4">
          {/* AI Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIRecommendations suggestions={aiSuggestions} />
            </CardContent>
          </Card>

          {/* Staff Availability */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Staff Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StaffAvailability staffList={staffAvailability} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock4 className="h-4 w-4 text-indigo-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
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
