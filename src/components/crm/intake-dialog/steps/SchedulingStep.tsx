
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Video, Phone, MapPin, CheckCircle, Star, Users, MessageSquare } from 'lucide-react';
import { format, addDays, isToday, isTomorrow, isWeekend } from 'date-fns';
import { FormData } from '../../types';

interface SchedulingStepProps {
  formData: FormData;
  handleSelectChange: (field: string, value: string) => void;
}

export const SchedulingStep = ({ formData, handleSelectChange }: SchedulingStepProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('');

  // Generate available time slots
  const generateTimeSlots = (date: Date | undefined) => {
    if (!date) return [];
    
    const slots = [];
    const isWeekendDay = isWeekend(date);
    
    // Weekend hours: 10 AM - 4 PM, Weekday hours: 9 AM - 6 PM
    const startHour = isWeekendDay ? 10 : 9;
    const endHour = isWeekendDay ? 16 : 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour}:00`);
      if (hour < endHour - 1) {
        slots.push(`${hour}:30`);
      }
    }
    
    return slots;
  };

  const formatTimeSlot = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    if (date) {
      handleSelectChange('preferredDate', format(date, 'yyyy-MM-dd'));
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    handleSelectChange('preferredTime', time);
  };

  const handleMeetingTypeSelect = (type: string) => {
    setSelectedMeetingType(type);
    handleSelectChange('meetingType', type);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const timeSlots = generateTimeSlots(selectedDate);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-blue-600 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Schedule Your Consultation</h3>
            <p className="text-sm text-gray-600 font-normal mt-1">Select your preferred date and time</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 p-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-600 rounded-lg flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">🎉 Book Your Free Consultation</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Select your preferred date and time. Our licensed insolvency trustees are ready to provide 
                you with personalized guidance. This consultation is completely <strong>free</strong> and <strong>confidential</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Calendar and Time Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-3 text-base font-medium text-gray-700">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              Select Date
            </Label>
            
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                className="w-full"
              />
            </div>
            
            {selectedDate && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Selected: {getDateLabel(selectedDate)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Time Slots Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-3 text-base font-medium text-gray-700">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              Available Times
            </Label>
            
            {!selectedDate ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Please select a date first</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                    className="justify-center text-sm"
                  >
                    {formatTimeSlot(time)}
                  </Button>
                ))}
              </div>
            )}
            
            {selectedTime && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">
                  Time: {formatTimeSlot(selectedTime)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Type Selection */}
        <div className="space-y-4">
          <Label className="flex items-center gap-3 text-base font-medium text-gray-700">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            How would you like to meet?
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={selectedMeetingType === 'video' ? "default" : "outline"}
              onClick={() => handleMeetingTypeSelect('video')}
              className="p-6 h-auto flex-col gap-3"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Video Call</div>
                <div className="text-xs text-muted-foreground">Recommended</div>
              </div>
              {selectedMeetingType === 'video' && (
                <Badge variant="secondary" className="mt-2">Selected</Badge>
              )}
            </Button>
            
            <Button
              variant={selectedMeetingType === 'phone' ? "default" : "outline"}
              onClick={() => handleMeetingTypeSelect('phone')}
              className="p-6 h-auto flex-col gap-3"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Phone Call</div>
                <div className="text-xs text-muted-foreground">Quick & Easy</div>
              </div>
              {selectedMeetingType === 'phone' && (
                <Badge variant="secondary" className="mt-2">Selected</Badge>
              )}
            </Button>
            
            <Button
              variant={selectedMeetingType === 'in_person' ? "default" : "outline"}
              onClick={() => handleMeetingTypeSelect('in_person')}
              className="p-6 h-auto flex-col gap-3"
            >
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">In-Person</div>
                <div className="text-xs text-muted-foreground">Face-to-Face</div>
              </div>
              {selectedMeetingType === 'in_person' && (
                <Badge variant="secondary" className="mt-2">Selected</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Appointment Summary */}
        {selectedDate && selectedTime && selectedMeetingType && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Appointment Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-800">Date</div>
                <div className="text-blue-600">{getDateLabel(selectedDate)}</div>
                <div className="text-xs text-blue-500">{format(selectedDate, 'MMM d, yyyy')}</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">Time</div>
                <div className="text-blue-600">{formatTimeSlot(selectedTime)}</div>
                <div className="text-xs text-blue-500">30 minutes</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">Method</div>
                <div className="text-blue-600 capitalize">{selectedMeetingType.replace('_', ' ')}</div>
                <div className="text-xs text-blue-500">Free consultation</div>
              </div>
            </div>
          </div>
        )}
        
        {/* What to Expect Section */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-600 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">What to Expect</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Comprehensive financial situation review</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Discussion of all debt relief options</span>
              </li>
            </ul>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Personalized Q&A session</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Clear next steps and action plan</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
