
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface FormTableSchema {
  formNumber: string;
  formTitle: string;
  fields: Array<{
    name: string;
    type: 'TEXT' | 'NUMERIC' | 'BOOLEAN' | 'DATE' | 'JSONB';
    required: boolean;
    description?: string;
  }>;
  validationRules?: Record<string, any>;
  fieldMappings?: Record<string, string>;
}

export class DynamicFormTableService {
  /**
   * Generate database table schema from DeepSeek analysis
   */
  static async generateFormTableFromAnalysis(analysisResult: any): Promise<FormTableSchema | null> {
    try {
      const formNumber = analysisResult.formIdentification?.formNumber;
      const formTitle = analysisResult.formIdentification?.formType;
      
      if (!formNumber || !formTitle) {
        return null;
      }

      // Extract fields from the analysis
      const requiredFields = analysisResult.fieldExtraction?.requiredFields || {};
      const optionalFields = analysisResult.fieldExtraction?.optionalFields || {};
      
      const fields = [];
      
      // Add required fields
      Object.keys(requiredFields).forEach(fieldName => {
        fields.push({
          name: this.sanitizeFieldName(fieldName),
          type: this.determineFieldType(requiredFields[fieldName]),
          required: true,
          description: `Required field: ${fieldName}`
        });
      });
      
      // Add optional fields
      Object.keys(optionalFields).forEach(fieldName => {
        fields.push({
          name: this.sanitizeFieldName(fieldName),
          type: this.determineFieldType(optionalFields[fieldName]),
          required: false,
          description: `Optional field: ${fieldName}`
        });
      });

      // Always include standard fields
      fields.unshift(
        { name: 'id', type: 'TEXT', required: true, description: 'Primary key' },
        { name: 'document_id', type: 'TEXT', required: true, description: 'Reference to documents table' },
        { name: 'user_id', type: 'TEXT', required: true, description: 'User who owns this data' },
        { name: 'client_name', type: 'TEXT', required: false, description: 'Client/debtor name' },
        { name: 'estate_number', type: 'TEXT', required: false, description: 'Estate number' }
      );

      return {
        formNumber,
        formTitle,
        fields,
        validationRules: analysisResult.riskAssessment?.complianceStatus || {},
        fieldMappings: this.createFieldMappings(requiredFields, optionalFields)
      };
    } catch (error) {
      console.error('Failed to generate form table schema:', error);
      return null;
    }
  }

  /**
   * Create or update dynamic form table
   */
  static async createFormTable(schema: FormTableSchema): Promise<boolean> {
    try {
      const tableName = `form_${schema.formNumber}_data`.toLowerCase();
      
      // Check if table already exists
      const { data: existingTable } = await supabase
        .from('dynamic_form_tables')
        .select('*')
        .eq('form_number', schema.formNumber)
        .single();

      if (existingTable) {
        console.log(`Table for Form ${schema.formNumber} already exists`);
        return true;
      }

      // Generate SQL for table creation
      const createTableSQL = this.generateCreateTableSQL(tableName, schema);
      
      // Store the schema information
      const { error: schemaError } = await supabase
        .from('ai_generated_schemas')
        .insert({
          form_number: schema.formNumber,
          schema_definition: schema,
          sql_creation_script: createTableSQL,
          validation_rules: schema.validationRules || {},
          field_mappings: schema.fieldMappings || {}
        });

      if (schemaError) {
        console.error('Failed to store schema:', schemaError);
        return false;
      }

      // Register the table
      const { error: registryError } = await supabase
        .from('dynamic_form_tables')
        .insert({
          form_number: schema.formNumber,
          form_title: schema.formTitle,
          table_name: tableName,
          table_schema: schema,
          created_by_ai: true
        });

      if (registryError) {
        console.error('Failed to register table:', registryError);
        return false;
      }

      // Execute table creation via edge function (since we can't run DDL directly)
      const { data: createResult, error: createError } = await supabase.functions.invoke('create-dynamic-table', {
        body: {
          tableName,
          createSQL: createTableSQL,
          formNumber: schema.formNumber
        }
      });

      if (createError) {
        console.error('Failed to create dynamic table:', createError);
        return false;
      }

      toast.success(`Dynamic table created for Form ${schema.formNumber}`, {
        description: `Table ${tableName} is ready for data storage`
      });

      return true;
    } catch (error) {
      console.error('Failed to create form table:', error);
      toast.error('Failed to create dynamic form table');
      return false;
    }
  }

  /**
   * Insert data into form-specific table
   */
  static async insertFormData(formNumber: string, documentId: string, extractedData: any): Promise<boolean> {
    try {
      const tableName = `form_${formNumber}_data`.toLowerCase();
      
      // Get the table schema
      const { data: tableInfo } = await supabase
        .from('dynamic_form_tables')
        .select('table_schema')
        .eq('form_number', formNumber)
        .single();

      if (!tableInfo) {
        console.error(`No table found for Form ${formNumber}`);
        return false;
      }

      const schema = tableInfo.table_schema as FormTableSchema;
      
      // Prepare data for insertion
      const insertData = {
        id: crypto.randomUUID(),
        document_id: documentId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...this.mapDataToSchema(extractedData, schema)
      };

      // Insert via edge function (since we can't insert into dynamic tables directly)
      const { error } = await supabase.functions.invoke('insert-form-data', {
        body: {
          tableName,
          data: insertData,
          formNumber
        }
      });

      if (error) {
        console.error('Failed to insert form data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to insert form data:', error);
      return false;
    }
  }

  /**
   * Get available dynamic tables
   */
  static async getAvailableTables(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('dynamic_form_tables')
        .select('*')
        .order('form_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get available tables:', error);
      return [];
    }
  }

  // Helper methods
  private static sanitizeFieldName(fieldName: string): string {
    return fieldName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  private static determineFieldType(value: any): 'TEXT' | 'NUMERIC' | 'BOOLEAN' | 'DATE' | 'JSONB' {
    if (typeof value === 'number') return 'NUMERIC';
    if (typeof value === 'boolean') return 'BOOLEAN';
    if (typeof value === 'object') return 'JSONB';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return 'DATE';
    return 'TEXT';
  }

  private static generateCreateTableSQL(tableName: string, schema: FormTableSchema): string {
    const fields = schema.fields.map(field => {
      let sql = `  ${field.name} ${field.type}`;
      if (field.required && field.name !== 'id') {
        sql += ' NOT NULL';
      }
      if (field.name === 'id') {
        sql += ' PRIMARY KEY DEFAULT gen_random_uuid()';
      }
      return sql;
    }).join(',\n');

    return `
CREATE TABLE IF NOT EXISTS public.${tableName} (
${fields},
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Add RLS
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can access their own ${tableName}" 
  ON public.${tableName} 
  FOR ALL 
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_${tableName}_document_id ON ${tableName}(document_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_user_id ON ${tableName}(user_id);
    `.trim();
  }

  private static createFieldMappings(requiredFields: any, optionalFields: any): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    Object.keys(requiredFields || {}).forEach(key => {
      mappings[key] = this.sanitizeFieldName(key);
    });
    
    Object.keys(optionalFields || {}).forEach(key => {
      mappings[key] = this.sanitizeFieldName(key);
    });
    
    return mappings;
  }

  private static mapDataToSchema(data: any, schema: FormTableSchema): any {
    const mappedData: any = {};
    
    schema.fields.forEach(field => {
      if (field.name in data) {
        mappedData[field.name] = data[field.name];
      }
    });
    
    return mappedData;
  }
}
