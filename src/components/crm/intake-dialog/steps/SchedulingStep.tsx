
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle, Star, Users, MessageSquare } from 'lucide-react';
import { FormData } from '../../types';

interface SchedulingStepProps {
  formData: FormData;
  handleSelectChange: (field: string, value: string) => void;
}

export const SchedulingStep = ({ formData, handleSelectChange }: SchedulingStepProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Schedule Your Initial Consultation</h3>
            <p className="text-sm text-gray-600 font-normal mt-1">Book a free 30-minute session with our licensed trustees</p>
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
              <h4 className="font-semibold text-green-900 mb-2">🎉 Congratulations on taking the first step!</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Our experienced licensed insolvency trustees are ready to provide you with personalized guidance. 
                This consultation is completely <strong>free</strong> and <strong>confidential</strong>.
              </p>
            </div>
          </div>
        </div>
        
        {/* Scheduling Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-3 text-base font-medium text-gray-700">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              Preferred Date
            </Label>
            <Select onValueChange={(value) => handleSelectChange('preferredDate', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <SelectValue placeholder="When would you like to meet?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">🚀 Today (Priority Booking)</SelectItem>
                <SelectItem value="tomorrow">⭐ Tomorrow</SelectItem>
                <SelectItem value="this_week">📅 This Week</SelectItem>
                <SelectItem value="next_week">📆 Next Week</SelectItem>
                <SelectItem value="flexible">🔄 I'm Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label className="flex items-center gap-3 text-base font-medium text-gray-700">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              Preferred Time
            </Label>
            <Select onValueChange={(value) => handleSelectChange('preferredTime', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                <SelectValue placeholder="What time works best?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">🌅 Morning (9 AM - 12 PM)</SelectItem>
                <SelectItem value="afternoon">☀️ Afternoon (12 PM - 5 PM)</SelectItem>
                <SelectItem value="evening">🌆 Evening (5 PM - 8 PM)</SelectItem>
                <SelectItem value="flexible">⏰ I'm Flexible</SelectItem>
              </SelectContent>
            </Select>
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
          
          <Select onValueChange={(value) => handleSelectChange('meetingType', value)}>
            <SelectTrigger className="h-14 border-2 border-gray-200 hover:border-indigo-300 transition-colors">
              <SelectValue placeholder="Choose your preferred meeting method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Video className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Video Call</div>
                    <div className="text-xs text-gray-500">Recommended • Secure & Convenient</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="phone" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Phone Call</div>
                    <div className="text-xs text-gray-500">Quick & Easy</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="in_person" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">In-Person Meeting</div>
                    <div className="text-xs text-gray-500">Face-to-Face Discussion</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* What to Expect Section */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-600 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">What to Expect in Your Consultation</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Comprehensive review of your financial situation</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Discussion of all available debt relief options</span>
              </li>
            </ul>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Personalized Q&A about the insolvency process</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Clear next steps and action plan</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <h4 className="font-semibold text-blue-900">Why Choose Our Licensed Trustees?</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="text-center">
              <div className="font-medium">🏆 Licensed Professionals</div>
              <div className="text-xs text-blue-600">Government regulated and certified</div>
            </div>
            <div className="text-center">
              <div className="font-medium">🔒 100% Confidential</div>
              <div className="text-xs text-blue-600">Your privacy is protected</div>
            </div>
            <div className="text-center">
              <div className="font-medium">💝 No Cost Consultation</div>
              <div className="text-xs text-blue-600">Free initial assessment</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
