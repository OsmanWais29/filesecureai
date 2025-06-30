
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Hash, Phone, MapPin, Briefcase, DollarSign, Mail, FileText, Building } from 'lucide-react';

interface ClientSignUpFieldsProps {
  fullName: string;
  setFullName: (name: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  address: string;
  setAddress: (address: string) => void;
  occupation: string;
  setOccupation: (occupation: string) => void;
  income: string;
  setIncome: (income: string) => void;
  preferredContact: string;
  setPreferredContact: (contact: string) => void;
  estateNumber: string;
  setEstateNumber: (number: string) => void;
  caseNumber: string;
  setCaseNumber: (number: string) => void;
  location: string;
  setLocation: (location: string) => void;
  administrativeType: string;
  setAdministrativeType: (type: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

export const ClientSignUpFields: React.FC<ClientSignUpFieldsProps> = ({
  fullName,
  setFullName,
  userId,
  setUserId,
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
  caseNumber,
  setCaseNumber,
  location,
  setLocation,
  administrativeType,
  setAdministrativeType,
  avatarUrl,
  setAvatarUrl
}) => {
  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full legal name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId" className="text-sm font-medium">
            Client ID *
          </Label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="userId"
              type="text"
              placeholder="Enter a unique client identifier"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="address"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10 min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Employment & Financial Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Employment & Financial Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="occupation" className="text-sm font-medium">
            Occupation
          </Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="occupation"
              type="text"
              placeholder="Enter your current occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="income" className="text-sm font-medium">
            Monthly Income
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="income"
              type="number"
              placeholder="Enter your monthly income"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Case Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="estateNumber" className="text-sm font-medium">
            Estate Number
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="estateNumber"
              type="text"
              placeholder="Enter estate number (if available)"
              value={estateNumber}
              onChange={(e) => setEstateNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caseNumber" className="text-sm font-medium">
            Case Number
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="caseNumber"
              type="text"
              placeholder="Enter case number (if available)"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location/Province
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              type="text"
              placeholder="Enter your province/location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="administrativeType" className="text-sm font-medium">
            Administrative Type
          </Label>
          <Select value={administrativeType} onValueChange={setAdministrativeType}>
            <SelectTrigger>
              <SelectValue placeholder="Select administrative type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consumer_proposal">Consumer Proposal</SelectItem>
              <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
              <SelectItem value="division_1_proposal">Division I Proposal</SelectItem>
              <SelectItem value="receivership">Receivership</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Communication Preference</h3>
        
        <div className="space-y-2">
          <Label htmlFor="preferredContact" className="text-sm font-medium">
            Preferred Contact Method
          </Label>
          <Select value={preferredContact} onValueChange={setPreferredContact}>
            <SelectTrigger>
              <SelectValue placeholder="Select preferred contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="mail">Mail</SelectItem>
              <SelectItem value="portal">Client Portal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
