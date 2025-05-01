
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
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY') || '';
    const exaApiKey = Deno.env.get('EXA_API_KEY') || '';

    if (!supabaseUrl || !supabaseKey || !deepseekApiKey) {
      console.error("Missing required environment variables");
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request parameters
    const { documentId, message, includeRegulatory = true, includeClientExtraction = true, storagePath, title = '' } = await req.json();
    
    if (!documentId && !message && !storagePath) {
      console.error("No document ID, message, or storagePath provided");
      throw new Error('Either documentId, message, or storagePath must be provided');
    }
    
    console.log(`Processing request for document ID: ${documentId || 'N/A'}`);
    
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
        
        console.log(`Downloading document from path: ${documentPath}`);

        try {
          // Download the file
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(document.storage_path);
            
          if (downloadError) {
            console.error("Error downloading document:", downloadError);
            throw downloadError;
          }
          
          try {
            documentText = await fileData.text();
            console.log(`Successfully extracted text from document, length: ${documentText.length} characters`);
            
            // Limit text size to avoid token limits
            if (documentText.length > 100000) {
              documentText = documentText.substring(0, 100000);
              console.log("Document text truncated to 100,000 characters");
            }
          } catch (textError) {
            console.error("Error extracting text from document:", textError);
            throw textError;
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
          throw storageError;
        }
      } else {
        console.error("No storage path found for document");
        throw new Error("Document has no storage path");
      }
    }
    
    // If document text is still empty, return error
    if (!documentText || documentText.trim().length === 0) {
      console.error("No document content available");
      throw new Error('No document content available for analysis');
    }
    
    // Search EXA for BIA regulations (if API key is available)
    let biaRegulations: ExaItem[] = [];
    let regulatoryReferences = [];
    
    if (includeRegulatory && exaApiKey) {
      try {
        console.log("Querying EXA API for regulatory references");
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
          console.error(`EXA API error: ${exaResponse.status}`);
          throw new Error(`EXA API returned ${exaResponse.status}`);
        }
        
        const exaData = await exaResponse.json();
        biaRegulations = exaData.results || [];
        
        // Format regulations for DeepSeek context
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
    
    console.log("Calling DeepSeek API for document analysis");
    
    // Process document with DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt + `\n\nYou must extract information, create a comprehensive risk assessment, and check compliance with the Bankruptcy and Insolvency Act. The risk assessment should clearly describe any problems and cite specific BIA sections that may be violated. 
            
            I WANT you to return your response in JSON format as follows:
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
            content: `Please analyze the following document and provide a comprehensive analysis including extracted information, risk assessment, and regulatory compliance check in JSON format:\n\nDocument Title: ${documentTitle}\n\nDocument Content:\n${documentText}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error(`DeepSeek API error: ${deepseekResponse.status} - ${errorText}`);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorText}`);
    }
    
    const aiOutput = await deepseekResponse.json();
    const aiResponse = aiOutput.choices?.[0]?.message?.content || '{}';
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
      console.log("Successfully parsed DeepSeek response");
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", parseError);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
    
    // Add regulatory references to the response
    if (regulatoryReferences.length > 0) {
      analysisResult.exa_references = regulatoryReferences;
      console.log("Added Exa regulatory references to analysis result");
    }
    
    // Save analysis results to database if we have a document ID
    if (documentId) {
      try {
        console.log(`Saving analysis results for document ID: ${documentId}`);
        
        // Get current user for attribution
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn("No authenticated user found when saving analysis");
        }
        
        // Check if document analysis already exists
        const { data: existingAnalysis } = await supabase
          .from('document_analysis')
          .select('id')
          .eq('document_id', documentId)
          .maybeSingle();
          
        if (existingAnalysis?.id) {
          // Update existing analysis
          await supabase
            .from('document_analysis')
            .update({
              content: analysisResult,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAnalysis.id);
            
          console.log(`Updated existing analysis for document ${documentId}`);
        } else {
          // Create new analysis
          await supabase
            .from('document_analysis')
            .insert({
              document_id: documentId,
              user_id: user?.id,
              content: analysisResult
            });
            
          console.log(`Created new analysis for document ${documentId}`);
        }
        
        // Update document metadata with extracted info
        const { data: updatedDoc, error: updateError } = await supabase
          .from('documents')
          .update({
            metadata: {
              ...analysisResult.extracted_info,
              analyzed_at: new Date().toISOString(),
              has_analysis: true,
              processing_steps_completed: [
                "documentIngestion",
                "documentClassification",
                "dataExtraction",
                "riskAssessment",
                "documentOrganization",
                "analysisComplete"
              ]
            },
            ai_processing_status: 'complete'
          })
          .eq('id', documentId)
          .select('id')
          .single();
          
        console.log(`Updated document metadata for ${documentId}`);
        
        // Check if we have a client name that should be created
        if (analysisResult.extracted_info?.clientName) {
          console.log(`Checking if client exists: ${analysisResult.extracted_info.clientName}`);
          
          // Try to create client if not exists
          const { data: existingClients } = await supabase
            .from('clients')
            .select('id')
            .ilike('name', analysisResult.extracted_info.clientName)
            .limit(1);
            
          if (!existingClients || existingClients.length === 0) {
            console.log(`Creating new client: ${analysisResult.extracted_info.clientName}`);
            
            // Create new client from extracted info
            const { data: newClient, error: clientError } = await supabase
              .from('clients')
              .insert({
                name: analysisResult.extracted_info.clientName,
                email: analysisResult.extracted_info.clientEmail || null,
                phone: analysisResult.extracted_info.clientPhone || null,
                metadata: {
                  address: analysisResult.extracted_info.clientAddress || null,
                  totalDebts: analysisResult.extracted_info.totalDebts || null,
                  totalAssets: analysisResult.extracted_info.totalAssets || null
                }
              })
              .select('id')
              .single();
              
            if (clientError) {
              console.error("Error creating client:", clientError);
            } else {
              console.log(`Created new client with ID: ${newClient.id}`);
            }
          }
        }
      } catch (dbError) {
        console.error("Error saving analysis results:", dbError);
        // Continue despite DB error - we can still return results to user
      }
    }
    
    console.log("Analysis complete, returning results");
    
    // Return the analysis result
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error in process-ai-request function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
