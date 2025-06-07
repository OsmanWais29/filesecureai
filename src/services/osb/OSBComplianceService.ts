
import { supabase } from '@/lib/supabase';

export class OSBComplianceService {
  /**
   * Get compliance summary
   */
  static async getComplianceSummary(dateFrom?: Date, dateTo?: Date): Promise<any> {
    let query = supabase
      .from('osb_analysis_dashboard')
      .select('*');

    if (dateFrom) {
      query = query.gte('analysis_date', dateFrom.toISOString());
    }
    if (dateTo) {
      query = query.lte('analysis_date', dateTo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Update risk resolution status
   */
  static async updateRiskResolution(
    riskId: string, 
    resolved: boolean, 
    resolutionNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('osb_risk_assessments')
      .update({
        resolved,
        resolution_notes: resolutionNotes,
      })
      .eq('id', riskId);

    if (error) throw error;
  }
}
