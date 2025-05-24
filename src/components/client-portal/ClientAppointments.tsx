
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Phone } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_type: string;
  status: string;
  metadata: any;
}

export const ClientAppointments = () => {
  const { user } = useAuthState();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('client_id', user?.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Properly type cast the data with fallback values
      const typedAppointments: Appointment[] = (data || []).map(item => ({
        id: String(item.id || ''),
        title: String(item.title || ''),
        description: String(item.description || ''),
        start_time: String(item.start_time || ''),
        end_time: String(item.end_time || ''),
        location: String(item.location || ''),
        meeting_type: String(item.meeting_type || 'in-person'),
        status: String(item.status || 'scheduled'),
        metadata: item.metadata || {}
      }));
      
      setAppointments(typedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-24 bg-muted"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.start_time));
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.start_time));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your scheduled meetings with your trustee
        </p>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled appointments. Contact your trustee to schedule a meeting.
                </p>
                <Button variant="outline">
                  Request Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.start_time);
              const endTime = formatDateTime(appointment.end_time).time;
              
              return (
                <Card key={appointment.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{appointment.title}</CardTitle>
                        <CardDescription>{appointment.description}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {time} - {endTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {getMeetingIcon(appointment.meeting_type)}
                      <span className="capitalize">{appointment.meeting_type} meeting</span>
                      {appointment.location && (
                        <span className="text-muted-foreground">• {appointment.location}</span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm">
                        Join Meeting
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {pastAppointments.slice(0, 5).map((appointment) => {
              const { date, time } = formatDateTime(appointment.start_time);
              
              return (
                <Card key={appointment.id} className="opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{appointment.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {date} at {time}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
