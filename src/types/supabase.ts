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
      pipeline_stages: {
        Row: {
          auto_email_template: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          recruiter_id: string
          stage_color: string | null
          stage_name: string
          stage_order: number
          updated_at: string | null
        }
        Insert: {
          auto_email_template?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          recruiter_id: string
          stage_color?: string | null
          stage_name: string
          stage_order: number
          updated_at?: string | null
        }
        Update: {
          auto_email_template?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          recruiter_id?: string
          stage_color?: string | null
          stage_name?: string
          stage_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bee_status: Database["public"]["Enums"]["bee_level"] | null
          bio: string | null
          completion_score: number | null
          created_at: string | null
          email: string
          first_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          is_deleted: boolean | null
          languages: Database["public"]["Enums"]["sa_language"][] | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          province: Database["public"]["Enums"]["sa_province"] | null
          reelpass_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          sa_id_number: string | null
          tax_number: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          website: string | null
          work_permit_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bee_status?: Database["public"]["Enums"]["bee_level"] | null
          bio?: string | null
          completion_score?: number | null
          created_at?: string | null
          email: string
          first_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          is_deleted?: boolean | null
          languages?: Database["public"]["Enums"]["sa_language"][] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          province?: Database["public"]["Enums"]["sa_province"] | null
          reelpass_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          sa_id_number?: string | null
          tax_number?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          website?: string | null
          work_permit_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bee_status?: Database["public"]["Enums"]["bee_level"] | null
          bio?: string | null
          completion_score?: number | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          is_deleted?: boolean | null
          languages?: Database["public"]["Enums"]["sa_language"][] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          province?: Database["public"]["Enums"]["sa_province"] | null
          reelpass_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          sa_id_number?: string | null
          tax_number?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          website?: string | null
          work_permit_status?: string | null
        }
        Relationships: []
      }
      candidate_pipeline_positions: {
        Row: {
          candidate_id: string
          created_at: string | null
          current_stage_id: string
          id: string
          job_posting_id: string | null
          moved_at: string | null
          moved_by: string | null
          notes: string | null
          previous_stage_id: string | null
          recruiter_id: string
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          current_stage_id: string
          id?: string
          job_posting_id?: string | null
          moved_at?: string | null
          moved_by?: string | null
          notes?: string | null
          previous_stage_id?: string | null
          recruiter_id: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          current_stage_id?: string
          id?: string
          job_posting_id?: string | null
          moved_at?: string | null
          moved_by?: string | null
          notes?: string | null
          previous_stage_id?: string | null
          recruiter_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: "admin" | "candidate" | "recruiter"
      sa_province: "Eastern Cape" | "Free State" | "Gauteng" | "KwaZulu-Natal" | "Limpopo" | "Mpumalanga" | "Northern Cape" | "North West" | "Western Cape"
      bee_level: "Level 1" | "Level 2" | "Level 3" | "Level 4" | "Exempted Micro Enterprise" | "Qualifying Small Enterprise" | "Not Applicable"
      sa_language: "Afrikaans" | "English" | "Zulu" | "Xhosa" | "Sotho" | "Tswana" | "Pedi" | "Venda" | "Tsonga" | "Swati" | "Ndebele"
      availability_status: "available" | "employed" | "unavailable"
    }
    CompositeTypes: Record<string, never>
  }
} 