
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "./FormField";
import { IncomeExpenseData } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Signature } from "lucide-react";
import { ViewModeFormField } from "./ViewModeFormField";
import { DocuSignIntegration } from "./DocuSignIntegration";

interface SignatureConsentSectionProps {
  formData: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onConsentChange: (checked: boolean) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
  clientName?: string;
}

export const SignatureConsentSection = ({
  formData,
  onChange,
  onConsentChange,
  isViewMode = false,
  isFieldEditable = () => false,
  onToggleFieldEdit = () => {},
  clientName = "",
}: SignatureConsentSectionProps) => {
  const [useDocuSign, setUseDocuSign] = useState(false);

  // Handle DocuSign completion
  const handleSignatureComplete = (signatureData: { name: string; date: string }) => {
    const nameEvent = {
      target: {
        name: 'electronic_signature',
        value: signatureData.name
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    const dateEvent = {
      target: {
        name: 'verification_date',
        value: signatureData.date
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(nameEvent);
    onChange(dateEvent);
    
    // Also set consent to true
    onConsentChange(true);
    
    // Turn off DocuSign mode
    setUseDocuSign(false);
  };

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
          {isViewMode ? (
            <>
              <ViewModeFormField
                id="electronic_signature"
                name="electronic_signature"
                label="Debtor's Signature"
                value={formData.electronic_signature || ""}
                onChange={onChange}
                isEditable={isFieldEditable('electronic_signature')}
                onToggleEdit={() => onToggleFieldEdit('electronic_signature')}
                placeholder="Type your full name to sign"
                tooltip="Electronic signature - type your full legal name"
                required
              />
              
              <ViewModeFormField
                id="verification_date"
                name="verification_date"
                label="Date Signed"
                value={formData.verification_date || ""}
                onChange={onChange}
                isEditable={isFieldEditable('verification_date')}
                onToggleEdit={() => onToggleFieldEdit('verification_date')}
                type="date"
                required
              />
            </>
          ) : (
            <>
              {useDocuSign ? (
                <DocuSignIntegration 
                  clientName={clientName || formData.full_name || "Client"}
                  formId={formData.id || "new"}
                  onSignatureComplete={handleSignatureComplete}
                />
              ) : (
                <>
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
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setUseDocuSign(true)}
                      className="text-primary underline text-sm"
                    >
                      Use DocuSign Instead
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_data_use"
                checked={formData.consent_data_use === "true"}
                onCheckedChange={(checked) => onConsentChange(!!checked)}
                disabled={isViewMode && !isFieldEditable('consent_data_use')}
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
          {isViewMode ? (
            <ViewModeFormField
              id="trustee_comments"
              name="trustee_comments"
              label="Trustee Comments"
              value={formData.trustee_comments || ""}
              onChange={onChange}
              isEditable={isFieldEditable('trustee_comments')}
              onToggleEdit={() => onToggleFieldEdit('trustee_comments')}
              placeholder="Enter any relevant comments or notes"
              isMultiline={true}
            />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </>
  );
};
