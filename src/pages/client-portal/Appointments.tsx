
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Video, Plus } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'in-person' | 'phone' | 'video';
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  description?: string;
  trustee: string;
}

export const ClientAppointments = () => {
  const { user } = useAuthState();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setAppointments([
        {
          id: "1",
          title: "Initial Consultation",
          date: "2024-02-15",
          time: "10:00 AM",
          duration: "60 minutes",
          type: "video",
          status: "scheduled",
          description: "Discuss your financial situation and review proposal options.",
          trustee: "Sarah Johnson, LIT"
        },
        {
          id: "2",
          title: "Document Review",
          date: "2024-01-20",
          time: "2:00 PM",
          duration: "30 minutes",
          type: "phone",
          status: "completed",
          description: "Review completed forms and answer questions.",
          trustee: "Sarah Johnson, LIT"
        },
        {
          id: "3",
          title: "Creditor Meeting Preparation",
          date: "2024-02-28",
          time: "9:00 AM",
          duration: "45 minutes",
          type: "in-person",
          status: "scheduled",
          location: "123 Main St, Suite 400, Toronto, ON",
          description: "Prepare for the upcoming creditor meeting.",
          trustee: "Sarah Johnson, LIT"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white">
              <CardHeader className="h-20 bg-gray-100 rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">
              View and manage your scheduled meetings
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Request Appointment
          </Button>
        </div>

        {appointments.length === 0 ? (
          <Card className="bg-white border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-gray-900">No appointments scheduled</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any upcoming appointments. Request one to meet with your trustee.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(appointment.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{appointment.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          With {appointment.trustee}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(appointment.status)} font-medium`}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{appointment.time} ({appointment.duration})</span>
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {appointment.description && (
                    <p className="text-gray-700">{appointment.description}</p>
                  )}
                  
                  {appointment.status === 'scheduled' && (
                    <div className="flex gap-3">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Join Meeting
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Reschedule
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments;
