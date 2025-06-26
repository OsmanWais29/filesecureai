
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Video, Phone, MapPin } from 'lucide-react';
import { FormData } from '../../types';

interface SchedulingStepProps {
  formData: FormData;
  handleSelectChange: (field: string, value: string) => void;
}

export const SchedulingStep = ({ formData, handleSelectChange }: SchedulingStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Your Initial Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            Schedule a free 30-minute consultation with one of our licensed insolvency trustees to discuss your options.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Date
            </Label>
            <Select onValueChange={(value) => handleSelectChange('preferredDate', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="next_week">Next Week</SelectItem>
                <SelectItem value="flexible">I'm Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time
            </Label>
            <Select onValueChange={(value) => handleSelectChange('preferredTime', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                <SelectItem value="flexible">I'm Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Meeting Type</Label>
          <Select onValueChange={(value) => handleSelectChange('meetingType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="How would you like to meet?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Call (Recommended)
                </div>
              </SelectItem>
              <SelectItem value="phone">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Call
                </div>
              </SelectItem>
              <SelectItem value="in_person">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  In-Person Meeting
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">What to Expect</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Review of your financial situation</li>
            <li>• Discussion of available options</li>
            <li>• Q&A about the process</li>
            <li>• Next steps recommendation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
