import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, User, Landmark, CreditCard, Truck, HelpCircle } from "lucide-react";
import { AddCreditorFormData, CreditorType, GovernmentCreditorType } from "@/types/creditor";
import { cn } from "@/lib/utils";

interface CreditorIdentityStepProps {
  formData: AddCreditorFormData;
  updateFormData: (updates: Partial<AddCreditorFormData>) => void;
  errors: string[];
}

const CREDITOR_TYPES: { value: CreditorType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "financial_institution", label: "Financial Institution", icon: <Building2 className="h-5 w-5" />, description: "Banks, credit unions, lenders" },
  { value: "government", label: "Government", icon: <Landmark className="h-5 w-5" />, description: "CRA, Service Canada, Provincial, Municipal" },
  { value: "secured_lender", label: "Secured Lender", icon: <CreditCard className="h-5 w-5" />, description: "Mortgage holders, PPSA registered" },
  { value: "individual", label: "Individual", icon: <User className="h-5 w-5" />, description: "Personal loans, family debts" },
  { value: "trade_creditor", label: "Trade Creditor", icon: <Truck className="h-5 w-5" />, description: "Suppliers, vendors, contractors" },
  { value: "other", label: "Other", icon: <HelpCircle className="h-5 w-5" />, description: "Other creditor types" },
];

const GOVERNMENT_TYPES: { value: GovernmentCreditorType; label: string }[] = [
  { value: "cra", label: "Canada Revenue Agency (CRA)" },
  { value: "service_canada", label: "Service Canada" },
  { value: "provincial", label: "Provincial Government" },
  { value: "municipal", label: "Municipal Government" },
];

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", 
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", 
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
];

export function CreditorIdentityStep({ formData, updateFormData, errors }: CreditorIdentityStepProps) {
  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Creditor Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">
          Creditor Legal Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., TD Canada Trust, Canada Revenue Agency"
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Enter the full legal name as it appears on official documents
        </p>
      </div>

      {/* Creditor Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Creditor Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CREDITOR_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFormData({ 
                creditor_type: type.value,
                government_type: type.value !== "government" ? undefined : formData.government_type
              })}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                formData.creditor_type === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                formData.creditor_type === type.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {type.icon}
              </div>
              <span className="text-sm font-medium">{type.label}</span>
              <span className="text-xs text-muted-foreground text-center">{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Government Sub-type */}
      {formData.creditor_type === "government" && (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
          <Label htmlFor="government_type" className="font-semibold">
            Government Agency Type
          </Label>
          <Select
            value={formData.government_type}
            onValueChange={(value: GovernmentCreditorType) => updateFormData({ government_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select government agency type" />
            </SelectTrigger>
            <SelectContent>
              {GOVERNMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Name</Label>
            <Input
              id="contact_person"
              value={formData.contact_person || ""}
              onChange={(e) => updateFormData({ contact_person: e.target.value })}
              placeholder="e.g., John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="e.g., contact@creditor.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="e.g., (416) 555-0123"
            />
          </div>
        </div>
      </div>

      {/* Mailing Address */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">Mailing Address</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="e.g., 123 Main Street, Suite 100"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="Toronto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => updateFormData({ province: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ""}
                onChange={(e) => updateFormData({ postal_code: e.target.value.toUpperCase() })}
                placeholder="M5V 1A1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateFormData({ country: e.target.value })}
                placeholder="Canada"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
