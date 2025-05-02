
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "../form/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IncomeExpenseData } from "../types";
import { CalendarDays, Home, User } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientProfileSectionProps {
  formData: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaritalStatusChange: (value: string) => void;
  isNewClientMode?: boolean;
  newClient?: {
    id: string;
    name: string;
    status: string;
  };
}

export const ClientProfileSection = ({
  formData,
  onChange,
  onMaritalStatusChange,
  isNewClientMode = false,
  newClient
}: ClientProfileSectionProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Debtor Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="full_name"
            name="full_name"
            label="Full Name"
            value={formData.full_name || ""}
            onChange={onChange}
            required
          />
          
          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select
              value={formData.marital_status || ""}
              onValueChange={onMaritalStatusChange}
            >
              <SelectTrigger id="marital_status" className="w-full">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="common_law">Common Law</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="residential_address"
            name="residential_address"
            label="Residential Address"
            value={formData.residential_address || ""}
            onChange={onChange}
            required
            tooltip="Enter the complete residential address"
          />
          
          <FormField
            id="date_of_filing"
            name="date_of_filing"
            label="Date of Filing"
            value={formData.date_of_filing || ""}
            onChange={onChange}
            type="date"
            required
            tooltip="Enter the date the bankruptcy/proposal was filed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="phone_home"
            name="phone_home"
            label="Home Phone"
            value={formData.phone_home || ""}
            onChange={onChange}
          />
          
          <FormField
            id="work_phone"
            name="work_phone"
            label="Work Phone"
            value={formData.work_phone || ""}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="employer_name"
            name="employer_name"
            label="Employer Name"
            value={formData.employer_name || ""}
            onChange={onChange}
          />
          
          <FormField
            id="occupation"
            name="occupation"
            label="Occupation"
            value={formData.occupation || ""}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="spouse_name"
            name="spouse_name"
            label="Spouse Name"
            value={formData.spouse_name || ""}
            onChange={onChange}
            tooltip="If applicable"
          />
          
          <FormField
            id="household_size"
            name="household_size"
            label="Household Size"
            value={formData.household_size || ""}
            onChange={onChange}
            type="number"
          />
        </div>
      </CardContent>
    </Card>
  );
};
