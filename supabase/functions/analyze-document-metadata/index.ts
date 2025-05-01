
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, content } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call DeepSeek to extract metadata
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Extract key metadata from the document. Focus on:
              - Client name and role (e.g., bankrupt, creditor)
              - Document type and form number
              - Key dates
              Return as JSON with confidence scores.`
          },
          { role: 'user', content }
        ],
      }),
    });

    const aiResult = await deepseekResponse.json();
    const extractedMetadata = JSON.parse(aiResult.choices[0].message.content);
    
    // Calculate overall confidence score
    const confidenceScores = extractedMetadata.confidence_scores || {};
    const avgConfidence = Object.values(confidenceScores).reduce((a: number, b: number) => a + b, 0) / 
                         Object.values(confidenceScores).length;

    // Update document metadata
    const { error: metadataError } = await supabase
      .from('document_metadata')
      .insert({
        document_id: documentId,
        extracted_metadata: extractedMetadata,
        confidence_scores: confidenceScores,
      });

    if (metadataError) throw metadataError;

    // Update document status and confidence score
    const { error: documentError } = await supabase
      .from('documents')
      .update({
        ai_processing_status: 'completed',
        ai_confidence_score: avgConfidence,
        folder_type: avgConfidence > 0.8 ? extractedMetadata.document_type : 'uncategorized'
      })
      .eq('id', documentId);

    if (documentError) throw documentError;

    // Create/Update folder structure
    if (avgConfidence > 0.8 && extractedMetadata.client_name) {
      // Check if client folder exists
      const { data: existingFolder } = await supabase
        .from('documents')
        .select('id')
        .eq('is_folder', true)
        .eq('title', extractedMetadata.client_name)
        .single();

      let folderId;
      if (!existingFolder) {
        // Create new client folder
        const { data: newFolder, error: folderError } = await supabase
          .from('documents')
          .insert({
            title: extractedMetadata.client_name,
            is_folder: true,
            folder_type: 'client'
          })
          .select()
          .single();

        if (folderError) throw folderError;
        folderId = newFolder.id;
      } else {
        folderId = existingFolder.id;
      }

      // Update document's parent folder
      const { error: updateError } = await supabase
        .from('documents')
        .update({ parent_folder_id: folderId })
        .eq('id', documentId);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, metadata: extractedMetadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
