
import { ProfilePicture } from '../ProfilePicture';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserSquare, Phone, Home, Briefcase, CreditCard, FileText, MapPin } from "lucide-react";
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClientSignUpFieldsProps {
  fullName: string;
  setFullName: (value: string) => void;
  userId: string;
  setUserId: (value: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  occupation: string;
  setOccupation: (value: string) => void;
  income: string;
  setIncome: (value: string) => void;
  preferredContact: string;
  setPreferredContact: (value: string) => void;
  // Estate information fields
  estateNumber: string;
  setEstateNumber: (value: string) => void;
  fileNumber: string;
  setFileNumber: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
}

// OSB Division offices for the dropdown
const OSB_DIVISION_OFFICES = [
  { value: "toronto", label: "Toronto (31)", code: "31" },
  { value: "vancouver", label: "Vancouver (21)", code: "21" },
  { value: "winnipeg", label: "Winnipeg (41)", code: "41" },
  { value: "montreal", label: "Montreal (11)", code: "11" },
  { value: "halifax", label: "Halifax (51)", code: "51" },
  { value: "calgary", label: "Calgary (22)", code: "22" },
  { value: "edmonton", label: "Edmonton (23)", code: "23" },
  { value: "ottawa", label: "Ottawa (32)", code: "32" },
  { value: "hamilton", label: "Hamilton (33)", code: "33" },
  { value: "london", label: "London (34)", code: "34" },
  { value: "regina", label: "Regina (42)", code: "42" },
  { value: "saskatoon", label: "Saskatoon (43)", code: "43" },
  { value: "quebec", label: "Quebec (12)", code: "12" },
  { value: "other", label: "Other", code: "" },
];

export const ClientSignUpFields = ({
  fullName,
  setFullName,
  userId,
  setUserId,
  avatarUrl,
  setAvatarUrl,
  phone,
  setPhone,
  address,
  setAddress,
  occupation,
  setOccupation,
  income,
  setIncome,
  preferredContact,
  setPreferredContact,
  estateNumber,
  setEstateNumber,
  fileNumber,
  setFileNumber,
  location,
  setLocation
}: ClientSignUpFieldsProps) => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let newErrors = {...errors};
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.trim().length < 3) {
          newErrors.fullName = 'Full name must be at least 3 characters';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'estateNumber':
        if (value.trim() && !/^\d{2}-\d{5}$/.test(value.trim())) {
          newErrors.estateNumber = 'Estate number format should be ##-##### (e.g., 31-12345)';
        } else {
          delete newErrors.estateNumber;
        }
        break;
      case 'phone':
        if (value && !/^[0-9()\-+\s]*$/.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // Format the estate number as user types to enforce ##-##### pattern
  const handleEstateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d-]/g, '');
    
    // Ensure we have the hyphen in the right place
    if (value.length >= 2 && !value.includes('-')) {
      value = `${value.substring(0, 2)}-${value.substring(2)}`;
    }
    
    // Limit to ##-##### format (max 8 chars including hyphen)
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    setEstateNumber(value);
    validateField('estateNumber', value);
  };

  // Update estate number prefix based on selected office
  const handleOfficeChange = (officeValue: string) => {
    setLocation(officeValue);
    
    // Find the selected office
    const selectedOffice = OSB_DIVISION_OFFICES.find(office => office.value === officeValue);
    
    if (selectedOffice && selectedOffice.code) {
      // Update the estate number prefix while preserving any existing number
      const currentParts = estateNumber.split('-');
      const currentNumber = currentParts.length > 1 ? currentParts[1] : '';
      
      setEstateNumber(`${selectedOffice.code}-${currentNumber}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Profile Information */}
      <div className="p-4 border border-blue-100 rounded-md bg-blue-50/50">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
              <User className="h-3.5 w-3.5" />
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                validateField('fullName', e.target.value);
              }}
              placeholder="John Doe"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
              required
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
              <UserSquare className="h-3.5 w-3.5" />
              User ID
            </Label>
            <Input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Unique identifier (optional)"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Estate Information - highlighted as primary section */}
      <div className="p-4 border border-blue-200 rounded-md bg-blue-50/70 shadow-sm">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Estate and Case Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="estateNumber" className="text-sm font-medium text-blue-700 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Estate Number 
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-semibold text-blue-700">?</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <p>Provided by your trustee; a 7-digit unique number starting with a two-digit Division Office code (e.g., 31 for Toronto).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="estateNumber"
              type="text"
              value={estateNumber}
              onChange={handleEstateNumberChange}
              placeholder="e.g., 31-12345"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
            {errors.estateNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.estateNumber}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Format: ##-##### (Division code-Estate number)
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="fileNumber" className="text-sm font-medium text-blue-700 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                File Number
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-semibold text-blue-700">?</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <p>The internal file number given by your trustee, used for quick referencing your case.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="fileNumber"
              type="text"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              placeholder="e.g., F-10001"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="location" className="text-sm font-medium text-blue-700 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              Trustee Office Location
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-semibold text-blue-700">?</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p>Select the OSB division office handling your case. This helps validate your Estate Number.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={location} 
            onValueChange={handleOfficeChange}
          >
            <SelectTrigger className="w-full border-blue-200 mt-2">
              <SelectValue placeholder="Select trustee office location" />
            </SelectTrigger>
            <SelectContent>
              {OSB_DIVISION_OFFICES.map((office) => (
                <SelectItem key={office.value} value={office.value}>
                  {office.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Optional but recommended - helps validate your Estate Number
          </p>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="p-4 border border-blue-100 rounded-md bg-blue-50/50">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
              <Phone className="h-3.5 w-3.5" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                validateField('phone', e.target.value);
              }}
              placeholder="(555) 123-4567"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
              <Home className="h-3.5 w-3.5" />
              Address
            </Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, Province"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="preferredContact" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
            Preferred Contact Method
          </Label>
          <Select 
            value={preferredContact} 
            onValueChange={setPreferredContact}
          >
            <SelectTrigger className="w-full border-blue-200 mt-2">
              <SelectValue placeholder="Select preferred contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="text">Text Message</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Optional Information */}
      <div className="p-4 border border-blue-100 rounded-md bg-blue-50/50">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Additional Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
              <Briefcase className="h-3.5 w-3.5" />
              Occupation
            </Label>
            <Input
              id="occupation"
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Your occupation"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="income" className="text-sm font-medium flex items-center gap-1.5 text-blue-700">
              <CreditCard className="h-3.5 w-3.5" />
              Annual Income
            </Label>
            <Input
              id="income"
              type="text"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g., $50,000"
              className="w-full rounded-md border border-blue-200 bg-background/50 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Profile Picture */}
      <div className="p-4 border border-blue-100 rounded-md bg-blue-50/50">
        <Label className="text-sm font-medium mb-2 block text-blue-700">
          Profile Picture
        </Label>
        <div className="flex flex-col items-center">
          <div className="bg-blue-50 p-2 rounded-full border border-blue-200 mb-2">
            <ProfilePicture
              url={avatarUrl}
              onUpload={(url) => {
                setAvatarUrl(url);
                toast({
                  title: "Success",
                  description: "Profile picture selected successfully",
                });
              }}
              size={80}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Optional: Upload an image (JPG, PNG, GIF) up to 5MB
          </p>
        </div>
      </div>
    </div>
  );
};
