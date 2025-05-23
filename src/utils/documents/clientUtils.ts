
import { supabase } from '@/lib/supabase';
import { safeStringCast } from '@/utils/typeGuards';

interface ClientExtractionResult {
  success: boolean;
  clientName?: string;
  estateNumber?: string;
  error?: string;
}

export const extractClientFromDocument = async (
  documentId: string
): Promise<ClientExtractionResult> => {
  try {
    // Get document analysis
    const { data: analysis, error } = await supabase
      .from('document_analysis')
      .select('content')
      .eq('document_id', documentId)
      .single();

    if (error || !analysis) {
      return {
        success: false,
        error: 'No analysis found for document'
      };
    }

    const content = analysis.content as any;
    if (!content || typeof content !== 'object') {
      return {
        success: false,
        error: 'Invalid analysis content'
      };
    }

    // Extract client information safely
    const extractedInfo = content.extracted_info || {};
    const clientName = safeStringCast(extractedInfo.client_name || extractedInfo.debtor_name || '');
    const estateNumber = safeStringCast(extractedInfo.estate_number || '');

    if (!clientName) {
      return {
        success: false,
        error: 'No client name found in analysis'
      };
    }

    return {
      success: true,
      clientName,
      estateNumber
    };

  } catch (error) {
    console.error('Error extracting client from document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const createClientFromExtraction = async (
  clientName: string,
  estateNumber?: string
): Promise<{ success: boolean; clientId?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if client already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('name', clientName)
      .eq('user_id', user.id)
      .single();

    if (existingClient) {
      return {
        success: true,
        clientId: safeStringCast(existingClient.id)
      };
    }

    // Create new client
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        name: clientName,
        user_id: user.id,
        status: 'active',
        estate_number: estateNumber || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }

    return {
      success: true,
      clientId: safeStringCast(newClient?.id)
    };

  } catch (error) {
    console.error('Error creating client from extraction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const extractClientName = (document: any): string => {
  try {
    const metadata = document?.metadata || {};
    
    // Try various metadata fields
    const clientName = metadata.client_name || 
                      metadata.clientName || 
                      metadata.debtor_name || 
                      metadata.debtorName ||
                      document.title?.match(/client[:\s]+([^,\n]+)/i)?.[1] ||
                      '';

    return safeStringCast(clientName).trim();
  } catch (error) {
    console.error('Error extracting client name:', error);
    return '';
  }
};

export const standardizeClientName = (name: string): string => {
  try {
    if (!name) return '';
    
    // Basic standardization
    return name.trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } catch (error) {
    console.error('Error standardizing client name:', error);
    return name;
  }
};

export const getOrCreateClientRecord = async (clientName: string) => {
  try {
    const standardizedName = standardizeClientName(clientName);
    if (!standardizedName) {
      throw new Error('Invalid client name');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if client exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('name', standardizedName)
      .single();

    if (existingClient) {
      return { success: true, client: existingClient };
    }

    // Create new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name: standardizedName,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;

    return { success: true, client: newClient };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
