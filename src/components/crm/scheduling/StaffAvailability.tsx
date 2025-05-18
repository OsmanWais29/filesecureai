
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface StaffAvailabilityItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  schedule: {
    day: string;
    busy: string[];
  }[];
}

interface StaffAvailabilityProps {
  staffList: StaffAvailabilityItem[];
}

export function StaffAvailability({ staffList }: StaffAvailabilityProps) {
  return (
    <div className="space-y-4">
      {staffList.map((staff) => {
        // Find today's schedule
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySchedule = staff.schedule.find((s) => s.day === today) || {
          day: today,
          busy: [],
        };

        return (
          <Card key={staff.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className={staff.color}>
                  <AvatarImage src={staff.avatar} alt={staff.name} />
                  <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{staff.name}</h4>
                  <p className="text-xs text-muted-foreground">{staff.role}</p>
                </div>
              </div>

              <div className="mt-2">
                <h5 className="text-xs font-medium mb-1">Today's Schedule</h5>
                {todaySchedule.busy.length > 0 ? (
                  <div className="text-xs space-y-1">
                    {todaySchedule.busy.map((time, i) => (
                      <div key={i} className="bg-gray-100 p-1 rounded">
                        Busy: {time}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Available all day</div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
