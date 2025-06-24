
import { supabase } from '@/lib/supabase';

export class AutoCategorizationService {
  /**
   * Handle auto-categorization based on DeepSeek analysis
   */
  static async handleAutoCategorization(documentId: string, analysis: any) {
    if (!analysis.clientName || !analysis.formType) return;

    try {
      // Create client folder structure
      const { data: clientFolder, error: folderError } = await supabase
        .from('document_folders')
        .upsert({
          name: analysis.clientName,
          type: 'client',
          metadata: {
            clientName: analysis.clientName,
            estateNumber: analysis.estateNumber,
            autoCreated: true,
            createdAt: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (!folderError && clientFolder) {
        // Create form type subfolder
        const formFolderName = `${analysis.formNumber} - ${analysis.formType}`;
        const { data: formFolder } = await supabase
          .from('document_folders')
          .upsert({
            name: formFolderName,
            type: 'form',
            parent_id: clientFolder.id,
            metadata: {
              formNumber: analysis.formNumber,
              formType: analysis.formType,
              autoCreated: true
            }
          })
          .select()
          .single();

        // Move document to appropriate folder
        if (formFolder) {
          await supabase
            .from('documents')
            .update({
              parent_folder_id: formFolder.id,
              metadata: {
                autoCategorized: true,
                categorizedAt: new Date().toISOString(),
                clientName: analysis.clientName,
                formType: analysis.formType,
                formNumber: analysis.formNumber,
                estateNumber: analysis.estateNumber
              }
            })
            .eq('id', documentId);
        }
      }
    } catch (error) {
      console.error('Auto-categorization failed:', error);
    }
  }
}
