import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Users, Mail, Phone, MapPin, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { createClientFolder } from "@/utils/documents/folder-utils/createFolder";

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (clientId: string) => void;
}

type ClientType = "individual" | "business" | "joint";
type EstateType = "bankruptcy" | "consumer_proposal" | "division_i_proposal";

interface ClientFormData {
  clientType: ClientType;
  // Individual fields
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sin: string;
  formerNames: string;
  maritalStatus: string;
  dependants: string;
  // Business fields
  legalBusinessName: string;
  tradeName: string;
  businessNumber: string;
  incorporationJurisdiction: string;
  directorNames: string;
  // Contact
  primaryEmail: string;
  primaryPhone: string;
  secondaryEmail: string;
  preferredContact: string;
  // Address
  street: string;
  city: string;
  province: string;
  postalCode: string;
  mailingAddress: string;
  // Estate
  estateType: EstateType;
  filingProvince: string;
  intendedFilingDate: string;
  assignedTrustee: string;
  caseReference: string;
  // Status & Flags
  clientStatus: string;
  riskFlags: string[];
  // Notes
  internalNotes: string;
}

const initialFormData: ClientFormData = {
  clientType: "individual",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  sin: "",
  formerNames: "",
  maritalStatus: "",
  dependants: "",
  legalBusinessName: "",
  tradeName: "",
  businessNumber: "",
  incorporationJurisdiction: "",
  directorNames: "",
  primaryEmail: "",
  primaryPhone: "",
  secondaryEmail: "",
  preferredContact: "email",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  mailingAddress: "",
  estateType: "bankruptcy",
  filingProvince: "",
  intendedFilingDate: "",
  assignedTrustee: "",
  caseReference: "",
  clientStatus: "intake",
  riskFlags: [],
  internalNotes: "",
};

const provinces = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Nova Scotia", "Ontario",
  "Prince Edward Island", "Quebec", "Saskatchewan",
  "Northwest Territories", "Nunavut", "Yukon"
];

const riskFlagOptions = [
  { id: "missing_financials", label: "Missing financials" },
  { id: "cra_exposure", label: "CRA exposure" },
  { id: "business_income", label: "Business income" },
  { id: "prior_insolvency", label: "Prior insolvency" },
  { id: "urgent_deadlines", label: "Urgent deadlines" },
];

export const AddClientModal = ({ open, onOpenChange, onClientCreated }: AddClientModalProps) => {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("type");

  const updateField = <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRiskFlag = (flagId: string) => {
    setFormData(prev => ({
      ...prev,
      riskFlags: prev.riskFlags.includes(flagId)
        ? prev.riskFlags.filter(f => f !== flagId)
        : [...prev.riskFlags, flagId]
    }));
  };

  const getClientName = () => {
    if (formData.clientType === "business") {
      return formData.legalBusinessName || formData.tradeName;
    }
    return `${formData.firstName} ${formData.lastName}`.trim();
  };

  const getDivisionOfficeCode = (province: string): string => {
    const codes: Record<string, string> = {
      "Ontario": "11",
      "Quebec": "21",
      "British Columbia": "31",
      "Alberta": "41",
      "Saskatchewan": "51",
      "Manitoba": "61",
      "Nova Scotia": "71",
      "New Brunswick": "72",
      "Prince Edward Island": "73",
      "Newfoundland and Labrador": "74",
    };
    return codes[province] || "00";
  };

  const handleSubmit = async () => {
    const clientName = getClientName();
    if (!clientName) {
      toast.error("Please enter client name");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a client");
        return;
      }

      // Build metadata with all the detailed info
      const metadata = {
        client_type: formData.clientType,
        // Identity
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        sin_encrypted: formData.sin ? "***" : null, // Never store raw SIN
        former_names: formData.formerNames,
        marital_status: formData.maritalStatus,
        dependants: formData.dependants,
        // Business
        legal_business_name: formData.legalBusinessName,
        trade_name: formData.tradeName,
        business_number: formData.businessNumber,
        incorporation_jurisdiction: formData.incorporationJurisdiction,
        director_names: formData.directorNames,
        // Contact
        secondary_email: formData.secondaryEmail,
        preferred_contact: formData.preferredContact,
        // Address
        address: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode,
          mailing_address: formData.mailingAddress,
        },
        // Estate
        estate_type: formData.estateType,
        filing_province: formData.filingProvince,
        division_office_code: getDivisionOfficeCode(formData.filingProvince),
        intended_filing_date: formData.intendedFilingDate,
        assigned_trustee: formData.assignedTrustee,
        case_reference: formData.caseReference,
        // Status & Flags
        risk_flags: formData.riskFlags,
        // Notes
        internal_notes: formData.internalNotes,
        // Auto-generated
        created_by: user.id,
        audit_trail_initialized: true,
        safa_baseline_attached: true,
        osb_forms_preloaded: true,
      };

      // Create client record
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: clientName,
          email: formData.primaryEmail,
          phone: formData.primaryPhone,
          status: formData.clientStatus,
          metadata,
          engagement_score: 0,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create client folder in documents
      const folderResult = await createClientFolder(clientName);
      if (!folderResult.success) {
        console.warn("Could not create client folder:", folderResult.error);
      }

      // Create initial audit trail entry
      await supabase.from("audit_logs").insert({
        action: "client_created",
        user_id: user.id,
        metadata: {
          client_id: client.id,
          client_name: clientName,
          client_type: formData.clientType,
          estate_type: formData.estateType,
          filing_province: formData.filingProvince,
        },
      });

      toast.success("Client created successfully", {
        description: `${clientName} has been added with estate-aware folder structure.`,
      });

      // Reset form and close
      setFormData(initialFormData);
      setActiveTab("type");
      onOpenChange(false);
      onClientCreated?.(client.id);

    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Client
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="type" className="text-xs">Type</TabsTrigger>
            <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
            <TabsTrigger value="address" className="text-xs">Address</TabsTrigger>
            <TabsTrigger value="estate" className="text-xs">Estate</TabsTrigger>
            <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4 pr-4">
            {/* Client Type Tab */}
            <TabsContent value="type" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Client Type</Label>
                <p className="text-sm text-muted-foreground">
                  This determines which OSB forms apply and which SAFA rules load.
                </p>
                <RadioGroup
                  value={formData.clientType}
                  onValueChange={(v) => updateField("clientType", v as ClientType)}
                  className="grid grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="individual"
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.clientType === "individual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="individual" id="individual" className="sr-only" />
                    <User className="h-8 w-8 text-primary" />
                    <span className="font-medium">Individual</span>
                  </Label>
                  <Label
                    htmlFor="business"
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.clientType === "business" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="business" id="business" className="sr-only" />
                    <Building2 className="h-8 w-8 text-primary" />
                    <span className="font-medium">Business</span>
                  </Label>
                  <Label
                    htmlFor="joint"
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.clientType === "joint" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="joint" id="joint" className="sr-only" />
                    <Users className="h-8 w-8 text-primary" />
                    <span className="font-medium">Joint Estate</span>
                  </Label>
                </RadioGroup>
              </div>
            </TabsContent>

            {/* Identity Tab */}
            <TabsContent value="identity" className="space-y-4 mt-0">
              {formData.clientType === "business" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legalBusinessName">Legal Business Name *</Label>
                      <Input
                        id="legalBusinessName"
                        value={formData.legalBusinessName}
                        onChange={(e) => updateField("legalBusinessName", e.target.value)}
                        placeholder="ABC Corporation Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tradeName">Trade Name</Label>
                      <Input
                        id="tradeName"
                        value={formData.tradeName}
                        onChange={(e) => updateField("tradeName", e.target.value)}
                        placeholder="ABC Corp"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">Business Number (BN)</Label>
                      <Input
                        id="businessNumber"
                        value={formData.businessNumber}
                        onChange={(e) => updateField("businessNumber", e.target.value)}
                        placeholder="123456789RC0001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incorporationJurisdiction">Incorporation Jurisdiction</Label>
                      <Select
                        value={formData.incorporationJurisdiction}
                        onValueChange={(v) => updateField("incorporationJurisdiction", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="federal">Federal</SelectItem>
                          {provinces.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="directorNames">Director / Officer Names</Label>
                    <Input
                      id="directorNames"
                      value={formData.directorNames}
                      onChange={(e) => updateField("directorNames", e.target.value)}
                      placeholder="John Smith, Jane Doe"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sin">SIN (Optional - Encrypted)</Label>
                      <Input
                        id="sin"
                        type="password"
                        value={formData.sin}
                        onChange={(e) => updateField("sin", e.target.value)}
                        placeholder="•••-•••-•••"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select
                        value={formData.maritalStatus}
                        onValueChange={(v) => updateField("maritalStatus", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="common_law">Common-Law</SelectItem>
                          <SelectItem value="separated">Separated</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dependants">Number of Dependants</Label>
                      <Input
                        id="dependants"
                        type="number"
                        min="0"
                        value={formData.dependants}
                        onChange={(e) => updateField("dependants", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formerNames">Former Names / Aliases</Label>
                    <Input
                      id="formerNames"
                      value={formData.formerNames}
                      onChange={(e) => updateField("formerNames", e.target.value)}
                      placeholder="Previous legal names"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryEmail" className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Primary Email *
                  </Label>
                  <Input
                    id="primaryEmail"
                    type="email"
                    value={formData.primaryEmail}
                    onChange={(e) => updateField("primaryEmail", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryPhone" className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Primary Phone *
                  </Label>
                  <Input
                    id="primaryPhone"
                    type="tel"
                    value={formData.primaryPhone}
                    onChange={(e) => updateField("primaryPhone", e.target.value)}
                    placeholder="(416) 555-0123"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Secondary Email</Label>
                  <Input
                    id="secondaryEmail"
                    type="email"
                    value={formData.secondaryEmail}
                    onChange={(e) => updateField("secondaryEmail", e.target.value)}
                    placeholder="alternate@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                  <Select
                    value={formData.preferredContact}
                    onValueChange={(v) => updateField("preferredContact", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="street" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Street Address *
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  placeholder="123 Main Street, Unit 4"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Toronto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(v) => updateField("province", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value.toUpperCase())}
                    placeholder="M5V 1A1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailingAddress">Mailing Address (if different)</Label>
                <Input
                  id="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={(e) => updateField("mailingAddress", e.target.value)}
                  placeholder="PO Box 123, Toronto ON M5V 1A1"
                />
              </div>
            </TabsContent>

            {/* Estate Tab */}
            <TabsContent value="estate" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Estate Type *
                </Label>
                <RadioGroup
                  value={formData.estateType}
                  onValueChange={(v) => updateField("estateType", v as EstateType)}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="bankruptcy"
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                      formData.estateType === "bankruptcy" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="bankruptcy" id="bankruptcy" />
                    <div>
                      <span className="font-medium">Bankruptcy</span>
                      <p className="text-xs text-muted-foreground">Assignment in bankruptcy under BIA</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="consumer_proposal"
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                      formData.estateType === "consumer_proposal" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="consumer_proposal" id="consumer_proposal" />
                    <div>
                      <span className="font-medium">Consumer Proposal</span>
                      <p className="text-xs text-muted-foreground">Part III Division II proposal</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="division_i_proposal"
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                      formData.estateType === "division_i_proposal" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="division_i_proposal" id="division_i_proposal" />
                    <div>
                      <span className="font-medium">Division I Proposal</span>
                      <p className="text-xs text-muted-foreground">Part III Division I proposal</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filingProvince">Filing Province *</Label>
                  <Select
                    value={formData.filingProvince}
                    onValueChange={(v) => updateField("filingProvince", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intendedFilingDate">Intended Filing Date</Label>
                  <Input
                    id="intendedFilingDate"
                    type="date"
                    value={formData.intendedFilingDate}
                    onChange={(e) => updateField("intendedFilingDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTrustee">Assigned Trustee</Label>
                  <Input
                    id="assignedTrustee"
                    value={formData.assignedTrustee}
                    onChange={(e) => updateField("assignedTrustee", e.target.value)}
                    placeholder="Trustee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseReference">Internal Case Reference</Label>
                  <Input
                    id="caseReference"
                    value={formData.caseReference}
                    onChange={(e) => updateField("caseReference", e.target.value)}
                    placeholder="e.g., 2024-001"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label>Client Status</Label>
                <Select
                  value={formData.clientStatus}
                  onValueChange={(v) => updateField("clientStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intake">Intake</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Initial Risk Flags
                </Label>
                <p className="text-xs text-muted-foreground">
                  These trigger SAFA prioritization and create audit trail entries.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {riskFlagOptions.map((flag) => (
                    <Label
                      key={flag.id}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={formData.riskFlags.includes(flag.id)}
                        onCheckedChange={() => toggleRiskFlag(flag.id)}
                      />
                      <span className="text-sm">{flag.label}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => updateField("internalNotes", e.target.value)}
                  placeholder="Internal notes (not client-visible, logged to audit trail)"
                  rows={3}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== "type" && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ["type", "identity", "contact", "address", "estate", "status"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Back
              </Button>
            )}
            {activeTab !== "status" ? (
              <Button
                onClick={() => {
                  const tabs = ["type", "identity", "contact", "address", "estate", "status"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Client"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
