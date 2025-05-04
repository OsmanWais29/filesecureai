
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  PhoneCall, 
  User, 
  Video, 
  X 
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const appointmentTypes = [
  { value: "initial", label: "Initial Consultation" },
  { value: "followup", label: "Follow-up Meeting" },
  { value: "creditor", label: "Creditor Meeting" },
  { value: "financial", label: "Financial Counseling" },
  { value: "discharge", label: "Discharge Meeting" }
];

const trustees = [
  { value: "jane-smith", label: "Jane Smith" },
  { value: "john-doe", label: "John Doe" },
  { value: "robert-jones", label: "Robert Jones" }
];

const times = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" }
];

export const ClientAppointmentsPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointmentType, setAppointmentType] = useState("");
  const [trustee, setTrustee] = useState("");
  const [time, setTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Mock data - in a real implementation, this would come from your database
  const appointments = [
    { 
      id: "1", 
      title: "Monthly Review", 
      date: "2025-05-20", 
      time: "10:30 AM",
      type: "video",
      trustee: "Jane Smith",
      notes: "We'll discuss your April financial statements and any questions about your proposal."
    },
    { 
      id: "2", 
      title: "Financial Counseling Session", 
      date: "2025-06-05", 
      time: "2:00 PM",
      type: "in_person",
      trustee: "Robert Jones",
      location: "123 Financial St, Suite 400",
      notes: "Second mandatory counseling session. Please bring your budget worksheet."
    },
    { 
      id: "3", 
      title: "Creditors Meeting", 
      date: "2025-06-15", 
      time: "11:00 AM",
      type: "phone",
      trustee: "Jane Smith",
      notes: "Dial-in information will be emailed 24 hours before the meeting."
    }
  ];

  const pastAppointments = [
    { 
      id: "4", 
      title: "Initial Consultation", 
      date: "2025-04-10", 
      time: "9:00 AM",
      type: "in_person",
      trustee: "Jane Smith",
      notes: "Completed initial assessment and documentation review."
    },
    { 
      id: "5", 
      title: "First Financial Counseling", 
      date: "2025-04-25", 
      time: "1:00 PM",
      type: "video",
      trustee: "Robert Jones",
      notes: "Completed first mandatory counseling session."
    }
  ];

  const upcomingAppointments = [...appointments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const handleSchedule = () => {
    if (date && appointmentType && trustee && time) {
      console.log("Scheduling appointment:", { date, appointmentType, trustee, time });
      // In a real app, you would send this to your backend
      setIsScheduling(false);
      setDate(new Date());
      setAppointmentType("");
      setTrustee("");
      setTime("");
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch(type) {
      case "video": 
        return <Video className="h-5 w-5 text-blue-600" />;
      case "in_person": 
        return <MapPin className="h-5 w-5 text-green-600" />;
      case "phone": 
        return <PhoneCall className="h-5 w-5 text-purple-600" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage your meetings</p>
        </div>
        <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
          <DialogTrigger asChild>
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
              <DialogDescription>
                Choose details for your new appointment with the trustee.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Appointment Type</label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Trustee</label>
                <Select value={trustee} onValueChange={setTrustee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trustee" />
                  </SelectTrigger>
                  <SelectContent>
                    {trustees.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Date</label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Time</label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduling(false)}>
                Cancel
              </Button>
              <Button onClick={handleSchedule}>
                Schedule Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            Scheduled meetings with your trustee team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="border rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 flex flex-col justify-center items-center md:w-48">
                      <p className="text-2xl font-semibold">{new Date(appointment.date).getDate()}</p>
                      <p className="text-lg">{format(new Date(appointment.date), 'MMM yyyy')}</p>
                      <p className="font-medium mt-1">{appointment.time}</p>
                    </div>
                    
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{appointment.title}</h3>
                          <Badge variant={appointment.type === 'video' ? 'default' : appointment.type === 'in_person' ? 'success' : 'secondary'}>
                            {appointment.type === 'video' ? 'Video' : appointment.type === 'in_person' ? 'In Person' : 'Phone'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          <span>With: {appointment.trustee}</span>
                        </div>
                        
                        {appointment.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                        
                        <p className="text-sm mt-2">{appointment.notes}</p>
                        
                        <div className="flex mt-4">
                          {appointment.type === 'video' && (
                            <Button size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Join Video Call
                            </Button>
                          )}
                          {appointment.type === 'phone' && (
                            <Button size="sm">
                              <PhoneCall className="h-4 w-4 mr-2" />
                              Call In Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No upcoming appointments scheduled</p>
              <Button className="mt-4" onClick={() => setIsScheduling(true)}>Schedule Your First Appointment</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>May 2025</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/2] w-full bg-muted/30 rounded-md flex items-center justify-center p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border w-full"
                />
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Appointments on {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}</h3>
                {upcomingAppointments.some(apt => new Date(apt.date).toDateString() === date?.toDateString()) ? (
                  <div className="space-y-3">
                    {upcomingAppointments
                      .filter(apt => new Date(apt.date).toDateString() === date?.toDateString())
                      .map(appointment => (
                        <div key={appointment.id} className="flex items-center p-3 border rounded-md">
                          <div className="mr-3 p-2 rounded-full bg-blue-100">
                            {getAppointmentTypeIcon(appointment.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{appointment.title}</p>
                            <p className="text-sm text-muted-foreground">{appointment.time} with {appointment.trustee}</p>
                          </div>
                          <Button variant="outline" size="sm">Details</Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No appointments scheduled for this date</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>
                Record of your previous meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center p-4 border rounded-md bg-muted/30">
                      <div className="mr-3 p-2 rounded-full bg-gray-100">
                        {getAppointmentTypeIcon(appointment.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{appointment.title}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </span>
                        </div>
                        <p className="text-sm">With: {appointment.trustee}</p>
                        <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No past appointments to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientAppointmentsPage;
