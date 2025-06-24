
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tableName, createSQL, formNumber } = await req.json();

    console.log(`Creating dynamic table: ${tableName} for Form ${formNumber}`);

    if (!tableName || !createSQL || !formNumber) {
      throw new Error('Missing required parameters: tableName, createSQL, or formNumber');
    }

    // Sanitize table name to prevent SQL injection
    const sanitizedTableName = tableName.replace(/[^a-z0-9_]/gi, '');
    if (sanitizedTableName !== tableName) {
      throw new Error('Invalid table name - contains unsafe characters');
    }

    // Execute the DDL to create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_text: createSQL
    });

    if (createError) {
      console.error('Failed to create table:', createError);
      throw new Error(`Table creation failed: ${createError.message}`);
    }

    console.log(`Successfully created table: ${tableName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dynamic table ${tableName} created successfully`,
        tableName,
        formNumber
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-dynamic-table function:', error);
    
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
