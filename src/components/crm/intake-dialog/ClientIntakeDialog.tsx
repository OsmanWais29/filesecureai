
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Calendar, FileText, User, Briefcase, DollarSign, X } from "lucide-react";
import { FormData } from "@/components/crm/types";
import { useState } from "react";

interface ClientIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  formData: FormData;
  formProgress: number;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleEmploymentTypeChange: (value: string) => void;
}

export const ClientIntakeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  formData,
  formProgress,
  currentStep,
  setCurrentStep,
  handleInputChange,
  handleSelectChange,
  handleEmploymentTypeChange
}: ClientIntakeDialogProps) => {
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Mobile Phone</Label>
            <Input
              id="mobilePhone"
              name="mobilePhone"
              value={formData.mobilePhone}
              onChange={handleInputChange}
              placeholder="Enter mobile phone number"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              placeholder="Enter province"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Enter postal code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sin">Social Insurance Number (SIN)</Label>
            <Input
              id="sin"
              name="sin"
              value={formData.sin}
              onChange={handleInputChange}
              placeholder="Enter SIN"
            />
          </div>
          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select value={formData.maritalStatus} onValueChange={(value) => handleSelectChange('maritalStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="common-law">Common Law</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>How do you prefer to be contacted?</Label>
            <Select value={formData.preferredContactMethod} onValueChange={(value) => handleSelectChange('preferredContactMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>What language do you prefer to communicate in?</Label>
            <Select value={formData.preferredLanguage} onValueChange={(value) => handleSelectChange('preferredLanguage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="English" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>How did you hear about us?</Label>
            <Select value={formData.leadSource} onValueChange={(value) => handleSelectChange('leadSource', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="online">Online Search</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="leadDescription">Lead Description</Label>
            <Textarea
              id="leadDescription"
              name="leadDescription"
              value={formData.leadDescription}
              onChange={handleInputChange}
              placeholder="Enter additional details about how this lead was acquired"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Account Status</Label>
            <Select value={formData.accountStatus} onValueChange={(value) => handleSelectChange('accountStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmploymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select onValueChange={handleEmploymentTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Full-time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="self-employed">Self-employed</SelectItem>
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
              placeholder="Enter employer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation/Position</Label>
            <Input
              id="occupation"
              name="occupation"
              placeholder="Enter occupation or position"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly Income</Label>
            <Input
              id="monthlyIncome"
              name="monthlyIncome"
              placeholder="Enter monthly income"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancesStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unsecuredDebt">Unsecured Debt Amount</Label>
            <Input
              id="unsecuredDebt"
              name="unsecuredDebt"
              placeholder="Enter unsecured debt amount"
            />
            <p className="text-sm text-muted-foreground">Credit cards, personal loans, etc.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="securedDebt">Secured Debt Amount</Label>
            <Input
              id="securedDebt"
              name="securedDebt"
              placeholder="Enter secured debt amount"
            />
            <p className="text-sm text-muted-foreground">Mortgage, auto loans, etc.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxDebt">Tax Debt Amount</Label>
            <Input
              id="taxDebt"
              name="taxDebt"
              placeholder="Enter tax debt amount"
            />
            <p className="text-sm text-muted-foreground">CRA/provincial tax debts</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
        <p className="text-muted-foreground mb-4">
          Please upload the following documents to help us better understand your financial situation:
        </p>
        
        <div className="mb-6">
          <h4 className="font-medium mb-3">Required Documents:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Government-issued ID
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent pay stubs or income statements
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent bank statements (last 3 months)
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tax returns and notices of assessment
            </li>
          </ul>
        </div>

        <Card className="border-2 border-dashed border-muted-foreground/25 p-8">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Drop files here or click to browse</p>
              <Button variant="outline" className="mt-2">
                Browse Files
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Schedule Consultation</h3>
        <p className="text-muted-foreground mb-6">
          Select a convenient time for your initial consultation with one of our financial advisors.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available time slots:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Monday, 10:00 AM",
                "Tuesday, 2:00 PM", 
                "Wednesday, 11:00 AM",
                "Thursday, 3:00 PM",
                "Friday, 1:00 PM"
              ].map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={slot}
                    name="schedule"
                    value={slot}
                    checked={selectedSchedule === slot}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={slot} className="text-sm font-normal">
                    {slot}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Add any additional information that might be helpful for your consultation"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const stepTitles = [
    "Personal Info",
    "Employment", 
    "Finances",
    "Documents",
    "Schedule"
  ];

  const stepIcons = [User, Briefcase, DollarSign, FileText, Calendar];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">AI-Powered Client Intake</DialogTitle>
            <DialogDescription>
              Complete the comprehensive intake process to collect all required information for insolvency assessment.
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Progress</span>
              <span>{formProgress}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>
          
          <Tabs value={`step-${currentStep}`} className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              {stepTitles.map((title, index) => {
                const Icon = stepIcons[index];
                return (
                  <TabsTrigger 
                    key={index + 1}
                    value={`step-${index + 1}`} 
                    onClick={() => setCurrentStep(index + 1)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    {title}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <TabsContent value={`step-${currentStep}`} className="mt-6">
              {currentStep === 1 && renderPersonalInfoStep()}
              {currentStep === 2 && renderEmploymentStep()}
              {currentStep === 3 && renderFinancesStep()}
              {currentStep === 4 && renderDocumentsStep()}
              {currentStep === 5 && renderScheduleStep()}
            </TabsContent>
            
            <div className="flex justify-between mt-6 pt-4 border-t">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              <div className="ml-auto">
                {currentStep < 5 ? (
                  <Button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-slate-700 hover:bg-slate-800"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={onSubmit}
                    className="bg-slate-700 hover:bg-slate-800"
                  >
                    Complete Intake
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
