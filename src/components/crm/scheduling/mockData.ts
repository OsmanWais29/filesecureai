
import { AISuggestion } from "./AIRecommendations";
import { StaffAvailabilityItem } from "./StaffAvailability";
import { Appointment } from "./AppointmentsList";

// Mock appointments data that matches the dashboard design
export const appointments: Appointment[] = [
  {
    id: "1",
    clientName: "John Smith",
    title: "Initial Consultation",
    type: "Initial Consultation",
    time: "09:00",
    date: new Date(2025, 5, 26), // June 26, 2025
    priority: 'high',
    status: 'confirmed',
    documents: 'incomplete',
    alert: "Missing financial statements",
    color: "bg-red-50 border-l-4 border-red-500"
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    title: "Follow-up Meeting",
    type: "Follow-up Meeting",
    time: "11:30",
    date: new Date(2025, 5, 26), // June 26, 2025
    priority: 'medium',
    status: 'confirmed',
    documents: 'complete',
    color: "bg-amber-50 border-l-4 border-amber-500"
  },
  {
    id: "3",
    clientName: "Michael Brown",
    title: "Document Review",
    type: "Document Review",
    time: "14:00",
    date: new Date(2025, 5, 27), // June 27, 2025
    priority: 'normal',
    status: 'pending',
    documents: 'complete',
    color: "bg-blue-50 border-l-4 border-blue-500"
  },
  {
    id: "4",
    clientName: "Emily Davis",
    title: "Consultation",
    type: "Consultation",
    time: "10:00",
    date: new Date(2025, 5, 28), // June 28, 2025
    priority: 'medium',
    status: 'self-booked',
    documents: 'pending',
    color: "bg-green-50 border-l-4 border-green-500"
  }
];

// AI suggestions that match the dashboard design
export const aiSuggestions: AISuggestion[] = [
  {
    id: "1",
    message: "John Smith has rescheduled 3 times in the past. Consider calling to confirm today's appointment.",
    priority: "high",
    actionable: true
  },
  {
    id: "2", 
    message: "Michael Williams hasn't submitted his tax returns. Request before tomorrow's meeting.",
    priority: "medium",
    actionable: true
  },
  {
    id: "3",
    message: "You have 3 clients in the same area on Thursday. Consider grouping appointments for efficiency.",
    priority: "low",
    actionable: true
  },
  {
    id: "4",
    message: "Your afternoon slots are underutilized. Consider opening these for self-booking.",
    priority: "medium",
    actionable: true
  }
];

// Staff availability data matching the dashboard design
export const staffAvailability: StaffAvailabilityItem[] = [
  {
    id: "1",
    name: "John Doe",
    role: "Licensed Insolvency Trustee",
    avatar: "/api/placeholder/32/32",
    color: "bg-blue-100",
    schedule: [
      {
        day: "Monday",
        busy: ["9:00 - 10:30", "2:00 - 3:30"]
      },
      {
        day: "Tuesday", 
        busy: ["11:00 - 12:30"]
      },
      {
        day: "Wednesday",
        busy: []
      },
      {
        day: "Thursday",
        busy: ["9:00 - 4:30"]
      },
      {
        day: "Friday",
        busy: ["9:00 - 10:30", "1:00 - 2:30"]
      }
    ]
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Financial Counselor",
    avatar: "/api/placeholder/32/32", 
    color: "bg-green-100",
    schedule: [
      {
        day: "Monday",
        busy: ["11:00 - 1:00"]
      },
      {
        day: "Tuesday",
        busy: ["9:00 - 11:30", "2:00 - 3:30"]
      },
      {
        day: "Wednesday", 
        busy: ["10:00 - 11:30"]
      },
      {
        day: "Thursday",
        busy: []
      },
      {
        day: "Friday",
        busy: ["2:00 - 4:30"]
      }
    ]
  }
];
