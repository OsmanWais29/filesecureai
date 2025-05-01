
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExaItem {
  title: string;
  url: string;
  snippet: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
    const exaApiKey = Deno.env.get('EXA_API_KEY') || '';

    if (!supabaseUrl || !supabaseKey || !openAIKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request parameters
    const { documentId, message, includeRegulatory = true, includeClientExtraction = true, storagePath, title = '' } = await req.json();
    
    if (!documentId && !message && !storagePath) {
      throw new Error('Either documentId, message, or storagePath must be provided');
    }
    
    // If we have a documentId, get the document content
    let documentText = message || '';
    let documentTitle = title || '';
    let documentFormType = '';
    let documentPath = storagePath || '';
    
    if (documentId && !documentText) {
      console.log(`Fetching document content for ID: ${documentId}`);
      
      // Get document details
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('title, metadata, storage_path')
        .eq('id', documentId)
        .single();
        
      if (docError) {
        console.error("Error fetching document:", docError);
        throw docError;
      }
      
      documentTitle = document?.title || 'Unknown Document';
      documentFormType = document?.metadata?.formType || document?.metadata?.documentType || '';
      
      // If we have storage path, download document content
      if (document?.storage_path) {
        documentPath = document.storage_path;
        
        // Download the file content
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(document.storage_path);
          
        if (downloadError) {
          console.error("Error downloading document:", downloadError);
          throw downloadError;
        }
        
        try {
          documentText = await fileData.text();
          console.log(`Successfully extracted text from document, length: ${documentText.length}`);
          
          // Limit text size to avoid token limits
          if (documentText.length > 100000) {
            documentText = documentText.substring(0, 100000);
            console.log("Document text truncated to 100,000 characters");
          }
        } catch (textError) {
          console.error("Error extracting text from document:", textError);
          throw textError;
        }
      }
    }
    
    // If document text is still empty, return error
    if (!documentText || documentText.trim().length === 0) {
      throw new Error('No document content available for analysis');
    }
    
    // Search EXA for BIA regulations (if API key is available)
    let biaRegulations: ExaItem[] = [];
    let regulatoryReferences = [];
    
    if (includeRegulatory && exaApiKey) {
      try {
        let searchTerm = "Bankruptcy and Insolvency Act compliance requirements";
        
        // Add form type if available
        if (documentFormType) {
          const formNumber = documentFormType.replace(/[^0-9]/g, '');
          if (formNumber) {
            searchTerm = `Bankruptcy and Insolvency Act Form ${formNumber} requirements compliance Canada`;
          }
        }
        
        const exaResponse = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey
          },
          body: JSON.stringify({
            query: searchTerm,
            num_results: 3,
            highlight_results: true,
            use_autoprompt: false
          })
        });
        
        if (!exaResponse.ok) {
          throw new Error(`EXA API returned ${exaResponse.status}`);
        }
        
        const exaData = await exaResponse.json();
        biaRegulations = exaData.results || [];
        
        // Format regulations for OpenAI context
        regulatoryReferences = biaRegulations.map(item => ({
          title: item.title,
          url: item.url,
          snippet: item.text || item.snippet
        }));
        
        console.log(`Found ${regulatoryReferences.length} regulatory references`);
      } catch (exaError) {
        console.error("EXA API error:", exaError);
        console.log("Continuing without EXA references");
      }
    }
    
    // Generate form-specific prompt
    let systemPrompt = "You are a Canadian licensed insolvency trustee AI assistant specialized in bankruptcy documentation. ";
    
    if (documentFormType === 'form-31' || documentTitle.toLowerCase().includes('form 31') || documentTitle.toLowerCase().includes('proof of claim')) {
      systemPrompt += "You are analyzing a Form 31 (Proof of Claim) document. Extract all key information, check for compliance issues, and create a risk assessment.";
    } else if (documentFormType === 'form-47' || documentTitle.toLowerCase().includes('form 47') || documentTitle.toLowerCase().includes('consumer proposal')) {
      systemPrompt += "You are analyzing a Form 47 (Consumer Proposal) document. Extract all key information, check for compliance issues, and create a risk assessment.";
    } else if (documentFormType === 'form-76' || documentTitle.toLowerCase().includes('form 76') || documentTitle.toLowerCase().includes('statement of affairs')) {
      systemPrompt += "You are analyzing a Form 76 (Statement of Affairs) document. Extract all key information, check for compliance issues, and create a risk assessment.";
    } else {
      systemPrompt += "You are analyzing a bankruptcy or insolvency document. Extract all key information, check for compliance issues, and create a risk assessment.";
    }
    
    // Process document with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt + `\n\nYou must extract information, create a comprehensive risk assessment, and check compliance with the Bankruptcy and Insolvency Act. The risk assessment should clearly describe any problems and cite specific BIA sections that may be violated. 
            
            I WANT you to follow this format for your response:
            {
              "extracted_info": {
                "formNumber": "Form number (e.g., 31, 47, 76)",
                "formType": "Type of form (e.g., proof-of-claim, consumer-proposal)",
                "clientName": "Name of debtor/client",
                "trusteeName": "Name of trustee",
                "dateSigned": "Date when document was signed",
                "summary": "Brief summary of the document",
                "clientAddress": "Client's address if available",
                "clientPhone": "Client's phone number if available",
                "clientEmail": "Client's email if available",
                "totalDebts": "Total debts amount if present",
                "totalAssets": "Total assets amount if present",
                "monthlyIncome": "Monthly income if present",
                "additionalFields": {
                  // Any other relevant fields extracted from the document
                }
              },
              "risks": [
                {
                  "type": "Type of risk",
                  "description": "Detailed description of the risk",
                  "severity": "high/medium/low",
                  "regulation": "Relevant BIA section or other regulation",
                  "impact": "Potential impact of this risk",
                  "requiredAction": "Required action to mitigate risk",
                  "solution": "Recommended solution",
                  "deadline": "Recommended deadline for resolution"
                }
                // Add more risk items as needed
              ],
              "regulatory_compliance": {
                "status": "compliant/non-compliant/partially-compliant",
                "details": "Explanation of compliance status",
                "references": [
                  "References to relevant laws and regulations"
                ]
              }
            }`
          },
          {
            role: 'user',
            content: `Please analyze the following document and provide a comprehensive analysis including extracted information, risk assessment, and regulatory compliance check:\n\nDocument Title: ${documentTitle}\n\nDocument Content:\n${documentText}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }
    
    const aiOutput = await openAIResponse.json();
    const aiResponse = aiOutput.choices?.[0]?.message?.content || '{}';
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
    
    // Add regulatory references to the response
    if (regulatoryReferences.length > 0) {
      analysisResult.exa_references = regulatoryReferences;
    }
    
    // If we have a document ID, save the analysis results
    if (documentId) {
      try {
        // Get current user ID
        const authHeader = req.headers.get('Authorization');
        let userId = 'system';
        
        // If we have auth header, extract user ID
        if (authHeader) {
          try {
            const token = authHeader.replace('Bearer ', '');
            const { data: userData } = await supabase.auth.getUser(token);
            if (userData?.user?.id) {
              userId = userData.user.id;
            }
          } catch (authError) {
            console.error("Error getting user ID from token:", authError);
          }
        }
        
        // Save analysis results
        await saveAnalysisResults(documentId, userId, analysisResult, supabase);
        
        // Create client record if client name is available
        if (includeClientExtraction && analysisResult.extracted_info?.clientName) {
          await createClientIfNotExists(analysisResult.extracted_info, supabase);
        }
        
        console.log(`Analysis results saved for document ${documentId}`);
      } catch (saveError) {
        console.error("Error saving analysis results:", saveError);
        // Continue anyway - we still want to return the results even if saving failed
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        response: "Document analyzed successfully",
        analysis: analysisResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-ai-request function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Helper functions
async function saveAnalysisResults(documentId: string, userId: string, analysisData: any, supabase: any) {
  // Check if document analysis already exists
  const { data: existingAnalysis } = await supabase
    .from('document_analysis')
    .select('*')
    .eq('document_id', documentId)
    .single();
    
  if (existingAnalysis) {
    // Update existing analysis
    await supabase
      .from('document_analysis')
      .update({
        content: analysisData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAnalysis.id);
  } else {
    // Create new analysis record
    await supabase
      .from('document_analysis')
      .insert([{
        document_id: documentId,
        user_id: userId,
        content: analysisData
      }]);
  }
  
  // Update document metadata with extracted information
  await supabase
    .from('documents')
    .update({
      metadata: {
        ...analysisData.extracted_info,
        analyzed_at: new Date().toISOString(),
        has_analysis: true
      },
      ai_processing_status: 'complete'
    })
    .eq('id', documentId);
}

async function createClientIfNotExists(clientInfo: any, supabase: any) {
  if (!clientInfo?.clientName) {
    return null;
  }
  
  const clientName = clientInfo.clientName.trim();
  
  // Check if client already exists
  const { data: existingClients } = await supabase
    .from('clients')
    .select('id')
    .ilike('name', clientName)
    .limit(1);
    
  // If client exists, return their ID
  if (existingClients && existingClients.length > 0) {
    return existingClients[0].id;
  }
  
  // Create new client
  const { data: newClient } = await supabase
    .from('clients')
    .insert({
      name: clientName,
      email: clientInfo.clientEmail || null,
      phone: clientInfo.clientPhone || null,
      metadata: {
        address: clientInfo.clientAddress || null,
        totalDebts: clientInfo.totalDebts || null,
        totalAssets: clientInfo.totalAssets || null,
        monthlyIncome: clientInfo.monthlyIncome || null
      }
    })
    .select('id')
    .single();
    
  return newClient?.id || null;
}
