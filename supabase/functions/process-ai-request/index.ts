
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// Function to fetch document content from Supabase storage
async function fetchDocumentContent(storagePath: string, supabaseUrl: string, supabaseKey: string) {
  try {
    console.log(`Fetching document content for: ${storagePath}`)
    
    // Create a signed URL for the document
    const signedUrlResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/documents/${encodeURIComponent(storagePath)}?expires=3600`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    )
    
    if (!signedUrlResponse.ok) {
      throw new Error(`Failed to create signed URL: ${await signedUrlResponse.text()}`)
    }
    
    const { signedURL } = await signedUrlResponse.json()
    
    // Fetch the actual document content
    const documentResponse = await fetch(signedURL)
    if (!documentResponse.ok) {
      throw new Error(`Failed to fetch document content: ${documentResponse.statusText}`)
    }
    
    // For PDF, we'll return the binary content directly
    // The calling function will need to handle this appropriately
    return await documentResponse.arrayBuffer()
  } catch (error) {
    console.error('Error fetching document content:', error)
    throw error
  }
}

// Function to analyze document using OpenAI
async function analyzeDocumentWithAI(documentText: string) {
  const openAiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openAiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  console.log('Analyzing document with OpenAI...')
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a specialized document analyzer for bankruptcy and insolvency documents. 
            Analyze the provided document and extract the following information in JSON format:
            1. Document type (form type if applicable)
            2. Client information (name, address, contact details)
            3. Key financial information
            4. Summary of the document's purpose and content
            5. Risk assessment with at least 3 specific risks, including:
               - Risk type
               - Description of the risk
               - Relevant BIA (Bankruptcy and Insolvency Act) section
               - Recommended solution
               - Severity level (high, medium, low)
            Format your response as a structured JSON object.`
          },
          {
            role: 'user',
            content: `Please analyze this document:\n${documentText}`
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const result = await response.json()
    return result.choices[0].message.content
  } catch (error) {
    console.error('Error analyzing document with OpenAI:', error)
    throw error
  }
}

// Main handler for HTTP requests
serve(async (req) => {
  // CORS headers for pre-flight requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  
  try {
    const { documentId, storagePath } = await req.json()
    
    if (!documentId || !storagePath) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: documentId and storagePath' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Processing AI request for document ID: ${documentId}, path: ${storagePath}`)
    
    // Get Supabase configuration from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!openAiKey) {
      console.error('Missing OpenAI API key')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Fetch document content
    const documentContent = await fetchDocumentContent(storagePath, supabaseUrl, supabaseKey)
    const documentText = new TextDecoder().decode(documentContent)
    
    // Process with OpenAI
    const analysisResults = await analyzeDocumentWithAI(documentText)
    
    console.log('Successfully analyzed document, saving results')
    
    // Store analysis results in the database
    const updateResult = await fetch(
      `${supabaseUrl}/rest/v1/documents?id=eq.${documentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          analysis: [
            {
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              content: typeof analysisResults === 'string' 
                ? JSON.parse(analysisResults) 
                : analysisResults
            }
          ],
          ai_processing_status: 'complete',
          updated_at: new Date().toISOString()
        })
      }
    )
    
    if (!updateResult.ok) {
      throw new Error(`Failed to update document analysis: ${await updateResult.text()}`)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document analyzed successfully',
        documentId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing document:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process document'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
