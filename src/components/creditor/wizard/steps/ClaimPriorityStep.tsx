import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Shield, 
  Star, 
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import { 
  AddCreditorFormData, 
  ClaimFiledStatus, 
  ClaimPriority, 
  SecurityType, 
  ClaimNature,
  CRAClaimType,
} from "@/types/creditor";
import { cn } from "@/lib/utils";

interface ClaimPriorityStepProps {
  formData: AddCreditorFormData;
  updateFormData: (updates: Partial<AddCreditorFormData>) => void;
  errors: string[];
}

const CLAIM_FILED_OPTIONS: { value: ClaimFiledStatus; label: string }[] = [
  { value: "yes", label: "Yes - Claim has been filed" },
  { value: "no", label: "No - Claim not being filed" },
  { value: "not_yet_filed", label: "Not Yet Filed - Expected to file" },
];

const PRIORITY_OPTIONS: { value: ClaimPriority; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "secured", label: "Secured", icon: <Shield className="h-5 w-5" />, description: "Backed by collateral (mortgage, PPSA)" },
  { value: "preferred", label: "Preferred", icon: <Star className="h-5 w-5" />, description: "Statutory priority (wages, source deductions)" },
  { value: "unsecured", label: "Unsecured", icon: <DollarSign className="h-5 w-5" />, description: "No security or priority" },
];

const SECURITY_TYPES: { value: SecurityType; label: string }[] = [
  { value: "mortgage", label: "Mortgage" },
  { value: "ppsa", label: "PPSA Registration" },
  { value: "lien", label: "Lien" },
  { value: "statutory", label: "Statutory Security" },
  { value: "other", label: "Other" },
];

const CLAIM_NATURES: { value: ClaimNature; label: string }[] = [
  { value: "tax", label: "Tax" },
  { value: "loan", label: "Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "judgment", label: "Judgment" },
  { value: "lease", label: "Lease" },
  { value: "support_maintenance", label: "Support / Maintenance" },
  { value: "trade_debt", label: "Trade Debt" },
  { value: "wages", label: "Wages" },
  { value: "other", label: "Other" },
];

const CRA_CLAIM_TYPES: { value: CRAClaimType; label: string }[] = [
  { value: "source_deductions", label: "Source Deductions (CPP, EI, Tax)" },
  { value: "gst_hst", label: "GST/HST" },
  { value: "corporate_income_tax", label: "Corporate Income Tax" },
  { value: "personal_income_tax", label: "Personal Income Tax" },
  { value: "payroll_tax", label: "Payroll Tax" },
];

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", 
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", 
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
];

export function ClaimPriorityStep({ formData, updateFormData, errors }: ClaimPriorityStepProps) {
  const isGovernmentCRA = formData.creditor_type === "government" && formData.government_type === "cra";

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

      {/* Account / Reference Information */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">Account / Reference Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account_number">Account / Reference Number</Label>
            <Input
              id="account_number"
              value={formData.account_number || ""}
              onChange={(e) => updateFormData({ account_number: e.target.value })}
              placeholder="e.g., ACC-123456789"
            />
            <p className="text-xs text-muted-foreground">Required for reconciliation with proofs of claim</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_loan_id">Related Contract / Loan ID</Label>
            <Input
              id="contract_loan_id"
              value={formData.contract_loan_id || ""}
              onChange={(e) => updateFormData({ contract_loan_id: e.target.value })}
              placeholder="e.g., LOAN-2024-001"
            />
          </div>
        </div>
      </div>

      {/* Claim Overview */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">Claim Overview</h3>
        
        <div className="space-y-2">
          <Label>Claim Filed?</Label>
          <Select
            value={formData.claim_filed}
            onValueChange={(value: ClaimFiledStatus) => updateFormData({ claim_filed: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLAIM_FILED_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.claim_filed !== "no" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claim_amount">
                Claim Amount {formData.claim_filed === "yes" && <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="claim_amount"
                  type="number"
                  value={formData.claim_amount || ""}
                  onChange={(e) => updateFormData({ claim_amount: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => updateFormData({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim_date">Claim Date</Label>
              <Input
                id="claim_date"
                type="date"
                value={formData.claim_date || ""}
                onChange={(e) => updateFormData({ claim_date: e.target.value })}
              />
            </div>
          </div>
        )}

        {formData.claim_filed === "not_yet_filed" && (
          <div className="space-y-2">
            <Label htmlFor="expected_filing_deadline">Expected Filing Deadline</Label>
            <Input
              id="expected_filing_deadline"
              type="date"
              value={formData.expected_filing_deadline || ""}
              onChange={(e) => updateFormData({ expected_filing_deadline: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Nature of Claim</Label>
          <Select
            value={formData.claim_nature}
            onValueChange={(value: ClaimNature) => updateFormData({ claim_nature: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nature of claim" />
            </SelectTrigger>
            <SelectContent>
              {CLAIM_NATURES.map((nature) => (
                <SelectItem key={nature.value} value={nature.value}>
                  {nature.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Priority & Security */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">Priority & Security</h3>
        
        <div className="space-y-3">
          <Label className="font-semibold">Claim Priority</Label>
          <div className="grid grid-cols-3 gap-3">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFormData({ 
                  priority: option.value,
                  security_type: option.value !== "secured" ? undefined : formData.security_type
                })}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  formData.priority === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  formData.priority === option.value
                    ? option.value === "secured" ? "bg-blue-500 text-white"
                    : option.value === "preferred" ? "bg-amber-500 text-white"
                    : "bg-muted-foreground text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  {option.icon}
                </div>
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground text-center">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secured Claim Details */}
        {formData.priority === "secured" && (
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">Security Details</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Security Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.security_type}
                  onValueChange={(value: SecurityType) => updateFormData({ security_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collateral_value">Estimated Security Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="collateral_value"
                    type="number"
                    value={formData.collateral_value || ""}
                    onChange={(e) => updateFormData({ collateral_value: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collateral_description">Collateral Description</Label>
              <Textarea
                id="collateral_description"
                value={formData.collateral_description || ""}
                onChange={(e) => updateFormData({ collateral_description: e.target.value })}
                placeholder="Describe the collateral securing this claim..."
                rows={2}
              />
            </div>

            {formData.security_type === "ppsa" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-blue-500/20">
                <div className="space-y-2">
                  <Label htmlFor="ppsa_registration_number">PPSA Registration Number</Label>
                  <Input
                    id="ppsa_registration_number"
                    value={formData.ppsa_registration_number || ""}
                    onChange={(e) => updateFormData({ ppsa_registration_number: e.target.value })}
                    placeholder="e.g., 12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>PPSA Province</Label>
                  <Select
                    value={formData.ppsa_province}
                    onValueChange={(value) => updateFormData({ ppsa_province: value })}
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
                  <Label htmlFor="ppsa_registration_date">Registration Date</Label>
                  <Input
                    id="ppsa_registration_date"
                    type="date"
                    value={formData.ppsa_registration_date || ""}
                    onChange={(e) => updateFormData({ ppsa_registration_date: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Government & Statutory Flags - CRA Specific */}
      {isGovernmentCRA && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold border-b border-border pb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            CRA Claim Details (Critical for Compliance)
          </h3>
          
          <Alert className="bg-amber-500/5 border-amber-500/20">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              CRA claims may have deemed trust or super-priority status under BIA. Proper classification is critical for distributions.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>CRA Claim Type</Label>
            <Select
              value={formData.cra_claim_type}
              onValueChange={(value: CRAClaimType) => updateFormData({ cra_claim_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CRA claim type" />
              </SelectTrigger>
              <SelectContent>
                {CRA_CLAIM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="space-y-1">
                <Label className="font-medium">Deemed Trust Applies?</Label>
                <p className="text-xs text-muted-foreground">Source deductions held in trust for CRA</p>
              </div>
              <Switch
                checked={formData.deemed_trust_applies || false}
                onCheckedChange={(checked) => updateFormData({ deemed_trust_applies: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="space-y-1">
                <Label className="font-medium">Super-Priority Applies?</Label>
                <p className="text-xs text-muted-foreground">Priority over secured creditors</p>
              </div>
              <Switch
                checked={formData.super_priority_applies || false}
                onCheckedChange={(checked) => updateFormData({ super_priority_applies: checked })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
