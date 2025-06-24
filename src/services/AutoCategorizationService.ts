
import { supabase } from '@/lib/supabase';
import { DeepSeekAnalysisResult } from './DeepSeekCoreService';
import { toast } from 'sonner';

export class AutoCategorizationService {
  static async handleAutoCategorization(documentId: string, analysis: DeepSeekAnalysisResult): Promise<void> {
    try {
      if (!analysis.clientExtraction?.debtorName || !analysis.formIdentification?.formType) {
        console.log('Insufficient data for auto-categorization');
        return;
      }

      // Create client folder structure
      const clientName = analysis.clientExtraction.debtorName;
      const formType = analysis.formIdentification.formType;
      const formNumber = analysis.formIdentification.formNumber;

      // Check if client folder exists
      let { data: clientFolder } = await supabase
        .from('documents')
        .select('id')
        .eq('title', clientName)
        .eq('is_folder', true)
        .eq('folder_type', 'client')
        .single();

      // Create client folder if it doesn't exist
      if (!clientFolder) {
        const { data: newClientFolder, error: clientError } = await supabase
          .from('documents')
          .insert({
            title: clientName,
            is_folder: true,
            folder_type: 'client',
            metadata: {
              client_name: clientName,
              estate_number: analysis.clientExtraction.estateNumber,
              auto_created: true,
              created_at: new Date().toISOString()
            }
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Failed to create client folder:', clientError);
          return;
        }
        clientFolder = newClientFolder;
      }

      // Create form type subfolder
      const formFolderName = `${formNumber} - ${formType}`;
      let { data: formFolder } = await supabase
        .from('documents')
        .select('id')
        .eq('title', formFolderName)
        .eq('parent_folder_id', clientFolder.id)
        .eq('is_folder', true)
        .single();

      if (!formFolder) {
        const { data: newFormFolder, error: formError } = await supabase
          .from('documents')
          .insert({
            title: formFolderName,
            is_folder: true,
            folder_type: 'form',
            parent_folder_id: clientFolder.id,
            metadata: {
              form_number: formNumber,
              form_type: formType,
              auto_created: true
            }
          })
          .select('id')
          .single();

        if (formError) {
          console.error('Failed to create form folder:', formError);
          return;
        }
        formFolder = newFormFolder;
      }

      // Move document to appropriate folder
      const { error: moveError } = await supabase
        .from('documents')
        .update({
          parent_folder_id: formFolder.id,
          metadata: {
            auto_categorized: true,
            categorized_at: new Date().toISOString(),
            client_name: clientName,
            form_type: formType,
            form_number: formNumber,
            estate_number: analysis.clientExtraction.estateNumber
          }
        })
        .eq('id', documentId);

      if (moveError) {
        console.error('Failed to move document:', moveError);
        return;
      }

      toast.success(`Document auto-categorized under ${clientName}/${formFolderName}`);

    } catch (error) {
      console.error('Auto-categorization failed:', error);
    }
  }
}
