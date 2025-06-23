
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeepSeekAnalysisRequest {
  documentId: string;
  documentText: string;
  formHint?: string;
  analysisType: 'comprehensive' | 'risk_assessment' | 'field_extraction';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const {
      documentId,
      documentText,
      formHint,
      analysisType
    }: DeepSeekAnalysisRequest = await req.json();

    console.log('DeepSeek analysis request:', { documentId, analysisType, formHint });

    // Enhanced DeepSeek prompt for BIA forms analysis
    const systemPrompt = `You are SecureFiles AI, the most advanced bankruptcy and insolvency document analysis system in Canada. You specialize in analyzing all 96 BIA (Bankruptcy and Insolvency Act) forms with expert-level knowledge of OSB (Office of the Superintendent of Bankruptcy) regulations.

CORE CAPABILITIES:
1. Form Recognition: Identify exact BIA form numbers (1-96) and types
2. Field Extraction: Extract ALL required fields with perfect accuracy
3. Risk Assessment: Identify compliance gaps, missing signatures, deadline risks
4. BIA Compliance: Validate against current Canadian bankruptcy law
5. Client Intelligence: Extract debtor/client information consistently

RESPONSE FORMAT - Always return valid JSON:`;

    const analysisPrompt = `
Analyze this ${formHint || 'bankruptcy'} document with maximum precision:

DOCUMENT TEXT:
${documentText}

Required JSON Response:
{
  "documentId": "${documentId}",
  "formIdentification": {
    "formNumber": "detected_form_number",
    "formType": "detected_form_type", 
    "confidence": 95,
    "category": "bankruptcy|proposal|creditor|court|financial"
  },
  "clientExtraction": {
    "debtorName": "extracted_full_name",
    "estateNumber": "bankruptcy_estate_number",
    "trusteeName": "assigned_trustee",
    "courtDistrict": "court_jurisdiction",
    "filingDate": "YYYY-MM-DD"
  },
  "fieldExtraction": {
    "requiredFields": {
      "field_name": "extracted_value"
    },
    "optionalFields": {
      "field_name": "extracted_value"
    },
    "missingFields": ["list_of_missing_required_fields"],
    "completionPercentage": 85
  },
  "riskAssessment": {
    "overallRisk": "high|medium|low",
    "riskFactors": [
      {
        "type": "missing_signature|incomplete_field|deadline_risk|compliance_gap",
        "severity": "high|medium|low", 
        "description": "detailed_issue_description",
        "recommendation": "specific_corrective_action",
        "biaReference": "BIA_section_or_regulation",
        "fieldLocation": "page_or_section_reference",
        "deadline": "YYYY-MM-DD_if_applicable"
      }
    ],
    "complianceStatus": {
      "biaCompliant": true,
      "osbCompliant": true,
      "criticalIssues": ["list_critical_compliance_failures"],
      "warningIssues": ["list_warning_level_issues"]
    }
  },
  "metadata": {
    "analysisConfidence": 95,
    "processingTime": "timestamp",
    "requiresManualReview": false,
    "suggestedActions": ["list_of_recommended_next_steps"]
  },
  "deepseekReasoning": "Detailed explanation of analysis methodology and conclusions"
}

CRITICAL: Focus on BIA forms 1-96 expertise. Be extremely precise with form identification and regulatory compliance.`;

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`);
    }

    const deepseekData = await deepseekResponse.json();
    const analysisContent = deepseekData.choices[0].message.content;
    const reasoning = deepseekData.choices[0].message.reasoning || 'Analysis completed';

    console.log('DeepSeek response received, parsing...');

    // Parse and validate DeepSeek response
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisContent);
      analysisResult.deepseekReasoning = reasoning;
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', parseError);
      throw new Error('Invalid response format from DeepSeek');
    }

    // Store analysis results in database
    await supabaseClient
      .from('document_analysis')
      .upsert({
        document_id: documentId,
        content: JSON.stringify(analysisResult),
        form_type: analysisResult.formIdentification?.formType,
        form_number: analysisResult.formIdentification?.formNumber,
        confidence_score: analysisResult.formIdentification?.confidence / 100,
        client_name: analysisResult.clientExtraction?.debtorName,
        estate_number: analysisResult.clientExtraction?.estateNumber,
        risk_level: analysisResult.riskAssessment?.overallRisk,
        updated_at: new Date().toISOString()
      });

    // Store individual risk assessments for task creation
    if (analysisResult.riskAssessment?.riskFactors?.length > 0) {
      for (const risk of analysisResult.riskAssessment.riskFactors) {
        await supabaseClient
          .from('osb_risk_assessments')
          .insert({
            analysis_id: documentId,
            risk_type: risk.type,
            severity: risk.severity,
            description: risk.description,
            suggested_action: risk.recommendation,
            regulation_reference: risk.biaReference,
            field_location: risk.fieldLocation,
            deadline_impact: !!risk.deadline,
            created_at: new Date().toISOString()
          });
      }
    }

    // Update document metadata with DeepSeek results
    await supabaseClient
      .from('documents')
      .update({
        ai_processing_status: 'complete',
        ai_confidence_score: analysisResult.formIdentification?.confidence / 100,
        metadata: {
          deepseek_analysis: true,
          form_type: analysisResult.formIdentification?.formType,
          form_number: analysisResult.formIdentification?.formNumber,
          client_name: analysisResult.clientExtraction?.debtorName,
          estate_number: analysisResult.clientExtraction?.estateNumber,
          trustee_name: analysisResult.clientExtraction?.trusteeName,
          risk_level: analysisResult.riskAssessment?.overallRisk,
          completion_percentage: analysisResult.fieldExtraction?.completionPercentage,
          analyzed_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    console.log('DeepSeek analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        reasoning: reasoning,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('DeepSeek document analysis error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
