
import { supabase } from '@/lib/supabase';
import { OSBFormAnalysis } from '@/types/osb-analysis';

export class OSBDocumentService {
  /**
   * Get analysis by ID with related data
   */
  static async getAnalysisById(id: string): Promise<OSBFormAnalysis | null> {
    const { data, error } = await supabase
      .from('osb_form_analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as OSBFormAnalysis;
  }

  /**
   * Get analyses by form number
   */
  static async getAnalysesByForm(formNumber: string, limit = 50): Promise<OSBFormAnalysis[]> {
    const { data, error } = await supabase
      .from('osb_form_analyses')
      .select('*')
      .eq('form_number', formNumber)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as OSBFormAnalysis[];
  }

  /**
   * Get high-risk analyses
   */
  static async getHighRiskAnalyses(limit = 100): Promise<OSBFormAnalysis[]> {
    const { data, error } = await supabase
      .from('osb_form_analyses')
      .select('*')
      .eq('overall_risk_level', 'high')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as OSBFormAnalysis[];
  }

  /**
   * Get OSB forms reference data
   */
  static async getOSBFormsReference(): Promise<any[]> {
    const { data, error } = await supabase
      .from('osb_forms_reference')
      .select('*')
      .eq('is_active', true)
      .order('form_number');

    if (error) throw error;
    return data || [];
  }
}
