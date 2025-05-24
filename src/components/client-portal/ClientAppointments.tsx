import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Phone, AlertCircle, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_type: string;
  status: string;
  trustee_id: string | null;
  metadata: any;
}

export const ClientAppointments = () => {
  const { user } = useAuthState();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('client_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        setError(error.message);
        toast.error('Failed to load appointments');
        return;
      }
      
      // Properly cast the data to Appointment[]
      const typedAppointments: Appointment[] = (data || []).map(appointment => ({
        id: appointment.id,
        title: appointment.title || '',
        description: appointment.description,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        location: appointment.location,
        meeting_type: appointment.meeting_type || 'in-person',
        status: appointment.status || 'scheduled',
        trustee_id: appointment.trustee_id,
        metadata: appointment.metadata || {}
      }));
      
      setAppointments(typedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error in fetchAppointments:', err);
      setError('Failed to load appointments');
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
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  const isUpcoming = (startTime: string) => {
    try {
      return new Date(startTime) > new Date();
    } catch {
      return false;
    }
  };

  const requestAppointment = () => {
    toast.success('Appointment request feature coming soon!');
    // TODO: Implement appointment request functionality
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-24 bg-muted rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Appointments</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchAppointments} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
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
                <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled appointments. Contact your trustee to schedule a meeting.
                </p>
                <Button onClick={requestAppointment} variant="outline">
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
                        {appointment.description && (
                          <CardDescription>{appointment.description}</CardDescription>
                        )}
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
                      <Button size="sm" disabled>
                        Join Meeting
                        <span className="text-xs ml-1">(Coming Soon)</span>
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Reschedule
                        <span className="text-xs ml-1">(Coming Soon)</span>
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
            {pastAppointments.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing 5 most recent appointments
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
