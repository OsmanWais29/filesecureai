
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
    const { tableName, data, formNumber } = await req.json();

    console.log(`Inserting data into table: ${tableName} for Form ${formNumber}`);

    if (!tableName || !data || !formNumber) {
      throw new Error('Missing required parameters: tableName, data, or formNumber');
    }

    // Sanitize table name
    const sanitizedTableName = tableName.replace(/[^a-z0-9_]/gi, '');
    if (sanitizedTableName !== tableName) {
      throw new Error('Invalid table name - contains unsafe characters');
    }

    // Verify table exists in our registry
    const { data: tableExists, error: checkError } = await supabase
      .from('dynamic_form_tables')
      .select('id')
      .eq('table_name', tableName)
      .eq('form_number', formNumber)
      .single();

    if (checkError || !tableExists) {
      throw new Error(`Table ${tableName} not found in registry or doesn't belong to Form ${formNumber}`);
    }

    // Build the INSERT SQL dynamically
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);

    const insertSQL = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`;

    console.log('Executing SQL:', insertSQL);
    console.log('With values:', values);

    // Execute the insert
    const { error: insertError } = await supabase.rpc('exec_sql_with_params', {
      sql_text: insertSQL,
      params: values
    });

    if (insertError) {
      console.error('Failed to insert data:', insertError);
      throw new Error(`Data insertion failed: ${insertError.message}`);
    }

    console.log(`Successfully inserted data into table: ${tableName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Data inserted into ${tableName} successfully`,
        tableName,
        formNumber,
        recordCount: 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in insert-form-data function:', error);
    
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
