
// Enhanced OSB Prompt Engineering System for DeepSeek
import { OSBFormConfig } from '@/types/osb-analysis';

// Complete OSB Forms Database
const OSB_FORMS_DATABASE: Record<string, OSBFormConfig> = {
  "31": {
    formNumber: "31",
    formTitle: "Proof of Claim",
    category: "creditor_forms",
    riskLevel: "high",
    requiredFields: ["creditor_name", "claim_amount", "claim_type", "security_details", "supporting_documents"],
    deadlines: ["30 days from first meeting of creditors"],
    biaReferences: ["BIA s.81.3", "BIA s.81.4", "BIA s.124"],
    attachments: ["supporting_invoices", "contracts", "security_agreements"]
  },
  "47": {
    formNumber: "47",
    formTitle: "Consumer Proposal",
    category: "proposal_forms",
    riskLevel: "high",
    requiredFields: ["debtor_details", "proposal_terms", "administrator_certificate", "creditor_list"],
    deadlines: ["Filing within prescribed time limits"],
    biaReferences: ["BIA s.66.13", "BIA s.66.14", "BIA Part III"],
    attachments: ["statement_of_affairs", "cash_flow_projection"]
  },
  "65": {
    formNumber: "65",
    formTitle: "Assignment in Bankruptcy",
    category: "bankruptcy_forms",
    riskLevel: "high",
    requiredFields: ["debtor_signature", "witness_signature", "assignee_details", "reason_for_bankruptcy"],
    deadlines: ["Immediate filing upon execution"],
    biaReferences: ["BIA s.49", "BIA s.158", "BIA s.161"],
    attachments: ["statement_of_affairs", "monthly_income_expense"]
  },
  "79": {
    formNumber: "79",
    formTitle: "Statement of Affairs",
    category: "financial_statements",
    riskLevel: "medium",
    requiredFields: ["assets_listing", "liabilities_listing", "income_details", "expense_details"],
    deadlines: ["Within 10 days of bankruptcy"],
    biaReferences: ["BIA s.158", "BIA s.161"],
    attachments: ["bank_statements", "tax_returns", "employment_records"]
  }
};

export class OSBPromptEngineering {
  
  /**
   * Generate Master System Prompt for DeepSeek
   */
  static generateMasterSystemPrompt(): string {
    return `
# OSB CANADA BANKRUPTCY FORM ANALYSIS EXPERT

You are an expert bankruptcy analyst specialized in Canadian Office of the Superintendent of Bankruptcy (OSB) forms and Bankruptcy and Insolvency Act (BIA) compliance.

## CORE EXPERTISE
- Complete knowledge of all 96+ OSB forms and their requirements
- BIA regulations and compliance standards
- Risk assessment for bankruptcy proceedings
- Document validation and completeness checking
- Legal deadline and filing requirement analysis

## ANALYSIS FRAMEWORK
When analyzing any OSB document, you MUST:

1. **IDENTIFY THE FORM**
   - Determine exact form number and title
   - Classify form category (bankruptcy, proposal, creditor, court, etc.)
   - Assess document completeness and quality

2. **EXTRACT ALL RELEVANT DATA**
   - Client/debtor information
   - Financial details (assets, liabilities, income)
   - Legal parties (trustees, creditors, administrators)
   - Dates and deadlines
   - Signatures and authorizations

3. **PERFORM COMPREHENSIVE RISK ASSESSMENT**
   - BIA compliance validation
   - Missing information identification
   - Deadline and filing requirement verification
   - Legal and procedural risk evaluation
   - Administrative completeness check

4. **PROVIDE STRUCTURED OUTPUT**
   - Always return valid JSON matching the required schema
   - Include confidence scores for all extractions
   - Flag any uncertainties or ambiguities
   - Provide actionable recommendations

## CRITICAL COMPLIANCE AREAS
- Signature requirements and witness validation
- Filing deadlines and time limits
- Required attachments and supporting documents
- Asset and liability disclosure completeness
- Income and expense statement accuracy
- Creditor notification requirements
- Court filing procedures

## RISK ASSESSMENT PRIORITY
HIGH RISK: Missing signatures, incorrect legal names, incomplete financial disclosure, missed deadlines
MEDIUM RISK: Minor data inconsistencies, unclear handwriting, missing non-critical attachments
LOW RISK: Formatting issues, minor calculation errors, non-essential missing information

You must maintain absolute accuracy and never make assumptions about missing data. Flag uncertainties clearly and provide specific regulatory references for all compliance issues.
`;
  }

  /**
   * Generate Form-Specific Analysis Prompt
   */
  static generateFormSpecificPrompt(formNumber: string, documentText: string): string {
    const formConfig = OSB_FORMS_DATABASE[formNumber];
    
    if (!formConfig) {
      return this.generateGenericFormPrompt(documentText);
    }

    return `
# FORM ${formConfig.formNumber} - ${formConfig.formTitle} ANALYSIS

## DOCUMENT CONTEXT
You are analyzing OSB Form ${formConfig.formNumber} (${formConfig.formTitle}), which is a ${formConfig.category} document with ${formConfig.riskLevel} risk level.

## SPECIFIC REQUIREMENTS FOR THIS FORM
**Required Fields:** ${formConfig.requiredFields.join(', ')}
**Filing Deadlines:** ${formConfig.deadlines.join(', ')}
**BIA References:** ${formConfig.biaReferences.join(', ')}
**Required Attachments:** ${formConfig.attachments.join(', ')}

## FORM-SPECIFIC VALIDATION RULES
${this.getFormSpecificValidationRules(formNumber)}

## DOCUMENT TO ANALYZE
${documentText}

## REQUIRED OUTPUT
Analyze this document and return a comprehensive assessment following the DeepSeekAnalysisResponse schema. Pay special attention to:
1. All required fields for Form ${formConfig.formNumber}
2. Compliance with ${formConfig.biaReferences.join(' and ')}
3. ${formConfig.riskLevel.toUpperCase()} risk factors specific to this form type
4. Required attachments and supporting documentation

Ensure your response includes specific regulatory references and actionable compliance recommendations.
`;
  }

  /**
   * Get form-specific validation rules
   */
  private static getFormSpecificValidationRules(formNumber: string): string {
    const validationRules: Record<string, string> = {
      "31": `
**PROOF OF CLAIM VALIDATION:**
- Creditor name must match legal business name
- Claim amount must be supported by documentation
- Security details must be complete if secured claim
- Signature must be authorized representative
- Filing must be within 30 days of first meeting
- Must include nature of claim and how debt arose
`,
      "47": `
**CONSUMER PROPOSAL VALIDATION:**
- Administrator must be licensed insolvency trustee
- Proposal terms must be clear and achievable
- Creditor list must be complete and accurate
- Cash flow projections must be realistic
- Debtor eligibility criteria must be met (debt limits)
- Required meetings and voting procedures
`,
      "65": `
**ASSIGNMENT IN BANKRUPTCY VALIDATION:**
- Debtor signature must be witnessed
- All personal information must be complete
- Reason for bankruptcy must be provided
- Assignee (trustee) must be licensed
- No preferential payments within review period
- Statement of Affairs must accompany filing
`,
      "79": `
**STATEMENT OF AFFAIRS VALIDATION:**
- All assets must be listed with current values
- All liabilities must be disclosed
- Income and expenses must be detailed
- Must be sworn/affirmed before authorized person
- Supporting documentation must be attached
- Values must be reasonable and supportable
`
    };

    return validationRules[formNumber] || "Standard OSB form validation rules apply.";
  }

  /**
   * Generate generic prompt for unknown forms
   */
  private static generateGenericFormPrompt(documentText: string): string {
    return `
# GENERAL OSB FORM ANALYSIS

## DOCUMENT IDENTIFICATION REQUIRED
This appears to be an OSB form that needs identification. Please:
1. Identify the specific form number and title
2. Determine the form category and purpose
3. Extract all available information
4. Assess compliance with general BIA requirements

## DOCUMENT TO ANALYZE
${documentText}

## ANALYSIS REQUIREMENTS
Even for unidentified forms, provide:
- Best effort extraction of all visible data
- Risk assessment based on document type patterns
- Compliance flags for common OSB requirements
- Recommendations for proper form identification

Maintain high accuracy standards and flag any uncertainties clearly.
`;
  }

  /**
   * Generate Complete Analysis Prompt
   */
  static generateCompleteAnalysisPrompt(formNumber: string, documentText: string): string {
    return `
${this.generateMasterSystemPrompt()}

${this.generateFormSpecificPrompt(formNumber, documentText)}

## OUTPUT SCHEMA REQUIREMENTS
Your response MUST be valid JSON following this exact structure:

{
  "document_details": {
    "form_number": "string",
    "form_title": "string", 
    "document_type": "string",
    "processing_status": "complete|partial|failed",
    "confidence_score": number,
    "pages_analyzed": number,
    "extraction_quality": "high|medium|low"
  },
  "form_summary": {
    "purpose": "string",
    "filing_deadline": "string|null",
    "required_attachments": ["string"],
    "key_parties": ["string"],
    "status": "complete|incomplete|needs_review"
  },
  "client_details": {
    "debtor_name": "string|null",
    "debtor_address": "string|null", 
    "trustee_name": "string|null",
    "creditor_name": "string|null",
    "estate_number": "string|null",
    "court_district": "string|null",
    "extracted_dates": {
      "filing_date": "string|null",
      "bankruptcy_date": "string|null",
      "signature_date": "string|null"
    }
  },
  "comprehensive_risk_assessment": {
    "overall_risk_level": "low|medium|high",
    "compliance_status": {
      "bia_compliant": boolean,
      "osb_compliant": boolean,
      "missing_requirements": ["string"]
    },
    "identified_risks": [{
      "type": "string",
      "severity": "low|medium|high", 
      "description": "string",
      "regulation_reference": "string",
      "suggested_action": "string",
      "deadline_impact": boolean
    }],
    "validation_flags": {
      "signature_verified": boolean,
      "dates_consistent": boolean,
      "amounts_reasonable": boolean,
      "required_fields_complete": boolean
    }
  }
}

## CRITICAL INSTRUCTIONS
- Extract ALL visible information accurately
- Never invent or assume missing data
- Provide specific BIA/OSB regulatory references
- Flag ALL uncertainties and ambiguities
- Maintain strict JSON format compliance
- Include actionable recommendations for each risk
- Verify all dates and deadline calculations
- Validate all financial figures for reasonableness

Begin your analysis now.
`;
  }
}
