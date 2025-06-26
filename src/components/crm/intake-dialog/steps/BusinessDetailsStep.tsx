
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '../../types';

interface BusinessDetailsStepProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleEmploymentTypeChange: (value: string) => void;
}

export const BusinessDetailsStep = ({ 
  formData, 
  handleInputChange, 
  handleSelectChange, 
  handleEmploymentTypeChange 
}: BusinessDetailsStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business & Employment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Business Type</Label>
            <Select value={formData.businessType} onValueChange={(value) => handleSelectChange('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="non_profit">Non-Profit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Employment Type</Label>
          <Select onValueChange={handleEmploymentTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full-time Employee</SelectItem>
              <SelectItem value="part_time">Part-time Employee</SelectItem>
              <SelectItem value="self_employed">Self-employed</SelectItem>
              <SelectItem value="contractor">Independent Contractor</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lead Source</Label>
            <Select value={formData.leadSource} onValueChange={(value) => handleSelectChange('leadSource', value)}>
              <SelectTrigger>
                <SelectValue placeholder="How did you hear about us?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="google">Google Search</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Account Status</Label>
            <Select value={formData.accountStatus} onValueChange={(value) => handleSelectChange('accountStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="leadDescription">Tell us about your situation</Label>
          <Textarea
            id="leadDescription"
            name="leadDescription"
            value={formData.leadDescription}
            onChange={handleInputChange}
            placeholder="Please describe your current financial situation and what brought you to seek our services..."
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional information you'd like to share..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
