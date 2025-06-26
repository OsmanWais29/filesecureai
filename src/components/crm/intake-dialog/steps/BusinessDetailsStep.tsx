
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
        <CardTitle>Employment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="space-y-2">
          <Label htmlFor="employer">Employer</Label>
          <Input
            id="employer"
            name="employer"
            value={formData.employer || ''}
            onChange={handleInputChange}
            placeholder="Enter employer name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation/Position</Label>
          <Input
            id="occupation"
            name="occupation"
            value={formData.occupation || ''}
            onChange={handleInputChange}
            placeholder="Enter occupation or position"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employerAddress">Employer Address</Label>
          <Input
            id="employerAddress"
            name="employerAddress"
            value={formData.employerAddress || ''}
            onChange={handleInputChange}
            placeholder="Enter employer street address"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employerCity">City</Label>
            <Input
              id="employerCity"
              name="employerCity"
              value={formData.employerCity || ''}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerProvince">Province</Label>
            <Input
              id="employerProvince"
              name="employerProvince"
              value={formData.employerProvince || ''}
              onChange={handleInputChange}
              placeholder="Enter province"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerPostalCode">Postal Code</Label>
            <Input
              id="employerPostalCode"
              name="employerPostalCode"
              value={formData.employerPostalCode || ''}
              onChange={handleInputChange}
              placeholder="Enter postal code"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Monthly Income</Label>
          <Input
            id="monthlyIncome"
            name="monthlyIncome"
            type="number"
            step="0.01"
            value={formData.monthlyIncome || ''}
            onChange={handleInputChange}
            placeholder="Enter monthly income"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional employment information..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
