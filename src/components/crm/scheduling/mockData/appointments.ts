
import { Appointment } from "../AppointmentsList";

// Mock appointment data
export const appointments: Appointment[] = [
  {
    id: "1",
    clientName: "John Smith",
    title: "Initial Consultation - John Smith",
    type: "Initial Consultation",
    time: "09:00",
    date: new Date(new Date().setDate(new Date().getDate())), // Today
    priority: "high",
    status: "confirmed",
    documents: "incomplete",
    alert: "Missing financial statements",
    color: "bg-red-500"
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    title: "Follow-up Meeting - Sarah Johnson",
    type: "Follow-up Meeting",
    time: "11:30",
    date: new Date(new Date().setDate(new Date().getDate())), // Today
    priority: "medium",
    status: "confirmed",
    documents: "complete",
    alert: null,
    color: "bg-amber-500"
  },
  {
    id: "3",
    clientName: "Michael Williams",
    title: "Document Review - Michael Williams",
    type: "Document Review",
    time: "14:00",
    date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    priority: "normal",
    status: "confirmed",
    documents: "incomplete",
    alert: "Need to review Form 47",
    color: "bg-green-500"
  },
  {
    id: "4",
    clientName: "Jessica Brown",
    title: "Initial Consultation - Jessica Brown",
    type: "Initial Consultation",
    time: "10:00",
    date: new Date(new Date().setDate(new Date().getDate() + 2)), // Day after tomorrow
    priority: "high",
    status: "pending",
    documents: "pending",
    alert: null,
    color: "bg-red-500"
  },
  {
    id: "5",
    clientName: "David Miller",
    title: "Financial Assessment - David Miller",
    type: "Financial Assessment",
    time: "13:30",
    date: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days from now
    priority: "medium",
    status: "confirmed",
    documents: "complete",
    alert: null,
    color: "bg-amber-500"
  },
  {
    id: "6",
    clientName: "Jennifer Wilson",
    title: "Budget Planning - Jennifer Wilson",
    type: "Budget Planning",
    time: "15:45",
    date: new Date(new Date().setDate(new Date().getDate() + 4)), // 4 days from now
    priority: "normal",
    status: "self-booked",
    documents: "incomplete",
    alert: "Missing proof of income",
    color: "bg-blue-500"
  },
  {
    id: "7",
    clientName: "Robert Taylor",
    title: "Initial Consultation - Robert Taylor",
    type: "Initial Consultation",
    time: "09:30",
    date: new Date(new Date().setDate(new Date().getDate() + 7)), // Week from now
    priority: "high",
    status: "confirmed",
    documents: "pending",
    alert: null,
    color: "bg-red-500"
  },
  {
    id: "8",
    clientName: "Amanda Anderson",
    title: "Debt Settlement Review - Amanda Anderson",
    type: "Debt Settlement Review",
    time: "14:15",
    date: new Date(new Date().setDate(new Date().getDate() + 7)), // Week from now
    priority: "medium",
    status: "confirmed",
    documents: "complete",
    alert: null,
    color: "bg-amber-500"
  },
  {
    id: "9",
    clientName: "Mark Thomas",
    title: "Creditor Negotiation - Mark Thomas",
    type: "Creditor Negotiation",
    time: "11:00",
    date: new Date(new Date().setDate(new Date().getDate() + 14)), // Two weeks from now
    priority: "high",
    status: "pending",
    documents: "incomplete",
    alert: "Need creditor statements",
    color: "bg-red-500"
  },
  {
    id: "10",
    clientName: "Lisa Martinez",
    title: "Follow-up Meeting - Lisa Martinez",
    type: "Follow-up Meeting",
    time: "16:00",
    date: new Date(new Date().setDate(new Date().getDate() + 14)), // Two weeks from now
    priority: "normal",
    status: "self-booked",
    documents: "complete",
    alert: null,
    color: "bg-blue-500"
  }
];
