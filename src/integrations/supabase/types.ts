export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          timestamp: string | null
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Relationships: []
      }
      api_integrations: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider_name: string
          settings: Json | null
          status: Database["public"]["Enums"]["integration_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider_name: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider_name?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          document_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      branding: {
        Row: {
          company_name: string | null
          created_at: string
          custom_domain: string | null
          description: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_interactions: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          sentiment_score: number | null
          type: string
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sentiment_score?: number | null
          type: string
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sentiment_score?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_trustee_relationships: {
        Row: {
          assigned_date: string | null
          client_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          status: string | null
          trustee_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string | null
          trustee_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string | null
          trustee_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          engagement_score: number | null
          id: string
          last_interaction: string | null
          metadata: Json | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          id?: string
          last_interaction?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          id?: string
          last_interaction?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      document_access_history: {
        Row: {
          access_source: string | null
          accessed_at: string | null
          document_id: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          access_source?: string | null
          accessed_at?: string | null
          document_id: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          access_source?: string | null
          accessed_at?: string | null
          document_id?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_id"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_logs: {
        Row: {
          action: string
          created_at: string | null
          document_id: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          content: string | null
          created_at: string | null
          document_id: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_audit_log: {
        Row: {
          action_type: string
          created_at: string | null
          document_id: string | null
          id: string
          new_state: Json | null
          previous_state: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_audit_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          content: string
          created_at: string | null
          document_id: string | null
          id: string
          is_resolved: boolean | null
          mentions: string[] | null
          parent_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_resolved?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_resolved?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_metadata: {
        Row: {
          confidence_scores: Json | null
          created_at: string | null
          document_id: string | null
          extracted_metadata: Json | null
          id: string
          manual_metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          confidence_scores?: Json | null
          created_at?: string | null
          document_id?: string | null
          extracted_metadata?: Json | null
          id?: string
          manual_metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          confidence_scores?: Json | null
          created_at?: string | null
          document_id?: string | null
          extracted_metadata?: Json | null
          id?: string
          manual_metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_metadata_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          changes_summary: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_id: string
          id: string
          is_current: boolean | null
          metadata: Json | null
          storage_path: string | null
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id: string
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          storage_path?: string | null
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id?: string
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          storage_path?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_confidence_score: number | null
          ai_processing_status: string | null
          created_at: string
          deadlines: Json[] | null
          folder_type: string | null
          id: string
          is_folder: boolean | null
          metadata: Json | null
          parent_folder_id: string | null
          size: number | null
          storage_path: string | null
          title: string
          type: string | null
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          ai_processing_status?: string | null
          created_at?: string
          deadlines?: Json[] | null
          folder_type?: string | null
          id?: string
          is_folder?: boolean | null
          metadata?: Json | null
          parent_folder_id?: string | null
          size?: number | null
          storage_path?: string | null
          title: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          ai_processing_status?: string | null
          created_at?: string
          deadlines?: Json[] | null
          folder_type?: string | null
          id?: string
          is_folder?: boolean | null
          metadata?: Json | null
          parent_folder_id?: string | null
          size?: number | null
          storage_path?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_analysis: {
        Row: {
          anomaly_scores: Json | null
          created_at: string | null
          financial_record_id: string | null
          id: string
          ocr_verification_results: Json | null
          predicted_trends: Json | null
          updated_at: string | null
          validation_results: Json | null
        }
        Insert: {
          anomaly_scores?: Json | null
          created_at?: string | null
          financial_record_id?: string | null
          id?: string
          ocr_verification_results?: Json | null
          predicted_trends?: Json | null
          updated_at?: string | null
          validation_results?: Json | null
        }
        Update: {
          anomaly_scores?: Json | null
          created_at?: string | null
          financial_record_id?: string | null
          id?: string
          ocr_verification_results?: Json | null
          predicted_trends?: Json | null
          updated_at?: string | null
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_analysis_financial_record_id_fkey"
            columns: ["financial_record_id"]
            isOneToOne: false
            referencedRelation: "financial_records"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents: {
        Row: {
          document_type: string | null
          financial_record_id: string | null
          id: string
          metadata: Json | null
          storage_path: string | null
          title: string
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          document_type?: string | null
          financial_record_id?: string | null
          id?: string
          metadata?: Json | null
          storage_path?: string | null
          title: string
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          document_type?: string | null
          financial_record_id?: string | null
          id?: string
          metadata?: Json | null
          storage_path?: string | null
          title?: string
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_documents_financial_record_id_fkey"
            columns: ["financial_record_id"]
            isOneToOne: false
            referencedRelation: "financial_records"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          comparison_notes: string | null
          created_at: string | null
          discrepancy_flags: Json | null
          employment_income: number | null
          food: number | null
          id: string
          insurance: number | null
          medical_expenses: number | null
          monthly_income: number | null
          notes: string | null
          other_expenses: number | null
          other_income: number | null
          period_type: string | null
          rent_mortgage: number | null
          status: string | null
          submission_date: string | null
          surplus_income: number | null
          total_expenses: number | null
          total_income: number | null
          transportation: number | null
          updated_at: string | null
          user_id: string | null
          utilities: number | null
        }
        Insert: {
          comparison_notes?: string | null
          created_at?: string | null
          discrepancy_flags?: Json | null
          employment_income?: number | null
          food?: number | null
          id?: string
          insurance?: number | null
          medical_expenses?: number | null
          monthly_income?: number | null
          notes?: string | null
          other_expenses?: number | null
          other_income?: number | null
          period_type?: string | null
          rent_mortgage?: number | null
          status?: string | null
          submission_date?: string | null
          surplus_income?: number | null
          total_expenses?: number | null
          total_income?: number | null
          transportation?: number | null
          updated_at?: string | null
          user_id?: string | null
          utilities?: number | null
        }
        Update: {
          comparison_notes?: string | null
          created_at?: string | null
          discrepancy_flags?: Json | null
          employment_income?: number | null
          food?: number | null
          id?: string
          insurance?: number | null
          medical_expenses?: number | null
          monthly_income?: number | null
          notes?: string | null
          other_expenses?: number | null
          other_income?: number | null
          period_type?: string | null
          rent_mortgage?: number | null
          status?: string | null
          submission_date?: string | null
          surplus_income?: number | null
          total_expenses?: number | null
          total_income?: number | null
          transportation?: number | null
          updated_at?: string | null
          user_id?: string | null
          utilities?: number | null
        }
        Relationships: []
      }
      form_analysis_results: {
        Row: {
          confidence_score: number | null
          created_at: string
          document_id: string | null
          extracted_fields: Json | null
          form_number: string | null
          id: string
          legal_compliance_status: Json | null
          narrative_summary: string | null
          risk_assessment_details: Json | null
          status: string | null
          updated_at: string
          user_feedback: Json | null
          validation_results: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          document_id?: string | null
          extracted_fields?: Json | null
          form_number?: string | null
          id?: string
          legal_compliance_status?: Json | null
          narrative_summary?: string | null
          risk_assessment_details?: Json | null
          status?: string | null
          updated_at?: string
          user_feedback?: Json | null
          validation_results?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          document_id?: string | null
          extracted_fields?: Json | null
          form_number?: string | null
          id?: string
          legal_compliance_status?: Json | null
          narrative_summary?: string | null
          risk_assessment_details?: Json | null
          status?: string | null
          updated_at?: string
          user_feedback?: Json | null
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_analysis_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          created_at: string
          description: string | null
          field_mappings: Json
          form_number: string
          id: string
          legal_references: Json | null
          regulatory_updates: Json | null
          required_fields: Json
          title: string
          updated_at: string
          validation_rules: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          field_mappings: Json
          form_number: string
          id?: string
          legal_references?: Json | null
          regulatory_updates?: Json | null
          required_fields: Json
          title: string
          updated_at?: string
          validation_rules: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          field_mappings?: Json
          form_number?: string
          id?: string
          legal_references?: Json | null
          regulatory_updates?: Json | null
          required_fields?: Json
          title?: string
          updated_at?: string
          validation_rules?: Json
        }
        Relationships: []
      }
      legal_references: {
        Row: {
          category: string
          content: string
          created_at: string | null
          effective_date: string | null
          id: string
          last_updated: string | null
          metadata: Json | null
          reference_number: string | null
          source_type: string
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          reference_number?: string | null
          source_type: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          reference_number?: string | null
          source_type?: string
          title?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendees: Json | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_type: string | null
          metadata: Json | null
          start_time: string
          status: string | null
          title: string
          trustee_id: string | null
          updated_at: string | null
        }
        Insert: {
          attendees?: Json | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_type?: string | null
          metadata?: Json | null
          start_time: string
          status?: string | null
          title: string
          trustee_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attendees?: Json | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_type?: string | null
          metadata?: Json | null
          start_time?: string
          status?: string | null
          title?: string
          trustee_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          icon: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_notifications: boolean | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          income: number | null
          language: string | null
          notifications_enabled: boolean | null
          occupation: string | null
          phone: string | null
          preferred_contact: string | null
          sms_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_notifications?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id: string
          income?: number | null
          language?: string | null
          notifications_enabled?: boolean | null
          occupation?: string | null
          phone?: string | null
          preferred_contact?: string | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_notifications?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          income?: number | null
          language?: string | null
          notifications_enabled?: boolean | null
          occupation?: string | null
          phone?: string | null
          preferred_contact?: string | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      regulatory_updates: {
        Row: {
          content: string
          created_at: string
          effective_date: string
          id: string
          metadata: Json | null
          publication_date: string
          reference_number: string | null
          source_type: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          effective_date: string
          id?: string
          metadata?: Json | null
          publication_date: string
          reference_number?: string | null
          source_type: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          metadata?: Json | null
          publication_date?: string
          reference_number?: string | null
          source_type?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      signatures: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          ip_address: string | null
          signature_data: string | null
          signed_at: string | null
          signer_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signer_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          signed_at?: string | null
          signer_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string
          description: string | null
          document_id: string | null
          due_date: string | null
          id: string
          regulation: string | null
          severity: string
          solution: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          id?: string
          regulation?: string | null
          severity: string
          solution?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          id?: string
          regulation?: string | null
          severity?: string
          solution?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      training_data: {
        Row: {
          created_at: string | null
          expected_output: string
          id: string
          input_text: string
          is_validated: boolean | null
          metadata: Json | null
          module: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expected_output: string
          id?: string
          input_text: string
          is_validated?: boolean | null
          metadata?: Json | null
          module: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expected_output?: string
          id?: string
          input_text?: string
          is_validated?: boolean | null
          metadata?: Json | null
          module?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          dark_mode: boolean | null
          email_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_save: boolean | null
          compact_view: boolean | null
          created_at: string
          default_currency: string | null
          document_encryption: boolean | null
          document_sync: boolean | null
          ip_whitelisting: boolean | null
          language: string | null
          login_notifications: boolean | null
          password_expiry: string | null
          session_timeout: string | null
          time_zone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save?: boolean | null
          compact_view?: boolean | null
          created_at?: string
          default_currency?: string | null
          document_encryption?: boolean | null
          document_sync?: boolean | null
          ip_whitelisting?: boolean | null
          language?: string | null
          login_notifications?: boolean | null
          password_expiry?: string | null
          session_timeout?: string | null
          time_zone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save?: boolean | null
          compact_view?: boolean | null
          created_at?: string
          default_currency?: string | null
          document_encryption?: boolean | null
          document_sync?: boolean | null
          ip_whitelisting?: boolean | null
          language?: string | null
          login_notifications?: boolean | null
          password_expiry?: string | null
          session_timeout?: string | null
          time_zone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      integration_status: "active" | "inactive" | "pending"
      user_role: "client" | "trustee" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      integration_status: ["active", "inactive", "pending"],
      user_role: ["client", "trustee", "admin"],
    },
  },
} as const
