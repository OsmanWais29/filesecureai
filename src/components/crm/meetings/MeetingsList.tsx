
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingData } from "@/hooks/useMeetingManagement";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CalendarCheck, 
  CheckCircle, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Trash2,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface MeetingsListProps {
  meetings: MeetingData[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (meeting: MeetingData) => void;
  onDelete: (meeting: MeetingData) => void;
  onStatusChange: (meetingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled') => void;
}

export function MeetingsList({ meetings, isLoading, onAdd, onEdit, onDelete, onStatusChange }: MeetingsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<MeetingData | null>(null);

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    rescheduled: "bg-amber-100 text-amber-800",
  };

  const handleStatusChange = (meetingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled') => {
    onStatusChange(meetingId, status);
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (meeting.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    const matchesType = typeFilter === "all" || meeting.meeting_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const meetingTypes = [
    { value: 'consultation', label: 'Initial Consultation' },
    { value: 'followup', label: 'Follow-up Meeting' },
    { value: 'document_review', label: 'Document Review' },
    { value: 'court_preparation', label: 'Court Preparation' },
    { value: 'closing', label: 'Closing Meeting' },
    { value: 'other', label: 'Other' }
  ];

  const getMeetingTypeLabel = (value: string | undefined): string => {
    if (!value) return 'Unknown';
    const type = meetingTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              <CardTitle>Meeting Schedule</CardTitle>
            </div>
            <Button onClick={onAdd} className="gap-1">
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-1"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {meetingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No meetings found</p>
              <Button variant="outline" onClick={onAdd} className="mt-2">
                Schedule your first meeting
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>{getMeetingTypeLabel(meeting.meeting_type)}</TableCell>
                      <TableCell>
                        <div>
                          {format(new Date(meeting.start_time), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(meeting.start_time), 'h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[meeting.status as keyof typeof statusColors]}>
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(meeting)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {meeting.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(meeting.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                              </DropdownMenuItem>
                            )}
                            {meeting.status !== 'cancelled' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(meeting.id, 'cancelled')}>
                                <X className="mr-2 h-4 w-4" /> Cancel Meeting
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDeleteConfirm(meeting)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the meeting "{deleteConfirm?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
