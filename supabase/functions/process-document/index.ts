import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, documentId, signatureData, metadata, signatureType, partyType } = await req.json();

    if (action === 'sign') {
      // Determine signature type based on form type
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('metadata, title')
        .eq('id', documentId)
        .single();
        
      if (docError) throw docError;
      
      const isForm47 = document?.metadata?.formType === 'form-47' || 
                     document?.title?.toLowerCase().includes('form 47');
      
      const isForm76 = document?.metadata?.formType === 'form-76' || 
                     document?.title?.toLowerCase().includes('form 76');
      
      // Record the signature
      const { data: signature, error: signatureError } = await supabase
        .from('signatures')
        .insert({
          document_id: documentId,
          signature_data: signatureData,
          status: 'completed',
          ip_address: req.headers.get('x-forwarded-for'),
          signer_id: metadata?.userId,
        })
        .select()
        .single();

      if (signatureError) throw signatureError;
      
      // Update document metadata to track signature workflow for forms requiring signatures
      if (isForm47 || isForm76) {
        // Get current signatures from metadata
        const currentSignatures = document.metadata.signatures || [];
        const signedParties = document.metadata.signedParties || [];
        
        // Add the new signature
        currentSignatures.push({
          id: signature.id,
          type: signatureType || 'electronic',
          partyType: partyType || 'unknown',
          timestamp: new Date().toISOString()
        });
        
        // Add the signed party
        if (partyType) {
          signedParties.push(partyType);
        }
        
        // Check if all required signatures are collected
        const requiredParties = document.metadata.signaturesRequired || 
          (isForm76 ? ['debtor', 'trustee', 'witness'] : ['debtor', 'administrator', 'witness']);
        
        const allSigned = requiredParties.every(party => signedParties.includes(party));
        
        // Update the document metadata
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            metadata: {
              ...document.metadata,
              signatures: currentSignatures,
              signedParties: signedParties,
              signatureStatus: allSigned ? 'completed' : 'in_progress',
              lastSignatureDate: new Date().toISOString()
            },
            // If all parties signed, update the document status
            status: allSigned ? 'signed' : 'pending'
          })
          .eq('id', documentId);

        if (updateError) throw updateError;
        
        // Create notification for signature progress
        await supabase
          .from('notifications')
          .insert({
            title: allSigned ? 'Document Fully Signed' : 'Document Partially Signed',
            message: allSigned 
              ? `All required signatures collected for "${document.title}"`
              : `New signature (${partyType}) added to "${document.title}" - ${signedParties.length}/${requiredParties.length} signatures collected`,
            type: 'signature_update',
            priority: allSigned ? 'high' : 'normal',
            user_id: metadata?.userId,
            action_url: `/documents/${documentId}`,
            metadata: {
              documentId,
              signatureId: signature.id,
              formType: isForm76 ? 'form-76' : 'form-47',
              signatureStatus: allSigned ? 'completed' : 'in_progress',
              partyType: partyType
            }
          });
      } else {
        // Standard signature process for other document types
        const { error: documentError } = await supabase
          .from('documents')
          .update({ status: 'signed' })
          .eq('id', documentId);

        if (documentError) throw documentError;
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        document_id: documentId,
        action: 'document_signed',
        metadata: {
          signature_id: signature.id,
          ip_address: req.headers.get('x-forwarded-for'),
          timestamp: new Date().toISOString(),
          party_type: partyType
        },
      });

      return new Response(
        JSON.stringify({ 
          message: 'Document signed successfully',
          signature_id: signature.id,
          is_complete: (isForm47 || isForm76) ? 
            (document.metadata.signedParties || []).length === (document.metadata.signaturesRequired || []).length : true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'analyze') {
      // Analyze document engagement
      const { data: interactions } = await supabase
        .from('audit_logs')
        .select('action, created_at')
        .eq('document_id', documentId);

      const analysis = {
        totalInteractions: interactions?.length || 0,
        lastActivity: interactions?.[0]?.created_at || null,
        engagementScore: calculateEngagementScore(interactions || []),
      };

      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'check_signatures') {
      // Get document to check signature status
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('metadata, title')
        .eq('id', documentId)
        .single();
        
      if (docError) throw docError;
      
      const requiredParties = document.metadata.signaturesRequired || [];
      const signedParties = document.metadata.signedParties || [];
      const pendingParties = requiredParties.filter(p => !signedParties.includes(p));
      
      return new Response(
        JSON.stringify({
          required: requiredParties,
          signed: signedParties,
          pending: pendingParties,
          status: document.metadata.signatureStatus || 'pending',
          complete: signedParties.length === requiredParties.length && requiredParties.length > 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'check_deadline') {
      // Get document to check deadline status
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('metadata, deadlines, title')
        .eq('id', documentId)
        .single();
        
      if (docError) throw docError;
      
      const deadline = document.metadata.submissionDeadline;
      const now = new Date();
      const deadlineDate = deadline ? new Date(deadline) : null;
      
      // Calculate days remaining if deadline exists
      const daysRemaining = deadlineDate 
        ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
        
      // If deadline is approaching (7 days or less) and no reminder has been sent,
      // create a notification
      if (daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && !document.metadata.deadlineReminderSent) {
        // Create deadline reminder notification
        await supabase
          .from('notifications')
          .insert({
            title: 'Form 47 Deadline Approaching',
            message: `Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left to submit "${document.title}"`,
            type: 'deadline',
            priority: daysRemaining <= 3 ? 'high' : 'normal',
            action_url: `/documents/${documentId}`,
            metadata: {
              documentId,
              formType: 'form-47',
              daysRemaining,
              deadline: deadlineDate?.toISOString()
            }
          });
          
        // Update document to record that reminder was sent
        await supabase
          .from('documents')
          .update({
            metadata: {
              ...document.metadata,
              deadlineReminderSent: true,
              deadlineReminderDate: now.toISOString()
            }
          })
          .eq('id', documentId);
      }
      
      return new Response(
        JSON.stringify({
          deadline: deadlineDate?.toISOString() || null,
          daysRemaining: daysRemaining,
          status: daysRemaining !== null 
            ? daysRemaining <= 0 
              ? 'overdue' 
              : daysRemaining <= 3 
                ? 'critical' 
                : daysRemaining <= 7 
                  ? 'warning' 
                  : 'normal'
            : 'none'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateEngagementScore(interactions: any[]): number {
  if (!interactions.length) return 0;
  const now = new Date();
  const recentInteractions = interactions.filter(i => {
    const interactionDate = new Date(i.created_at);
    const daysSince = (now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30; // Consider only last 30 days
  });
  return Math.min(100, (recentInteractions.length / interactions.length) * 100);
}
