
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "./FormField";
import { IncomeExpenseData } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Signature } from "lucide-react";

interface SignatureConsentSectionProps {
  formData: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onConsentChange: (checked: boolean) => void;
}

export const SignatureConsentSection = ({
  formData,
  onChange,
  onConsentChange,
}: SignatureConsentSectionProps) => {
  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signature className="h-5 w-5" />
            Signature & Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <FormField
            id="electronic_signature"
            name="electronic_signature"
            label="Debtor's Signature"
            value={formData.electronic_signature || ""}
            onChange={onChange}
            placeholder="Type your full name to sign"
            tooltip="Electronic signature - type your full legal name"
            required
          />
          
          <FormField
            id="verification_date"
            name="verification_date"
            label="Date Signed"
            value={formData.verification_date || ""}
            onChange={onChange}
            type="date"
            required
          />

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_data_use"
                checked={formData.consent_data_use === "true"}
                onCheckedChange={(checked) => onConsentChange(!!checked)}
              />
              <Label
                htmlFor="consent_data_use"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to the collection, use, and storage of this financial information as required by law.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Trustee Declaration Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signature className="h-5 w-5" />
            Trustee Declaration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="trustee_comments">Trustee Comments</Label>
            <Textarea
              id="trustee_comments"
              name="trustee_comments"
              placeholder="Enter any relevant comments or notes"
              value={formData.trustee_comments || ""}
              onChange={onChange}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
