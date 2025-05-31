
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OSB Forms Database for enhanced prompting
const OSB_FORMS_DATABASE: Record<string, any> = {
  "31": {
    formNumber: "31",
    formTitle: "Proof of Claim",
    category: "creditor_forms",
    riskLevel: "high",
    requiredFields: ["creditor_name", "claim_amount", "claim_type", "security_details"],
    biaReferences: ["BIA s.81.3", "BIA s.81.4", "BIA s.124"]
  },
  "47": {
    formNumber: "47",
    formTitle: "Consumer Proposal",
    category: "proposal_forms",
    riskLevel: "high",
    requiredFields: ["debtor_details", "proposal_terms", "administrator_certificate"],
    biaReferences: ["BIA s.66.13", "BIA s.66.14", "BIA Part III"]
  },
  "65": {
    formNumber: "65",
    formTitle: "Assignment in Bankruptcy",
    category: "bankruptcy_forms",
    riskLevel: "high",
    requiredFields: ["debtor_signature", "witness_signature", "assignee_details"],
    biaReferences: ["BIA s.49", "BIA s.158", "BIA s.161"]
  }
};

function generateEnhancedPrompt(formNumber: string, documentText: string): string {
  const formConfig = OSB_FORMS_DATABASE[formNumber];
  
  const masterPrompt = `
# OSB CANADA BANKRUPTCY FORM ANALYSIS EXPERT

You are an expert bankruptcy analyst specialized in Canadian Office of the Superintendent of Bankruptcy (OSB) forms and Bankruptcy and Insolvency Act (BIA) compliance.

## CORE EXPERTISE
- Complete knowledge of all 96+ OSB forms and their requirements
- BIA regulations and compliance standards
- Risk assessment for bankruptcy proceedings
- Document validation and completeness checking

## ANALYSIS FRAMEWORK
When analyzing any OSB document, you MUST:
1. IDENTIFY THE FORM - Determine exact form number and title
2. EXTRACT ALL RELEVANT DATA - Client/debtor info, financial details, legal parties, dates
3. PERFORM COMPREHENSIVE RISK ASSESSMENT - BIA compliance, missing info, deadlines
4. PROVIDE STRUCTURED OUTPUT - Valid JSON with confidence scores

## RISK ASSESSMENT PRIORITY
HIGH RISK: Missing signatures, incorrect legal names, incomplete financial disclosure, missed deadlines
MEDIUM RISK: Minor data inconsistencies, unclear handwriting, missing non-critical attachments
LOW RISK: Formatting issues, minor calculation errors, non-essential missing information
`;

  const formSpecificPrompt = formConfig ? `
# FORM ${formConfig.formNumber} - ${formConfig.formTitle} ANALYSIS

## DOCUMENT CONTEXT
Analyzing OSB Form ${formConfig.formNumber} (${formConfig.formTitle}) - ${formConfig.riskLevel} risk level.

## SPECIFIC REQUIREMENTS
Required Fields: ${formConfig.requiredFields.join(', ')}
BIA References: ${formConfig.biaReferences.join(', ')}

## DOCUMENT TO ANALYZE
${documentText}
` : `
# GENERAL OSB FORM ANALYSIS
Document needs identification. Extract all visible data and assess compliance.

## DOCUMENT TO ANALYZE
${documentText}
`;

  return `${masterPrompt}

${formSpecificPrompt}

## OUTPUT SCHEMA REQUIREMENTS
Return valid JSON following this exact structure:

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

Extract ALL visible information accurately. Never invent missing data. Provide specific BIA/OSB regulatory references.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentText, formNumber, userId, analysisType = 'comprehensive' } = await req.json();
    
    if (!documentText) {
      throw new Error('Document text is required');
    }

    console.log(`Enhanced OSB Analysis request: Form ${formNumber || 'unknown'}, Type: ${analysisType}`);

    // Check if DeepSeek API key is available
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Generate enhanced prompt
    const prompt = generateEnhancedPrompt(formNumber || 'unknown', documentText);

    console.log('Calling DeepSeek API...');

    // Call DeepSeek API with enhanced prompt
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorText}`);
    }

    const result = await deepseekResponse.json();
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(result.choices[0].message.content);
    } catch (parseError) {
      throw new Error(`Failed to parse DeepSeek response: ${parseError.message}`);
    }

    console.log('DeepSeek analysis completed successfully');

    // Store analysis in Supabase if userId provided
    if (userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('osb_form_analyses')
        .insert({
          form_number: analysisResult.document_details.form_number,
          form_title: analysisResult.document_details.form_title,
          document_type: analysisResult.document_details.document_type,
          processing_status: analysisResult.document_details.processing_status,
          confidence_score: analysisResult.document_details.confidence_score,
          pages_analyzed: analysisResult.document_details.pages_analyzed,
          extraction_quality: analysisResult.document_details.extraction_quality,
          
          debtor_name: analysisResult.client_details.debtor_name,
          debtor_address: analysisResult.client_details.debtor_address,
          trustee_name: analysisResult.client_details.trustee_name,
          creditor_name: analysisResult.client_details.creditor_name,
          estate_number: analysisResult.client_details.estate_number,
          court_district: analysisResult.client_details.court_district,
          
          filing_date: analysisResult.client_details.extracted_dates.filing_date,
          bankruptcy_date: analysisResult.client_details.extracted_dates.bankruptcy_date,
          signature_date: analysisResult.client_details.extracted_dates.signature_date,
          
          overall_risk_level: analysisResult.comprehensive_risk_assessment.overall_risk_level,
          bia_compliant: analysisResult.comprehensive_risk_assessment.compliance_status.bia_compliant,
          osb_compliant: analysisResult.comprehensive_risk_assessment.compliance_status.osb_compliant,
          signature_verified: analysisResult.comprehensive_risk_assessment.validation_flags.signature_verified,
          dates_consistent: analysisResult.comprehensive_risk_assessment.validation_flags.dates_consistent,
          amounts_reasonable: analysisResult.comprehensive_risk_assessment.validation_flags.amounts_reasonable,
          required_fields_complete: analysisResult.comprehensive_risk_assessment.validation_flags.required_fields_complete,
          
          analysis_result: analysisResult,
          compliance_status: analysisResult.comprehensive_risk_assessment.compliance_status,
          identified_risks: analysisResult.comprehensive_risk_assessment.identified_risks,
          analyzed_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing analysis:', error);
        throw error;
      }

      // Store individual risks
      if (analysisResult.comprehensive_risk_assessment.identified_risks.length > 0) {
        const riskRecords = analysisResult.comprehensive_risk_assessment.identified_risks.map((risk: any) => ({
          analysis_id: data.id,
          risk_type: risk.type,
          severity: risk.severity,
          description: risk.description,
          regulation_reference: risk.regulation_reference,
          suggested_action: risk.suggested_action,
          deadline_impact: risk.deadline_impact
        }));

        const { error: riskError } = await supabase
          .from('osb_risk_assessments')
          .insert(riskRecords);

        if (riskError) {
          console.error('Error storing risks:', riskError);
        }
      }

      console.log(`Analysis stored with ID: ${data.id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult,
        message: 'Enhanced OSB analysis completed successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Enhanced OSB Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
