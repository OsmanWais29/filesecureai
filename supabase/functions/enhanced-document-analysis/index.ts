
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  documentId: string;
  documentTitle: string;
  documentMetadata: any;
  storagePath: string;
  analysisOptions: {
    includeRiskAssessment: boolean;
    includeComplianceCheck: boolean;
    generateTasks: boolean;
    customPrompt?: string;
    deepAnalysis: boolean;
    biaCompliance: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const {
      documentId,
      documentTitle,
      documentMetadata,
      storagePath,
      analysisOptions
    }: AnalysisRequest = await req.json();

    console.log('Enhanced document analysis request:', documentId);

    // Download document content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(storagePath);

    if (downloadError) {
      throw new Error(`Failed to download document: ${downloadError.message}`);
    }

    // Extract text from document
    const documentText = await fileData.text();

    // Create comprehensive DeepSeek prompt for BIA form analysis
    const analysisPrompt = `
# ENHANCED BIA DOCUMENT ANALYSIS SYSTEM

You are a specialized AI expert in Canadian Bankruptcy and Insolvency Act (BIA) compliance and Office of the Superintendent of Bankruptcy (OSB) regulations. Perform comprehensive analysis of the provided document.

## DOCUMENT DETAILS
- Document ID: ${documentId}
- Title: ${documentTitle}
- Metadata: ${JSON.stringify(documentMetadata, null, 2)}

## ANALYSIS REQUIREMENTS

### 1. FORM IDENTIFICATION & CLASSIFICATION
- Identify exact BIA form number and type
- Classify document category (bankruptcy, proposal, creditor, court, etc.)
- Determine processing priority based on form type
- Assess document completeness and quality

### 2. FIELD EXTRACTION & VALIDATION
- Extract ALL relevant fields specific to the identified form
- Validate field formats and completeness
- Cross-reference required vs. optional fields
- Identify missing or incomplete information

### 3. COMPREHENSIVE RISK ASSESSMENT
- Analyze BIA compliance risks
- Identify missing signatures, dates, or authorizations
- Flag inconsistent or suspicious data
- Assess deadline compliance risks
- Evaluate regulatory compliance gaps

### 4. COMPLIANCE VALIDATION
- Verify BIA section compliance
- Check OSB regulatory requirements
- Validate filing deadlines and timelines
- Assess legal sufficiency of documentation

### 5. INTELLIGENT RECOMMENDATIONS
- Provide specific corrective actions
- Suggest process improvements
- Recommend follow-up tasks
- Identify automation opportunities

## DOCUMENT CONTENT
${documentText}

## REQUIRED JSON RESPONSE FORMAT
{
  "documentId": "${documentId}",
  "formType": "detected_form_type",
  "formNumber": "detected_form_number",
  "confidence": 95,
  "extractedFields": {
    "debtor_name": "extracted_value",
    "case_number": "extracted_value",
    "filing_date": "extracted_value",
    "trustee_name": "extracted_value",
    "amounts": {},
    "signatures": {},
    "dates": {}
  },
  "riskAssessment": {
    "overallRisk": "high|medium|low",
    "riskFactors": [
      {
        "type": "compliance|signature|deadline|data_quality",
        "severity": "high|medium|low",
        "description": "detailed_description",
        "recommendation": "specific_action_required",
        "biaReference": "BIA_section_reference"
      }
    ],
    "criticalIssues": ["list_of_critical_issues"],
    "complianceGaps": ["list_of_compliance_gaps"],
    "deadlineRisks": [
      {
        "type": "filing_deadline",
        "deadline": "2024-12-31",
        "daysRemaining": 30,
        "priority": "high"
      }
    ]
  },
  "complianceStatus": {
    "biaCompliant": true,
    "osbCompliant": true,
    "missingFields": ["list_of_missing_fields"],
    "invalidData": ["list_of_invalid_data"],
    "signatureIssues": ["list_of_signature_issues"]
  },
  "recommendations": [
    "specific_actionable_recommendations"
  ],
  "processingSteps": [
    {
      "step": "document_parsing",
      "status": "completed",
      "details": "step_details",
      "confidence": 95
    }
  ],
  "deepseekReasoning": "detailed_reasoning_explanation"
}

Analyze the document thoroughly and provide comprehensive, actionable insights for BIA compliance.
`;

    // Call DeepSeek API for enhanced analysis
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
            content: 'You are an expert BIA compliance analyst with deep knowledge of Canadian bankruptcy law and OSB regulations. Always provide detailed, accurate analysis with specific regulatory references.'
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
    const reasoning = deepseekData.choices[0].message.reasoning || 'Enhanced BIA analysis completed';

    console.log('DeepSeek analysis completed successfully');

    // Parse the analysis result
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisContent);
      analysisResult.deepseekReasoning = reasoning;
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', parseError);
      // Fallback analysis structure
      analysisResult = {
        documentId,
        formType: 'unknown',
        formNumber: 'unknown',
        confidence: 50,
        extractedFields: {},
        riskAssessment: {
          overallRisk: 'medium',
          riskFactors: [],
          criticalIssues: ['Analysis parsing failed'],
          complianceGaps: [],
          deadlineRisks: []
        },
        complianceStatus: {
          biaCompliant: false,
          osbCompliant: false,
          missingFields: [],
          invalidData: [],
          signatureIssues: []
        },
        recommendations: ['Re-analyze document with manual review'],
        processingSteps: [
          {
            step: 'analysis_parsing',
            status: 'failed',
            details: 'Failed to parse DeepSeek analysis response',
            confidence: 0
          }
        ],
        deepseekReasoning: 'Analysis parsing failed - manual review required'
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        reasoning: reasoning,
        processing_time: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Enhanced document analysis error:', error);
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
