
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

    const { action, notification, userId } = await req.json();

    if (action === 'create') {
      // Create a new notification - ensure we use correct field names from DB schema
      // The `type` field is required by DB schema, but category is stored in metadata
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info', // Required field for the database schema
          priority: notification.priority || 'normal',
          action_url: notification.action_url,
          icon: notification.icon,
          // Store the category in metadata since it's not a direct column
          metadata: {
            ...(notification.metadata || {}),
            category: notification.category || 'file_activity'
          }
        })
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, notification: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'markRead') {
      // Mark notification(s) as read
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .in('id', notification.ids);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deleteAll') {
      // Delete all notifications for a user
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'folderRecommendation') {
      // Create a notification for folder recommendation
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Folder Recommendation',
          message: notification.message || 'AI has suggested a folder for your document',
          type: 'info',
          priority: 'normal',
          action_url: notification.action_url,
          icon: 'folder-tree', // Use a folder icon
          metadata: {
            category: 'file_activity',
            documentId: notification.documentId,
            recommendedFolderId: notification.recommendedFolderId,
            suggestedPath: notification.suggestedPath
          }
        })
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, notification: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'supportRequest') {
      // Create a notification for client assistance request with the client's message
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Client Assistance Request',
          message: notification.message || 'A client has requested assistance',
          type: 'support',
          priority: 'high',
          action_url: notification.action_url,
          icon: 'help-circle', // Use a help icon
          metadata: {
            category: 'client_update',
            clientId: notification.metadata?.clientId,
            clientName: notification.metadata?.clientName,
            requestTime: notification.metadata?.requestTime || new Date().toISOString()
          }
        })
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, notification: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error handling notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
