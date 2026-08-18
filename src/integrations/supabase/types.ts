export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_document_analysis: {
        Row: {
          analysis_type: string
          client_name_extracted: string | null
          confidence_score: number
          created_at: string
          document_id: string | null
          error_details: string | null
          extracted_data: Json
          form_number: string | null
          id: string
          identified_form_type: string | null
          processing_status: string
          risk_flags: Json | null
          updated_at: string
        }
        Insert: {
          analysis_type?: string
          client_name_extracted?: string | null
          confidence_score?: number
          created_at?: string
          document_id?: string | null
          error_details?: string | null
          extracted_data?: Json
          form_number?: string | null
          id?: string
          identified_form_type?: string | null
          processing_status?: string
          risk_flags?: Json | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          client_name_extracted?: string | null
          confidence_score?: number
          created_at?: string
          document_id?: string | null
          error_details?: string | null
          extracted_data?: Json
          form_number?: string | null
          id?: string
          identified_form_type?: string | null
          processing_status?: string
          risk_flags?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_document_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_schemas: {
        Row: {
          created_at: string
          field_mappings: Json | null
          form_number: string
          id: string
          schema_definition: Json
          sql_creation_script: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          field_mappings?: Json | null
          form_number: string
          id?: string
          schema_definition: Json
          sql_creation_script: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          field_mappings?: Json | null
          form_number?: string
          id?: string
          schema_definition?: Json
          sql_creation_script?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
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
      api_cost_log: {
        Row: {
          analysis_id: string | null
          cost_usd: number | null
          created_at: string | null
          id: string
          service: string | null
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          analysis_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          service?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          analysis_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          service?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
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
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
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
      bia_forms_reference: {
        Row: {
          bia_section_references: Json
          category: string
          created_at: string
          filing_deadlines: Json
          form_number: string
          form_title: string
          id: string
          is_active: boolean
          required_fields: Json
          risk_indicators: Json
          updated_at: string
          validation_rules: Json
        }
        Insert: {
          bia_section_references?: Json
          category: string
          created_at?: string
          filing_deadlines?: Json
          form_number: string
          form_title: string
          id?: string
          is_active?: boolean
          required_fields?: Json
          risk_indicators?: Json
          updated_at?: string
          validation_rules?: Json
        }
        Update: {
          bia_section_references?: Json
          category?: string
          created_at?: string
          filing_deadlines?: Json
          form_number?: string
          form_title?: string
          id?: string
          is_active?: boolean
          required_fields?: Json
          risk_indicators?: Json
          updated_at?: string
          validation_rules?: Json
        }
        Relationships: []
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
      claims: {
        Row: {
          ai_flags: Json | null
          claim_amount: number
          collateral_description: string | null
          collateral_value: number | null
          created_at: string
          creditor_id: string | null
          estate_id: string | null
          filing_date: string | null
          id: string
          is_late_filing: boolean | null
          osb_compliant: boolean | null
          preferred_amount: number | null
          priority: string
          proof_of_claim_doc_id: string | null
          secured_amount: number | null
          status: string
          supporting_documents: Json | null
          unsecured_amount: number | null
          updated_at: string
          user_id: string | null
          validation_notes: string | null
        }
        Insert: {
          ai_flags?: Json | null
          claim_amount?: number
          collateral_description?: string | null
          collateral_value?: number | null
          created_at?: string
          creditor_id?: string | null
          estate_id?: string | null
          filing_date?: string | null
          id?: string
          is_late_filing?: boolean | null
          osb_compliant?: boolean | null
          preferred_amount?: number | null
          priority?: string
          proof_of_claim_doc_id?: string | null
          secured_amount?: number | null
          status?: string
          supporting_documents?: Json | null
          unsecured_amount?: number | null
          updated_at?: string
          user_id?: string | null
          validation_notes?: string | null
        }
        Update: {
          ai_flags?: Json | null
          claim_amount?: number
          collateral_description?: string | null
          collateral_value?: number | null
          created_at?: string
          creditor_id?: string | null
          estate_id?: string | null
          filing_date?: string | null
          id?: string
          is_late_filing?: boolean | null
          osb_compliant?: boolean | null
          preferred_amount?: number | null
          priority?: string
          proof_of_claim_doc_id?: string | null
          secured_amount?: number | null
          status?: string
          supporting_documents?: Json | null
          unsecured_amount?: number | null
          updated_at?: string
          user_id?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_creditor_id_fkey"
            columns: ["creditor_id"]
            isOneToOne: false
            referencedRelation: "creditors"
            referencedColumns: ["id"]
          },
        ]
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
      creditor_meetings: {
        Row: {
          agenda: string | null
          created_at: string
          estate_id: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_time: string
          meeting_type: string
          minutes: string | null
          quorum_met: boolean | null
          status: string
          total_claim_amount_voting: number | null
          total_eligible_voters: number | null
          total_votes_cast: number | null
          updated_at: string
          user_id: string | null
          votes: Json | null
        }
        Insert: {
          agenda?: string | null
          created_at?: string
          estate_id?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_time: string
          meeting_type?: string
          minutes?: string | null
          quorum_met?: boolean | null
          status?: string
          total_claim_amount_voting?: number | null
          total_eligible_voters?: number | null
          total_votes_cast?: number | null
          updated_at?: string
          user_id?: string | null
          votes?: Json | null
        }
        Update: {
          agenda?: string | null
          created_at?: string
          estate_id?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string
          meeting_type?: string
          minutes?: string | null
          quorum_met?: boolean | null
          status?: string
          total_claim_amount_voting?: number | null
          total_eligible_voters?: number | null
          total_votes_cast?: number | null
          updated_at?: string
          user_id?: string | null
          votes?: Json | null
        }
        Relationships: []
      }
      creditor_notices: {
        Row: {
          content: string | null
          created_at: string
          creditor_id: string | null
          delivery_status: string | null
          document_id: string | null
          id: string
          notice_type: string
          read_at: string | null
          sent_at: string | null
          sent_via: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          creditor_id?: string | null
          delivery_status?: string | null
          document_id?: string | null
          id?: string
          notice_type: string
          read_at?: string | null
          sent_at?: string | null
          sent_via?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          creditor_id?: string | null
          delivery_status?: string | null
          document_id?: string | null
          id?: string
          notice_type?: string
          read_at?: string | null
          sent_at?: string | null
          sent_via?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creditor_notices_creditor_id_fkey"
            columns: ["creditor_id"]
            isOneToOne: false
            referencedRelation: "creditors"
            referencedColumns: ["id"]
          },
        ]
      }
      creditors: {
        Row: {
          account_number: string | null
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          creditor_type: string
          email: string | null
          estate_id: string | null
          fax: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          creditor_type?: string
          email?: string | null
          estate_id?: string | null
          fax?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          creditor_type?: string
          email?: string | null
          estate_id?: string | null
          fax?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      distributions: {
        Row: {
          created_at: string
          distribution_date: string | null
          distributions: Json | null
          dividend_rate: number | null
          estate_id: string | null
          id: string
          levy_amount: number | null
          preferred_distribution: number | null
          sales_tax: number | null
          secured_distribution: number | null
          status: string
          total_disbursements: number | null
          total_receipts: number | null
          trustee_fees: number | null
          unsecured_distribution: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          distribution_date?: string | null
          distributions?: Json | null
          dividend_rate?: number | null
          estate_id?: string | null
          id?: string
          levy_amount?: number | null
          preferred_distribution?: number | null
          sales_tax?: number | null
          secured_distribution?: number | null
          status?: string
          total_disbursements?: number | null
          total_receipts?: number | null
          trustee_fees?: number | null
          unsecured_distribution?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          distribution_date?: string | null
          distributions?: Json | null
          dividend_rate?: number | null
          estate_id?: string | null
          id?: string
          levy_amount?: number | null
          preferred_distribution?: number | null
          sales_tax?: number | null
          secured_distribution?: number | null
          status?: string
          total_disbursements?: number | null
          total_receipts?: number | null
          trustee_fees?: number | null
          unsecured_distribution?: number | null
          updated_at?: string
          user_id?: string | null
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
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown
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
          client_name: string | null
          confidence_score: number | null
          content: Json
          created_at: string
          document_id: string | null
          estate_number: string | null
          form_number: string | null
          form_type: string | null
          id: string
          risk_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name?: string | null
          confidence_score?: number | null
          content?: Json
          created_at?: string
          document_id?: string | null
          estate_number?: string | null
          form_number?: string | null
          form_type?: string | null
          id?: string
          risk_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string | null
          confidence_score?: number | null
          content?: Json
          created_at?: string
          document_id?: string | null
          estate_number?: string | null
          form_number?: string | null
          form_type?: string | null
          id?: string
          risk_level?: string | null
          updated_at?: string
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
      document_categorization: {
        Row: {
          auto_applied: boolean
          categorization_reasoning: string | null
          confidence_level: string
          created_at: string
          document_id: string | null
          id: string
          suggested_client_folder: string | null
          suggested_form_category: string | null
          updated_at: string
          user_approved: boolean | null
        }
        Insert: {
          auto_applied?: boolean
          categorization_reasoning?: string | null
          confidence_level?: string
          created_at?: string
          document_id?: string | null
          id?: string
          suggested_client_folder?: string | null
          suggested_form_category?: string | null
          updated_at?: string
          user_approved?: boolean | null
        }
        Update: {
          auto_applied?: boolean
          categorization_reasoning?: string | null
          confidence_level?: string
          created_at?: string
          document_id?: string | null
          id?: string
          suggested_client_folder?: string | null
          suggested_form_category?: string | null
          updated_at?: string
          user_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "document_categorization_document_id_fkey"
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
      dynamic_form_tables: {
        Row: {
          created_at: string
          created_by_ai: boolean | null
          form_number: string
          form_title: string
          id: string
          last_updated: string
          table_name: string
          table_schema: Json
        }
        Insert: {
          created_at?: string
          created_by_ai?: boolean | null
          form_number: string
          form_title: string
          id?: string
          last_updated?: string
          table_name: string
          table_schema: Json
        }
        Update: {
          created_at?: string
          created_by_ai?: boolean | null
          form_number?: string
          form_title?: string
          id?: string
          last_updated?: string
          table_name?: string
          table_schema?: Json
        }
        Relationships: []
      }
      estate_asset_securities: {
        Row: {
          amount: number
          asset_id: string
          created_at: string
          creditor_id: string | null
          creditor_name: string | null
          estate_id: string
          id: string
          rank: number
          user_id: string
        }
        Insert: {
          amount?: number
          asset_id: string
          created_at?: string
          creditor_id?: string | null
          creditor_name?: string | null
          estate_id: string
          id?: string
          rank?: number
          user_id: string
        }
        Update: {
          amount?: number
          asset_id?: string
          created_at?: string
          creditor_id?: string | null
          creditor_name?: string | null
          estate_id?: string
          id?: string
          rank?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_asset_securities_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "estate_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_asset_securities_creditor_id_fkey"
            columns: ["creditor_id"]
            isOneToOne: false
            referencedRelation: "estate_creditors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_asset_securities_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_assets: {
        Row: {
          amount_deposited: number
          amount_to_realize: number
          asset_type: string | null
          buy_back: boolean
          completed: boolean
          created_at: string
          description: string
          disposition: string | null
          disposition_date: string | null
          encumbered: boolean
          estate_id: string
          estimated: number
          exempt: boolean
          exempt_amount: number
          exemption_status: string | null
          id: string
          not_sold: boolean
          not_sold_reason: string | null
          original_cost: number
          print_on_rd: boolean
          rd_notes: string | null
          selling_costs: number
          soa_unlocked: boolean
          soa_value: number
          third_party_interest: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_deposited?: number
          amount_to_realize?: number
          asset_type?: string | null
          buy_back?: boolean
          completed?: boolean
          created_at?: string
          description: string
          disposition?: string | null
          disposition_date?: string | null
          encumbered?: boolean
          estate_id: string
          estimated?: number
          exempt?: boolean
          exempt_amount?: number
          exemption_status?: string | null
          id?: string
          not_sold?: boolean
          not_sold_reason?: string | null
          original_cost?: number
          print_on_rd?: boolean
          rd_notes?: string | null
          selling_costs?: number
          soa_unlocked?: boolean
          soa_value?: number
          third_party_interest?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_deposited?: number
          amount_to_realize?: number
          asset_type?: string | null
          buy_back?: boolean
          completed?: boolean
          created_at?: string
          description?: string
          disposition?: string | null
          disposition_date?: string | null
          encumbered?: boolean
          estate_id?: string
          estimated?: number
          exempt?: boolean
          exempt_amount?: number
          exemption_status?: string | null
          id?: string
          not_sold?: boolean
          not_sold_reason?: string | null
          original_cost?: number
          print_on_rd?: boolean
          rd_notes?: string | null
          selling_costs?: number
          soa_unlocked?: boolean
          soa_value?: number
          third_party_interest?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_assets_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_assignments: {
        Row: {
          assigned_by: string | null
          assignee_name: string
          assignee_user_id: string | null
          created_at: string
          effective_from: string
          effective_to: string | null
          estate_id: string
          id: string
          reason: string | null
          role: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          assignee_name: string
          assignee_user_id?: string | null
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          estate_id: string
          id?: string
          reason?: string | null
          role: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          assignee_name?: string
          assignee_user_id?: string | null
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          estate_id?: string
          id?: string
          reason?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_assignments_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          as_of_date: string | null
          branch: string | null
          closed_date: string | null
          created_at: string
          currency: string
          eft_enabled: boolean
          estate_id: string
          export_format: string | null
          gl_bank_account: string | null
          id: string
          institution: string | null
          is_default: boolean
          opened_date: string | null
          opening_balance: number
          pad_enabled: boolean
          transit_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          as_of_date?: string | null
          branch?: string | null
          closed_date?: string | null
          created_at?: string
          currency?: string
          eft_enabled?: boolean
          estate_id: string
          export_format?: string | null
          gl_bank_account?: string | null
          id?: string
          institution?: string | null
          is_default?: boolean
          opened_date?: string | null
          opening_balance?: number
          pad_enabled?: boolean
          transit_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          as_of_date?: string | null
          branch?: string | null
          closed_date?: string | null
          created_at?: string
          currency?: string
          eft_enabled?: boolean
          estate_id?: string
          export_format?: string | null
          gl_bank_account?: string | null
          id?: string
          institution?: string | null
          is_default?: boolean
          opened_date?: string | null
          opening_balance?: number
          pad_enabled?: boolean
          transit_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_bank_accounts_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_counselling_sessions: {
        Row: {
          address: string | null
          appointment_date: string | null
          appointment_time: string | null
          certificate_generated: boolean
          comments: string | null
          completed: boolean
          counsellor: string | null
          created_at: string
          date_invoiced: string | null
          details: string | null
          estate_id: string
          id: string
          location: string | null
          neglected: boolean
          refused: boolean
          session_number: string | null
          source_document: string | null
          third_party_firm: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          appointment_date?: string | null
          appointment_time?: string | null
          certificate_generated?: boolean
          comments?: string | null
          completed?: boolean
          counsellor?: string | null
          created_at?: string
          date_invoiced?: string | null
          details?: string | null
          estate_id: string
          id?: string
          location?: string | null
          neglected?: boolean
          refused?: boolean
          session_number?: string | null
          source_document?: string | null
          third_party_firm?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          appointment_date?: string | null
          appointment_time?: string | null
          certificate_generated?: boolean
          comments?: string | null
          completed?: boolean
          counsellor?: string | null
          created_at?: string
          date_invoiced?: string | null
          details?: string | null
          estate_id?: string
          id?: string
          location?: string | null
          neglected?: boolean
          refused?: boolean
          session_number?: string | null
          source_document?: string | null
          third_party_firm?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_counselling_sessions_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_creditor_meetings: {
        Row: {
          amendment_made_by: string | null
          chairperson: string | null
          created_at: string
          deemed_approval: boolean
          deemed_approval_date: string | null
          estate_id: string
          id: string
          location: string | null
          meeting_date: string | null
          meeting_time: string | null
          notes: string | null
          notice_sent_date: string | null
          updated_at: string
          user_id: string
          voting_round: number | null
        }
        Insert: {
          amendment_made_by?: string | null
          chairperson?: string | null
          created_at?: string
          deemed_approval?: boolean
          deemed_approval_date?: string | null
          estate_id: string
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_time?: string | null
          notes?: string | null
          notice_sent_date?: string | null
          updated_at?: string
          user_id: string
          voting_round?: number | null
        }
        Update: {
          amendment_made_by?: string | null
          chairperson?: string | null
          created_at?: string
          deemed_approval?: boolean
          deemed_approval_date?: string | null
          estate_id?: string
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_time?: string | null
          notes?: string | null
          notice_sent_date?: string | null
          updated_at?: string
          user_id?: string
          voting_round?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estate_creditor_meetings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_creditors: {
        Row: {
          account_number: string | null
          address1: string | null
          address2: string | null
          admitted_dividend: number
          admitted_voting: number
          amended_payments_requested: boolean
          city: string | null
          claim_class: string | null
          claim_status: string | null
          completed: boolean
          contingent_amount: number
          country: string | null
          created_at: string
          creditor_type: string | null
          deferred_amount: number
          email: string | null
          estate_id: string
          filed_amount: number
          head_office: boolean
          id: string
          legal_name: string
          master_creditor: string | null
          material_change_requested: boolean
          meeting_requested: boolean
          other_amount: number
          phone: string | null
          poc_filed: boolean
          postal_code: string | null
          province: string | null
          rank: number | null
          reasons: string | null
          received_date: string | null
          report_170_requested: boolean
          soa_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          address1?: string | null
          address2?: string | null
          admitted_dividend?: number
          admitted_voting?: number
          amended_payments_requested?: boolean
          city?: string | null
          claim_class?: string | null
          claim_status?: string | null
          completed?: boolean
          contingent_amount?: number
          country?: string | null
          created_at?: string
          creditor_type?: string | null
          deferred_amount?: number
          email?: string | null
          estate_id: string
          filed_amount?: number
          head_office?: boolean
          id?: string
          legal_name: string
          master_creditor?: string | null
          material_change_requested?: boolean
          meeting_requested?: boolean
          other_amount?: number
          phone?: string | null
          poc_filed?: boolean
          postal_code?: string | null
          province?: string | null
          rank?: number | null
          reasons?: string | null
          received_date?: string | null
          report_170_requested?: boolean
          soa_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          address1?: string | null
          address2?: string | null
          admitted_dividend?: number
          admitted_voting?: number
          amended_payments_requested?: boolean
          city?: string | null
          claim_class?: string | null
          claim_status?: string | null
          completed?: boolean
          contingent_amount?: number
          country?: string | null
          created_at?: string
          creditor_type?: string | null
          deferred_amount?: number
          email?: string | null
          estate_id?: string
          filed_amount?: number
          head_office?: boolean
          id?: string
          legal_name?: string
          master_creditor?: string | null
          material_change_requested?: boolean
          meeting_requested?: boolean
          other_amount?: number
          phone?: string | null
          poc_filed?: boolean
          postal_code?: string | null
          province?: string | null
          rank?: number | null
          reasons?: string | null
          received_date?: string | null
          report_170_requested?: boolean
          soa_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_creditors_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_dates: {
        Row: {
          change_reason: string | null
          confidence: number | null
          confirmed_by: string | null
          confirmed_date: string | null
          created_at: string
          date_group: string
          date_type: string
          date_value: string | null
          entered_by: string | null
          estate_id: string
          extracted_by: string | null
          id: string
          previous_value: string | null
          source_document: string | null
          source_document_id: string | null
          source_page: string | null
          source_type: string
          time_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          confidence?: number | null
          confirmed_by?: string | null
          confirmed_date?: string | null
          created_at?: string
          date_group?: string
          date_type: string
          date_value?: string | null
          entered_by?: string | null
          estate_id: string
          extracted_by?: string | null
          id?: string
          previous_value?: string | null
          source_document?: string | null
          source_document_id?: string | null
          source_page?: string | null
          source_type?: string
          time_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          change_reason?: string | null
          confidence?: number | null
          confirmed_by?: string | null
          confirmed_date?: string | null
          created_at?: string
          date_group?: string
          date_type?: string
          date_value?: string | null
          entered_by?: string | null
          estate_id?: string
          extracted_by?: string | null
          id?: string
          previous_value?: string | null
          source_document?: string | null
          source_document_id?: string | null
          source_page?: string | null
          source_type?: string
          time_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_dates_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_disbursements: {
        Row: {
          amount: number
          asset_ref: string | null
          bank_account_id: string | null
          cleared: boolean
          created_at: string
          creditor_ref: string | null
          disbursement_type: string | null
          due_date: string | null
          estate_id: string
          gl_account: string | null
          id: string
          payee: string | null
          payment_date: string | null
          payment_method: string | null
          tax_treatment: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          asset_ref?: string | null
          bank_account_id?: string | null
          cleared?: boolean
          created_at?: string
          creditor_ref?: string | null
          disbursement_type?: string | null
          due_date?: string | null
          estate_id: string
          gl_account?: string | null
          id?: string
          payee?: string | null
          payment_date?: string | null
          payment_method?: string | null
          tax_treatment?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset_ref?: string | null
          bank_account_id?: string | null
          cleared?: boolean
          created_at?: string
          creditor_ref?: string | null
          disbursement_type?: string | null
          due_date?: string | null
          estate_id?: string
          gl_account?: string | null
          id?: string
          payee?: string | null
          payment_date?: string | null
          payment_method?: string | null
          tax_treatment?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_disbursements_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "estate_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_disbursements_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_events: {
        Row: {
          actor: string | null
          actor_type: string
          after_state: Json | null
          before_state: Json | null
          client_id: string | null
          correlation_id: string | null
          created_at: string
          estate_id: string
          event_type: string
          evidence: Json | null
          id: string
          reason: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          actor?: string | null
          actor_type?: string
          after_state?: Json | null
          before_state?: Json | null
          client_id?: string | null
          correlation_id?: string | null
          created_at?: string
          estate_id: string
          event_type: string
          evidence?: Json | null
          id?: string
          reason?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          actor?: string | null
          actor_type?: string
          after_state?: Json | null
          before_state?: Json | null
          client_id?: string | null
          correlation_id?: string | null
          created_at?: string
          estate_id?: string
          event_type?: string
          evidence?: Json | null
          id?: string
          reason?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_events_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_income_periods: {
        Row: {
          amount_agreed: number
          amount_required: number
          available_family_income: number
          bankrupt_income: number
          bankrupt_portion: number
          comments: string | null
          created_at: string
          disagreement: boolean
          discretionary_expenses: number
          estate_id: string
          household_members: number
          id: string
          income_basis: string | null
          month: string | null
          monthly_income: number
          non_discretionary_expenses: number
          other_family_income: number
          outstanding: number
          payment: number
          payments_made: number
          period_label: string | null
          permitted_non_discretionary: number
          required_percentage: number
          spouse_income: number
          standard_version: string | null
          statement_number: number | null
          status: string
          surplus_amount: number
          threshold_amount: number
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          amount_agreed?: number
          amount_required?: number
          available_family_income?: number
          bankrupt_income?: number
          bankrupt_portion?: number
          comments?: string | null
          created_at?: string
          disagreement?: boolean
          discretionary_expenses?: number
          estate_id: string
          household_members?: number
          id?: string
          income_basis?: string | null
          month?: string | null
          monthly_income?: number
          non_discretionary_expenses?: number
          other_family_income?: number
          outstanding?: number
          payment?: number
          payments_made?: number
          period_label?: string | null
          permitted_non_discretionary?: number
          required_percentage?: number
          spouse_income?: number
          standard_version?: string | null
          statement_number?: number | null
          status?: string
          surplus_amount?: number
          threshold_amount?: number
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          amount_agreed?: number
          amount_required?: number
          available_family_income?: number
          bankrupt_income?: number
          bankrupt_portion?: number
          comments?: string | null
          created_at?: string
          disagreement?: boolean
          discretionary_expenses?: number
          estate_id?: string
          household_members?: number
          id?: string
          income_basis?: string | null
          month?: string | null
          monthly_income?: number
          non_discretionary_expenses?: number
          other_family_income?: number
          outstanding?: number
          payment?: number
          payments_made?: number
          period_label?: string | null
          permitted_non_discretionary?: number
          required_percentage?: number
          spouse_income?: number
          standard_version?: string | null
          statement_number?: number | null
          status?: string
          surplus_amount?: number
          threshold_amount?: number
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estate_income_periods_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_ledger_entries: {
        Row: {
          bank_account_id: string | null
          created_at: string
          estate_id: string
          gl_date: string | null
          id: string
          lines: Json
          memo: string | null
          reversal_of: string | null
          source_id: string | null
          source_type: string
          total_credit: number
          total_debit: number
          user_id: string
        }
        Insert: {
          bank_account_id?: string | null
          created_at?: string
          estate_id: string
          gl_date?: string | null
          id?: string
          lines?: Json
          memo?: string | null
          reversal_of?: string | null
          source_id?: string | null
          source_type?: string
          total_credit?: number
          total_debit?: number
          user_id: string
        }
        Update: {
          bank_account_id?: string | null
          created_at?: string
          estate_id?: string
          gl_date?: string | null
          id?: string
          lines?: Json
          memo?: string | null
          reversal_of?: string | null
          source_id?: string | null
          source_type?: string
          total_credit?: number
          total_debit?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_ledger_entries_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "estate_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_ledger_entries_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_ledger_entries_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "estate_ledger_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_milestones: {
        Row: {
          anchor_date_type: string | null
          blocking: boolean
          code: string
          completed_date: string | null
          created_at: string
          due_date: string | null
          estate_id: string
          id: string
          label: string
          notes: string | null
          offset_days: number | null
          sort_order: number
          stage: string
          state: string
          statutory_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anchor_date_type?: string | null
          blocking?: boolean
          code: string
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          estate_id: string
          id?: string
          label: string
          notes?: string | null
          offset_days?: number | null
          sort_order?: number
          stage: string
          state?: string
          statutory_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anchor_date_type?: string | null
          blocking?: boolean
          code?: string
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          estate_id?: string
          id?: string
          label?: string
          notes?: string | null
          offset_days?: number | null
          sort_order?: number
          stage?: string
          state?: string
          statutory_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_milestones_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_pad_runs: {
        Row: {
          bank_account_id: string | null
          created_at: string
          estate_id: string
          file_format: string | null
          id: string
          item_count: number
          notes: string | null
          run_date: string
          state: string
          submitted_at: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_id?: string | null
          created_at?: string
          estate_id: string
          file_format?: string | null
          id?: string
          item_count?: number
          notes?: string | null
          run_date: string
          state?: string
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_id?: string | null
          created_at?: string
          estate_id?: string
          file_format?: string | null
          id?: string
          item_count?: number
          notes?: string | null
          run_date?: string
          state?: string
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_pad_runs_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "estate_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_pad_runs_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_payment_schedules: {
        Row: {
          active: boolean
          amount_per_payment: number
          asset_ref: string | null
          comments: string | null
          created_at: string
          end_date: string | null
          estate_id: string
          first_debit_date: string | null
          gl_account: string | null
          grace_period_days: number | null
          id: string
          incremental_monthly: number
          mandate_reference: string | null
          number_of_periods: number | null
          pad_enabled: boolean
          payment_category: string | null
          period_type: string | null
          schedule_type: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount_per_payment?: number
          asset_ref?: string | null
          comments?: string | null
          created_at?: string
          end_date?: string | null
          estate_id: string
          first_debit_date?: string | null
          gl_account?: string | null
          grace_period_days?: number | null
          id?: string
          incremental_monthly?: number
          mandate_reference?: string | null
          number_of_periods?: number | null
          pad_enabled?: boolean
          payment_category?: string | null
          period_type?: string | null
          schedule_type?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount_per_payment?: number
          asset_ref?: string | null
          comments?: string | null
          created_at?: string
          end_date?: string | null
          estate_id?: string
          first_debit_date?: string | null
          gl_account?: string | null
          grace_period_days?: number | null
          id?: string
          incremental_monthly?: number
          mandate_reference?: string | null
          number_of_periods?: number | null
          pad_enabled?: boolean
          payment_category?: string | null
          period_type?: string | null
          schedule_type?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_payment_schedules_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_receipt_allocations: {
        Row: {
          amount: number
          asset_ref: string | null
          created_at: string
          creditor_ref: string | null
          gl_account: string
          id: string
          receipt_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          asset_ref?: string | null
          created_at?: string
          creditor_ref?: string | null
          gl_account: string
          id?: string
          receipt_id: string
          user_id: string
        }
        Update: {
          amount?: number
          asset_ref?: string | null
          created_at?: string
          creditor_ref?: string | null
          gl_account?: string
          id?: string
          receipt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_receipt_allocations_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "estate_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_receipts: {
        Row: {
          amount: number
          bank_account_id: string | null
          created_at: string
          deposit_date: string | null
          estate_id: string
          id: string
          memo: string | null
          payment_method: string | null
          posted: boolean
          receipt_date: string | null
          receipt_number: string | null
          received_from: string | null
          reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          deposit_date?: string | null
          estate_id: string
          id?: string
          memo?: string | null
          payment_method?: string | null
          posted?: boolean
          receipt_date?: string | null
          receipt_number?: string | null
          received_from?: string | null
          reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          deposit_date?: string | null
          estate_id?: string
          id?: string
          memo?: string | null
          payment_method?: string | null
          posted?: boolean
          receipt_date?: string | null
          receipt_number?: string | null
          received_from?: string | null
          reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_receipts_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "estate_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_receipts_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_reconciliations: {
        Row: {
          approval_date: string | null
          bank_account_id: string | null
          bank_charges: number
          closing_statement_balance: number
          created_at: string
          deposits_in_transit: number
          difference: number
          estate_id: string
          id: string
          interest: number
          ledger_balance: number
          opening_statement_balance: number
          outstanding_withdrawals: number
          preparer: string | null
          reconciled_balance: number
          reviewer: string | null
          statement_end: string | null
          statement_start: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_date?: string | null
          bank_account_id?: string | null
          bank_charges?: number
          closing_statement_balance?: number
          created_at?: string
          deposits_in_transit?: number
          difference?: number
          estate_id: string
          id?: string
          interest?: number
          ledger_balance?: number
          opening_statement_balance?: number
          outstanding_withdrawals?: number
          preparer?: string | null
          reconciled_balance?: number
          reviewer?: string | null
          statement_end?: string | null
          statement_start?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_date?: string | null
          bank_account_id?: string | null
          bank_charges?: number
          closing_statement_balance?: number
          created_at?: string
          deposits_in_transit?: number
          difference?: number
          estate_id?: string
          id?: string
          interest?: number
          ledger_balance?: number
          opening_statement_balance?: number
          outstanding_withdrawals?: number
          preparer?: string | null
          reconciled_balance?: number
          reviewer?: string | null
          statement_end?: string | null
          statement_start?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_reconciliations_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "estate_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_reconciliations_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_schedule_rows: {
        Row: {
          amount_deposited: number
          amount_due: number
          amount_received: number
          created_at: string
          due_date: string
          estate_id: string
          id: string
          notes: string | null
          pad_run_id: string | null
          pad_state: string
          period_index: number
          receipt_id: string | null
          schedule_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_deposited?: number
          amount_due?: number
          amount_received?: number
          created_at?: string
          due_date: string
          estate_id: string
          id?: string
          notes?: string | null
          pad_run_id?: string | null
          pad_state?: string
          period_index: number
          receipt_id?: string | null
          schedule_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_deposited?: number
          amount_due?: number
          amount_received?: number
          created_at?: string
          due_date?: string
          estate_id?: string
          id?: string
          notes?: string | null
          pad_run_id?: string | null
          pad_state?: string
          period_index?: number
          receipt_id?: string | null
          schedule_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_schedule_rows_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_schedule_rows_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "estate_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_schedule_rows_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "estate_payment_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_statement_lines: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          direction: string
          estate_id: string
          id: string
          line_date: string | null
          match_state: string
          matched_disbursement_id: string | null
          matched_receipt_id: string | null
          reconciliation_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          direction?: string
          estate_id: string
          id?: string
          line_date?: string | null
          match_state?: string
          matched_disbursement_id?: string | null
          matched_receipt_id?: string | null
          reconciliation_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          direction?: string
          estate_id?: string
          id?: string
          line_date?: string | null
          match_state?: string
          matched_disbursement_id?: string | null
          matched_receipt_id?: string | null
          reconciliation_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_statement_lines_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_statement_lines_matched_disbursement_id_fkey"
            columns: ["matched_disbursement_id"]
            isOneToOne: false
            referencedRelation: "estate_disbursements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_statement_lines_matched_receipt_id_fkey"
            columns: ["matched_receipt_id"]
            isOneToOne: false
            referencedRelation: "estate_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_statement_lines_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "estate_reconciliations"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_tax_documents: {
        Row: {
          created_at: string
          doc_type: string | null
          estate_id: string
          id: string
          linked_document: string | null
          received: boolean
          received_date: string | null
          reminder_date: string | null
          requested_date: string | null
          required: boolean
          tax_year: number | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          estate_id: string
          id?: string
          linked_document?: string | null
          received?: boolean
          received_date?: string | null
          reminder_date?: string | null
          requested_date?: string | null
          required?: boolean
          tax_year?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          estate_id?: string
          id?: string
          linked_document?: string | null
          received?: boolean
          received_date?: string | null
          reminder_date?: string | null
          requested_date?: string | null
          required?: boolean
          tax_year?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "estate_tax_documents_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_tax_returns: {
        Row: {
          amount_deposited: number
          assessment_date: string | null
          completed: boolean
          created_at: string
          date_filed: string | null
          date_forwarded: string | null
          date_paid: string | null
          date_prepared: string | null
          disposition: string | null
          disposition_date: string | null
          estate_id: string
          estimated_amount: number
          follow_up_months: number | null
          id: string
          jurisdiction: string | null
          preparation_charge: number
          preparer_name: string | null
          reminder_date: string | null
          return_type: string | null
          source: string | null
          status: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          amount_deposited?: number
          assessment_date?: string | null
          completed?: boolean
          created_at?: string
          date_filed?: string | null
          date_forwarded?: string | null
          date_paid?: string | null
          date_prepared?: string | null
          disposition?: string | null
          disposition_date?: string | null
          estate_id: string
          estimated_amount?: number
          follow_up_months?: number | null
          id?: string
          jurisdiction?: string | null
          preparation_charge?: number
          preparer_name?: string | null
          reminder_date?: string | null
          return_type?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          amount_deposited?: number
          assessment_date?: string | null
          completed?: boolean
          created_at?: string
          date_filed?: string | null
          date_forwarded?: string | null
          date_paid?: string | null
          date_prepared?: string | null
          disposition?: string | null
          disposition_date?: string | null
          estate_id?: string
          estimated_amount?: number
          follow_up_months?: number | null
          id?: string
          jurisdiction?: string | null
          preparation_charge?: number
          preparer_name?: string | null
          reminder_date?: string | null
          return_type?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estate_tax_returns_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estates: {
        Row: {
          address: string | null
          administration_type: string | null
          aka: string | null
          appointment_date: string | null
          archive_box_number: string | null
          archive_sent_date: string | null
          assigned_date: string | null
          business_number: string | null
          cause_details: string | null
          cell_phone: string | null
          client_id: string | null
          corporate_name: string | null
          court_name: string | null
          court_number: string | null
          created_at: string
          date_of_birth: string | null
          date_started: string | null
          debtor_kind: string
          debtor_name: string
          district: string | null
          division: string | null
          division_number: string | null
          efile_enabled: boolean
          email: string | null
          estate_administrator: string | null
          estate_type: string
          federal_charter_number: string | null
          file_name: string | null
          file_number: string | null
          file_status: string | null
          first_name: string | null
          gender: string | null
          gst_refund_choice: string | null
          home_phone: string | null
          household_adults: number | null
          household_minors: number | null
          id: string
          incorporation_date: string | null
          incorporation_place: string | null
          initial_contact_date: string | null
          initial_interviewer: string | null
          insolvency_date: string | null
          joint_filing: boolean
          language: string | null
          last_name: string | null
          local_or: string | null
          marital_status: string | null
          middle_name: string | null
          nature_of_business: string | null
          next_deadline: string | null
          next_deadline_description: string | null
          office_manager: string | null
          operating_as: string | null
          osb_estate_number: string | null
          primary_cause: string | null
          proceeding_type: string | null
          processing_centre: string | null
          record_extras: Json
          secondary_cause: string | null
          service_location: string | null
          signup_date: string | null
          sin: string | null
          status: string
          technician: string | null
          total_claims: number | null
          total_creditors: number | null
          trust_balance: number | null
          trustee_id: string | null
          trustee_name: string | null
          trustee_office: string | null
          updated_at: string
          user_id: string | null
          work_phone: string | null
        }
        Insert: {
          address?: string | null
          administration_type?: string | null
          aka?: string | null
          appointment_date?: string | null
          archive_box_number?: string | null
          archive_sent_date?: string | null
          assigned_date?: string | null
          business_number?: string | null
          cause_details?: string | null
          cell_phone?: string | null
          client_id?: string | null
          corporate_name?: string | null
          court_name?: string | null
          court_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_started?: string | null
          debtor_kind?: string
          debtor_name: string
          district?: string | null
          division?: string | null
          division_number?: string | null
          efile_enabled?: boolean
          email?: string | null
          estate_administrator?: string | null
          estate_type?: string
          federal_charter_number?: string | null
          file_name?: string | null
          file_number?: string | null
          file_status?: string | null
          first_name?: string | null
          gender?: string | null
          gst_refund_choice?: string | null
          home_phone?: string | null
          household_adults?: number | null
          household_minors?: number | null
          id?: string
          incorporation_date?: string | null
          incorporation_place?: string | null
          initial_contact_date?: string | null
          initial_interviewer?: string | null
          insolvency_date?: string | null
          joint_filing?: boolean
          language?: string | null
          last_name?: string | null
          local_or?: string | null
          marital_status?: string | null
          middle_name?: string | null
          nature_of_business?: string | null
          next_deadline?: string | null
          next_deadline_description?: string | null
          office_manager?: string | null
          operating_as?: string | null
          osb_estate_number?: string | null
          primary_cause?: string | null
          proceeding_type?: string | null
          processing_centre?: string | null
          record_extras?: Json
          secondary_cause?: string | null
          service_location?: string | null
          signup_date?: string | null
          sin?: string | null
          status?: string
          technician?: string | null
          total_claims?: number | null
          total_creditors?: number | null
          trust_balance?: number | null
          trustee_id?: string | null
          trustee_name?: string | null
          trustee_office?: string | null
          updated_at?: string
          user_id?: string | null
          work_phone?: string | null
        }
        Update: {
          address?: string | null
          administration_type?: string | null
          aka?: string | null
          appointment_date?: string | null
          archive_box_number?: string | null
          archive_sent_date?: string | null
          assigned_date?: string | null
          business_number?: string | null
          cause_details?: string | null
          cell_phone?: string | null
          client_id?: string | null
          corporate_name?: string | null
          court_name?: string | null
          court_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_started?: string | null
          debtor_kind?: string
          debtor_name?: string
          district?: string | null
          division?: string | null
          division_number?: string | null
          efile_enabled?: boolean
          email?: string | null
          estate_administrator?: string | null
          estate_type?: string
          federal_charter_number?: string | null
          file_name?: string | null
          file_number?: string | null
          file_status?: string | null
          first_name?: string | null
          gender?: string | null
          gst_refund_choice?: string | null
          home_phone?: string | null
          household_adults?: number | null
          household_minors?: number | null
          id?: string
          incorporation_date?: string | null
          incorporation_place?: string | null
          initial_contact_date?: string | null
          initial_interviewer?: string | null
          insolvency_date?: string | null
          joint_filing?: boolean
          language?: string | null
          last_name?: string | null
          local_or?: string | null
          marital_status?: string | null
          middle_name?: string | null
          nature_of_business?: string | null
          next_deadline?: string | null
          next_deadline_description?: string | null
          office_manager?: string | null
          operating_as?: string | null
          osb_estate_number?: string | null
          primary_cause?: string | null
          proceeding_type?: string | null
          processing_centre?: string | null
          record_extras?: Json
          secondary_cause?: string | null
          service_location?: string | null
          signup_date?: string | null
          sin?: string | null
          status?: string
          technician?: string | null
          total_claims?: number | null
          total_creditors?: number | null
          trust_balance?: number | null
          trustee_id?: string | null
          trustee_name?: string | null
          trustee_office?: string | null
          updated_at?: string
          user_id?: string | null
          work_phone?: string | null
        }
        Relationships: []
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
      hashtag_cache: {
        Row: {
          competition_score: number | null
          fit_score: number | null
          hashtag: string | null
          id: string
          last_updated: string | null
          niche: string | null
          platform: string | null
          reach_estimate: string | null
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          competition_score?: number | null
          fit_score?: number | null
          hashtag?: string | null
          id?: string
          last_updated?: string | null
          niche?: string | null
          platform?: string | null
          reach_estimate?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          competition_score?: number | null
          fit_score?: number | null
          hashtag?: string | null
          id?: string
          last_updated?: string | null
          niche?: string | null
          platform?: string | null
          reach_estimate?: string | null
          video_count?: number | null
          view_count?: number | null
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
      osb_compliance_tracking: {
        Row: {
          analysis_id: string | null
          checked_at: string | null
          id: string
          is_compliant: boolean
          notes: string | null
          regulation_reference: string | null
          requirement_type: string
        }
        Insert: {
          analysis_id?: string | null
          checked_at?: string | null
          id?: string
          is_compliant: boolean
          notes?: string | null
          regulation_reference?: string | null
          requirement_type: string
        }
        Update: {
          analysis_id?: string | null
          checked_at?: string | null
          id?: string
          is_compliant?: boolean
          notes?: string | null
          regulation_reference?: string | null
          requirement_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "osb_compliance_tracking_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "osb_form_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      osb_form_analyses: {
        Row: {
          amounts_reasonable: boolean | null
          analysis_result: Json
          analyzed_by: string | null
          bankruptcy_date: string | null
          bia_compliant: boolean | null
          compliance_status: Json | null
          confidence_score: number | null
          court_district: string | null
          created_at: string | null
          creditor_name: string | null
          dates_consistent: boolean | null
          debtor_address: string | null
          debtor_name: string | null
          document_type: string
          estate_number: string | null
          extraction_quality: string | null
          filing_date: string | null
          form_number: string
          form_title: string
          id: string
          identified_risks: Json | null
          osb_compliant: boolean | null
          overall_risk_level: string
          pages_analyzed: number | null
          processing_status: string
          required_fields_complete: boolean | null
          signature_date: string | null
          signature_verified: boolean | null
          trustee_name: string | null
          updated_at: string | null
        }
        Insert: {
          amounts_reasonable?: boolean | null
          analysis_result: Json
          analyzed_by?: string | null
          bankruptcy_date?: string | null
          bia_compliant?: boolean | null
          compliance_status?: Json | null
          confidence_score?: number | null
          court_district?: string | null
          created_at?: string | null
          creditor_name?: string | null
          dates_consistent?: boolean | null
          debtor_address?: string | null
          debtor_name?: string | null
          document_type: string
          estate_number?: string | null
          extraction_quality?: string | null
          filing_date?: string | null
          form_number: string
          form_title: string
          id?: string
          identified_risks?: Json | null
          osb_compliant?: boolean | null
          overall_risk_level: string
          pages_analyzed?: number | null
          processing_status: string
          required_fields_complete?: boolean | null
          signature_date?: string | null
          signature_verified?: boolean | null
          trustee_name?: string | null
          updated_at?: string | null
        }
        Update: {
          amounts_reasonable?: boolean | null
          analysis_result?: Json
          analyzed_by?: string | null
          bankruptcy_date?: string | null
          bia_compliant?: boolean | null
          compliance_status?: Json | null
          confidence_score?: number | null
          court_district?: string | null
          created_at?: string | null
          creditor_name?: string | null
          dates_consistent?: boolean | null
          debtor_address?: string | null
          debtor_name?: string | null
          document_type?: string
          estate_number?: string | null
          extraction_quality?: string | null
          filing_date?: string | null
          form_number?: string
          form_title?: string
          id?: string
          identified_risks?: Json | null
          osb_compliant?: boolean | null
          overall_risk_level?: string
          pages_analyzed?: number | null
          processing_status?: string
          required_fields_complete?: boolean | null
          signature_date?: string | null
          signature_verified?: boolean | null
          trustee_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      osb_forms_reference: {
        Row: {
          bia_references: Json
          category: string
          created_at: string | null
          filing_deadlines: Json
          form_number: string
          form_title: string
          is_active: boolean | null
          required_attachments: Json
          required_fields: Json
          risk_level: string
          validation_rules: string | null
        }
        Insert: {
          bia_references: Json
          category: string
          created_at?: string | null
          filing_deadlines: Json
          form_number: string
          form_title: string
          is_active?: boolean | null
          required_attachments: Json
          required_fields: Json
          risk_level: string
          validation_rules?: string | null
        }
        Update: {
          bia_references?: Json
          category?: string
          created_at?: string | null
          filing_deadlines?: Json
          form_number?: string
          form_title?: string
          is_active?: boolean | null
          required_attachments?: Json
          required_fields?: Json
          risk_level?: string
          validation_rules?: string | null
        }
        Relationships: []
      }
      osb_risk_assessments: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          deadline_impact: boolean | null
          description: string
          id: string
          regulation_reference: string | null
          resolution_notes: string | null
          resolved: boolean | null
          risk_type: string
          severity: string
          suggested_action: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          deadline_impact?: boolean | null
          description: string
          id?: string
          regulation_reference?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          risk_type: string
          severity: string
          suggested_action?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          deadline_impact?: boolean | null
          description?: string
          id?: string
          regulation_reference?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          risk_type?: string
          severity?: string
          suggested_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "osb_risk_assessments_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "osb_form_analyses"
            referencedColumns: ["id"]
          },
        ]
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
      simulation_comments: {
        Row: {
          agent_color: string | null
          agent_name: string | null
          analysis_id: string | null
          comment_text: string | null
          created_at: string | null
          id: string
          simulation_id: string | null
          timestamp_seconds: number | null
        }
        Insert: {
          agent_color?: string | null
          agent_name?: string | null
          analysis_id?: string | null
          comment_text?: string | null
          created_at?: string | null
          id?: string
          simulation_id?: string | null
          timestamp_seconds?: number | null
        }
        Update: {
          agent_color?: string | null
          agent_name?: string | null
          analysis_id?: string | null
          comment_text?: string | null
          created_at?: string | null
          id?: string
          simulation_id?: string | null
          timestamp_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_comments_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_comments_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          analysis_id: string | null
          audience_focus: number | null
          created_at: string | null
          dropout_moments: Json | null
          id: string
          predictions: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          audience_focus?: number | null
          created_at?: string | null
          dropout_moments?: Json | null
          id?: string
          predictions?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          audience_focus?: number | null
          created_at?: string | null
          dropout_moments?: Json | null
          id?: string
          predictions?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          task_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          task_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_system_comment: boolean | null
          task_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_system_comment?: boolean | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_system_comment?: boolean | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_deadlines: {
        Row: {
          bia_section: string | null
          buffer_days: number | null
          created_at: string | null
          deadline_date: string
          deadline_type: string
          form_number: string | null
          id: string
          reminder_sent: boolean | null
          task_id: string | null
        }
        Insert: {
          bia_section?: string | null
          buffer_days?: number | null
          created_at?: string | null
          deadline_date: string
          deadline_type: string
          form_number?: string | null
          id?: string
          reminder_sent?: boolean | null
          task_id?: string | null
        }
        Update: {
          bia_section?: string | null
          buffer_days?: number | null
          created_at?: string | null
          deadline_date?: string
          deadline_type?: string
          form_number?: string | null
          id?: string
          reminder_sent?: boolean | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_deadlines_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          bia_section: string | null
          category: string
          compliance_requirements: Json | null
          created_at: string | null
          deadline_rules: Json | null
          default_assignee_role: string | null
          description: string | null
          estimated_duration: number | null
          form_number: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: string | null
          template_steps: Json | null
          updated_at: string | null
        }
        Insert: {
          bia_section?: string | null
          category: string
          compliance_requirements?: Json | null
          created_at?: string | null
          deadline_rules?: Json | null
          default_assignee_role?: string | null
          description?: string | null
          estimated_duration?: number | null
          form_number?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: string | null
          template_steps?: Json | null
          updated_at?: string | null
        }
        Update: {
          bia_section?: string | null
          category?: string
          compliance_requirements?: Json | null
          created_at?: string | null
          deadline_rules?: Json | null
          default_assignee_role?: string | null
          description?: string | null
          estimated_duration?: number | null
          form_number?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string | null
          template_steps?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_duration: number | null
          ai_confidence_score: number | null
          ai_generated: boolean | null
          assigned_to: string | null
          auto_assigned: boolean | null
          bia_section: string | null
          category: string | null
          completion_percentage: number | null
          compliance_deadline: string | null
          created_at: string | null
          created_by: string
          dependencies: Json | null
          description: string | null
          document_id: string | null
          due_date: string | null
          estimated_duration: number | null
          form_number: string | null
          id: string
          priority: string | null
          regulation: string | null
          risk_id: string | null
          severity: string
          solution: string | null
          status: string | null
          tags: Json | null
          task_template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          ai_confidence_score?: number | null
          ai_generated?: boolean | null
          assigned_to?: string | null
          auto_assigned?: boolean | null
          bia_section?: string | null
          category?: string | null
          completion_percentage?: number | null
          compliance_deadline?: string | null
          created_at?: string | null
          created_by: string
          dependencies?: Json | null
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          form_number?: string | null
          id?: string
          priority?: string | null
          regulation?: string | null
          risk_id?: string | null
          severity: string
          solution?: string | null
          status?: string | null
          tags?: Json | null
          task_template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          ai_confidence_score?: number | null
          ai_generated?: boolean | null
          assigned_to?: string | null
          auto_assigned?: boolean | null
          bia_section?: string | null
          category?: string | null
          completion_percentage?: number | null
          compliance_deadline?: string | null
          created_at?: string | null
          created_by?: string
          dependencies?: Json | null
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          form_number?: string | null
          id?: string
          priority?: string | null
          regulation?: string | null
          risk_id?: string | null
          severity?: string
          solution?: string | null
          status?: string | null
          tags?: Json | null
          task_template_id?: string | null
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
      tracked_creators: {
        Row: {
          avg_views: number | null
          created_at: string | null
          data_source: string | null
          display_name: string | null
          engagement_rate: number | null
          follower_count: number | null
          following_count: number | null
          handle: string
          id: string
          is_threat: boolean | null
          is_verified: boolean | null
          last_updated: string | null
          latest_score: number | null
          platform: string | null
          post_count: number | null
          posts_this_week: number | null
          user_id: string | null
        }
        Insert: {
          avg_views?: number | null
          created_at?: string | null
          data_source?: string | null
          display_name?: string | null
          engagement_rate?: number | null
          follower_count?: number | null
          following_count?: number | null
          handle: string
          id?: string
          is_threat?: boolean | null
          is_verified?: boolean | null
          last_updated?: string | null
          latest_score?: number | null
          platform?: string | null
          post_count?: number | null
          posts_this_week?: number | null
          user_id?: string | null
        }
        Update: {
          avg_views?: number | null
          created_at?: string | null
          data_source?: string | null
          display_name?: string | null
          engagement_rate?: number | null
          follower_count?: number | null
          following_count?: number | null
          handle?: string
          id?: string
          is_threat?: boolean | null
          is_verified?: boolean | null
          last_updated?: string | null
          latest_score?: number | null
          platform?: string | null
          post_count?: number | null
          posts_this_week?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracked_creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      translations: {
        Row: {
          lang_code: string
          strings: Json | null
          updated_at: string | null
        }
        Insert: {
          lang_code: string
          strings?: Json | null
          updated_at?: string | null
        }
        Update: {
          lang_code?: string
          strings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trend_alerts: {
        Row: {
          created_at: string | null
          creator_count: number | null
          expires_at: string | null
          growth_pct: number | null
          hours_remaining: number | null
          id: string
          niche: string | null
          platform: string | null
          source: string | null
          trend_name: string | null
          urgency_score: number | null
        }
        Insert: {
          created_at?: string | null
          creator_count?: number | null
          expires_at?: string | null
          growth_pct?: number | null
          hours_remaining?: number | null
          id?: string
          niche?: string | null
          platform?: string | null
          source?: string | null
          trend_name?: string | null
          urgency_score?: number | null
        }
        Update: {
          created_at?: string | null
          creator_count?: number | null
          expires_at?: string | null
          growth_pct?: number | null
          hours_remaining?: number | null
          id?: string
          niche?: string | null
          platform?: string | null
          source?: string | null
          trend_name?: string | null
          urgency_score?: number | null
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
      video_analyses: {
        Row: {
          algo_insights: Json | null
          benchmark_text: string | null
          best_clips: Json | null
          biggest_issue_body: string | null
          biggest_issue_title: string | null
          caption_score: number | null
          created_at: string | null
          current_step: number | null
          current_step_label: string | null
          emotion_score: number | null
          error: string | null
          fix_suggestions: Json | null
          hook_score: number | null
          id: string
          optimized_storage_path: string | null
          overall_score: number | null
          pacing_score: number | null
          status: string | null
          user_id: string | null
          verdict: string | null
          video_id: string | null
          visual_clarity_score: number | null
        }
        Insert: {
          algo_insights?: Json | null
          benchmark_text?: string | null
          best_clips?: Json | null
          biggest_issue_body?: string | null
          biggest_issue_title?: string | null
          caption_score?: number | null
          created_at?: string | null
          current_step?: number | null
          current_step_label?: string | null
          emotion_score?: number | null
          error?: string | null
          fix_suggestions?: Json | null
          hook_score?: number | null
          id?: string
          optimized_storage_path?: string | null
          overall_score?: number | null
          pacing_score?: number | null
          status?: string | null
          user_id?: string | null
          verdict?: string | null
          video_id?: string | null
          visual_clarity_score?: number | null
        }
        Update: {
          algo_insights?: Json | null
          benchmark_text?: string | null
          best_clips?: Json | null
          biggest_issue_body?: string | null
          biggest_issue_title?: string | null
          caption_score?: number | null
          created_at?: string | null
          current_step?: number | null
          current_step_label?: string | null
          emotion_score?: number | null
          error?: string | null
          fix_suggestions?: Json | null
          hook_score?: number | null
          id?: string
          optimized_storage_path?: string | null
          overall_score?: number | null
          pacing_score?: number | null
          status?: string | null
          user_id?: string | null
          verdict?: string | null
          video_id?: string | null
          visual_clarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_analyses_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          filename: string | null
          id: string
          niche: string | null
          platform: string | null
          status: string | null
          storage_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          filename?: string | null
          id?: string
          niche?: string | null
          platform?: string | null
          status?: string | null
          storage_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          filename?: string | null
          id?: string
          niche?: string | null
          platform?: string | null
          status?: string | null
          storage_path?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      osb_analysis_dashboard: {
        Row: {
          analysis_date: string | null
          avg_confidence: number | null
          bia_compliant_count: number | null
          complete_forms_count: number | null
          form_number: string | null
          form_title: string | null
          high_risk_count: number | null
          low_risk_count: number | null
          medium_risk_count: number | null
          osb_compliant_count: number | null
          total_analyses: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_task_by_expertise: {
        Args: { form_number?: string; task_id: string }
        Returns: string
      }
      get_risk_summary: {
        Args: { analysis_uuid: string }
        Returns: {
          critical_issues: string[]
          risk_count: number
          risk_level: string
        }[]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
