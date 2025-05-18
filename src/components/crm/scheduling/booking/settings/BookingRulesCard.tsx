
import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface BookingRulesCardProps {
  bookingWindow: number;
  setBookingWindow: (value: number) => void;
  minNotice: number;
  setMinNotice: (value: number) => void;
  reminderHours: number;
  setReminderHours: (value: number) => void;
  autoConfirm: boolean;
  setAutoConfirm: (value: boolean) => void;
  publicHolidays: boolean;
  setPublicHolidays: (value: boolean) => void;
  aiRecommendations: boolean;
  setAiRecommendations: (value: boolean) => void;
}

export const BookingRulesCard: React.FC<BookingRulesCardProps> = memo(({
  bookingWindow,
  setBookingWindow,
  minNotice,
  setMinNotice,
  reminderHours,
  setReminderHours,
  autoConfirm,
  setAutoConfirm,
  publicHolidays,
  setPublicHolidays,
  aiRecommendations,
  setAiRecommendations
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-medium">Booking Rules</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Booking Window (days in advance)
            </label>
            <Input 
              type="number" 
              min={1} 
              max={90} 
              value={bookingWindow}
              onChange={(e) => setBookingWindow(parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Clients can book appointments up to {bookingWindow} days in advance
            </p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Minimum Notice (hours)
            </label>
            <Input 
              type="number" 
              min={1} 
              max={72} 
              value={minNotice}
              onChange={(e) => setMinNotice(parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Clients must book at least {minNotice} hours before the appointment time
            </p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Reminder Email (hours before appointment)
            </label>
            <Input 
              type="number" 
              min={1} 
              max={72} 
              value={reminderHours}
              onChange={(e) => setReminderHours(parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Send a reminder email {reminderHours} hours before the appointment
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Auto-Confirm Appointments</div>
              <p className="text-xs text-muted-foreground">
                Automatically confirm appointments without manual review
              </p>
            </div>
            <Switch 
              checked={autoConfirm} 
              onCheckedChange={setAutoConfirm} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Block Public Holidays</div>
              <p className="text-xs text-muted-foreground">
                Prevent booking on public holidays
              </p>
            </div>
            <Switch 
              checked={publicHolidays} 
              onCheckedChange={setPublicHolidays} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">AI Recommendations</div>
              <p className="text-xs text-muted-foreground">
                Use AI to recommend optimal time slots based on case priority
              </p>
            </div>
            <Switch 
              checked={aiRecommendations} 
              onCheckedChange={setAiRecommendations} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BookingRulesCard.displayName = "BookingRulesCard";
