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
      availability_updates: {
        Row: {
          availability_status: Database["public"]["Enums"]["availability_status"]
          available_from: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location_preferences: string[] | null
          notes: string | null
          notice_period_days: number | null
          preferred_work_type: string | null
          profile_id: string
          salary_expectation_max: number | null
          salary_expectation_min: number | null
          updated_at: string | null
        }
        Insert: {
          availability_status: Database["public"]["Enums"]["availability_status"]
          available_from?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_preferences?: string[] | null
          notes?: string | null
          notice_period_days?: number | null
          preferred_work_type?: string | null
          profile_id: string
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: Database["public"]["Enums"]["availability_status"]
          available_from?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_preferences?: string[] | null
          notes?: string | null
          notice_period_days?: number | null
          preferred_work_type?: string | null
          profile_id?: string
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_updates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "availability_updates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_updates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "availability_updates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      candidate_communications: {
        Row: {
          candidate_id: string
          clicked_at: string | null
          communication_type: string
          created_at: string | null
          delivery_status: string | null
          id: string
          message_content: string
          opened_at: string | null
          recruiter_id: string
          replied_at: string | null
          sent_at: string | null
          subject: string | null
          trigger_event: string
        }
        Insert: {
          candidate_id: string
          clicked_at?: string | null
          communication_type: string
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          message_content: string
          opened_at?: string | null
          recruiter_id: string
          replied_at?: string | null
          sent_at?: string | null
          subject?: string | null
          trigger_event: string
        }
        Update: {
          candidate_id?: string
          clicked_at?: string | null
          communication_type?: string
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          message_content?: string
          opened_at?: string | null
          recruiter_id?: string
          replied_at?: string | null
          sent_at?: string | null
          subject?: string | null
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_communications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "candidate_communications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_communications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidate_communications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "candidate_communications_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "candidate_communications_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_communications_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidate_communications_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "candidate_pipeline_positions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_previous_stage_id_fkey"
            columns: ["previous_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidate_pipeline_positions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_email: string
          candidate_name: string
          created_at: string | null
          duration_minutes: number
          id: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          interviewers: string[]
          location: string | null
          meeting_id: string | null
          meeting_url: string | null
          notes: string | null
          recruiter_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["interview_status"]
          timezone: string
          updated_at: string | null
        }
        Insert: {
          candidate_email: string
          candidate_name: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          interviewers?: string[]
          location?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          recruiter_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["interview_status"]
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          candidate_email?: string
          candidate_name?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          interview_type?: Database["public"]["Enums"]["interview_type"]
          interviewers?: string[]
          location?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          recruiter_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["interview_status"]
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "interviews_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "interviews_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company: string
          created_at: string | null
          currency: string | null
          description: string
          employment_type: string | null
          id: string
          is_active: boolean | null
          location: string | null
          recruiter_id: string
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          currency?: string | null
          description: string
          employment_type?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          recruiter_id: string
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          employment_type?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          recruiter_id?: string
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      persona_analyses: {
        Row: {
          analysis_date: string | null
          assessment_data: Json
          communication_style: Json | null
          confidence_score: number | null
          created_at: string | null
          cultural_fit: Json | null
          emotional_intelligence: Json | null
          id: string
          profile_id: string
          updated_at: string | null
          work_style: Json | null
        }
        Insert: {
          analysis_date?: string | null
          assessment_data?: Json
          communication_style?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          cultural_fit?: Json | null
          emotional_intelligence?: Json | null
          id?: string
          profile_id: string
          updated_at?: string | null
          work_style?: Json | null
        }
        Update: {
          analysis_date?: string | null
          assessment_data?: Json
          communication_style?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          cultural_fit?: Json | null
          emotional_intelligence?: Json | null
          id?: string
          profile_id?: string
          updated_at?: string | null
          work_style?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "persona_analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "persona_analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "pipeline_stages_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "pipeline_stages_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
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
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          live_url: string | null
          profile_id: string
          start_date: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          live_url?: string | null
          profile_id: string
          start_date?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          live_url?: string | null
          profile_id?: string
          start_date?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      recruiter_scorecards: {
        Row: {
          candidate_id: string
          communication_rating: number
          company_name: string | null
          created_at: string | null
          dispute_date: string | null
          dispute_details: string | null
          dispute_reason: string | null
          feedback_text: string | null
          id: string
          is_disputed: boolean | null
          is_public: boolean | null
          job_title: string | null
          overall_rating: number | null
          professionalism_rating: number
          recruiter_id: string
          role_accuracy_rating: number
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          communication_rating: number
          company_name?: string | null
          created_at?: string | null
          dispute_date?: string | null
          dispute_details?: string | null
          dispute_reason?: string | null
          feedback_text?: string | null
          id?: string
          is_disputed?: boolean | null
          is_public?: boolean | null
          job_title?: string | null
          overall_rating?: number | null
          professionalism_rating: number
          recruiter_id: string
          role_accuracy_rating: number
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          communication_rating?: number
          company_name?: string | null
          created_at?: string | null
          dispute_date?: string | null
          dispute_details?: string | null
          dispute_reason?: string | null
          feedback_text?: string | null
          id?: string
          is_disputed?: boolean | null
          is_public?: boolean | null
          job_title?: string | null
          overall_rating?: number | null
          professionalism_rating?: number
          recruiter_id?: string
          role_accuracy_rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_scorecards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "recruiter_scorecards_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          role_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          role_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          role_name?: string
        }
        Relationships: []
      }
      sa_bee_verifications: {
        Row: {
          bee_level: Database["public"]["Enums"]["bee_level"]
          certificate_number: string | null
          created_at: string | null
          enterprise_development_score: number | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          management_score: number | null
          ownership_score: number | null
          profile_id: string
          skills_development_score: number | null
          socioeconomic_development_score: number | null
          total_score: number | null
          updated_at: string | null
          verification_agency: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          bee_level: Database["public"]["Enums"]["bee_level"]
          certificate_number?: string | null
          created_at?: string | null
          enterprise_development_score?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          management_score?: number | null
          ownership_score?: number | null
          profile_id: string
          skills_development_score?: number | null
          socioeconomic_development_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          verification_agency: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          bee_level?: Database["public"]["Enums"]["bee_level"]
          certificate_number?: string | null
          created_at?: string | null
          enterprise_development_score?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          management_score?: number | null
          ownership_score?: number | null
          profile_id?: string
          skills_development_score?: number | null
          socioeconomic_development_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          verification_agency?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sa_bee_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_bee_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_bee_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_bee_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sa_education_verifications: {
        Row: {
          completion_date: string | null
          created_at: string | null
          id: string
          institution_name: string
          institution_verified: boolean | null
          nqf_level: number | null
          profile_id: string
          qualification_title: string
          qualification_type: string | null
          saqa_id: string | null
          saqa_verified: boolean | null
          updated_at: string | null
          verification_reference: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          id?: string
          institution_name: string
          institution_verified?: boolean | null
          nqf_level?: number | null
          profile_id: string
          qualification_title: string
          qualification_type?: string | null
          saqa_id?: string | null
          saqa_verified?: boolean | null
          updated_at?: string | null
          verification_reference?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          id?: string
          institution_name?: string
          institution_verified?: boolean | null
          nqf_level?: number | null
          profile_id?: string
          qualification_title?: string
          qualification_type?: string | null
          saqa_id?: string | null
          saqa_verified?: boolean | null
          updated_at?: string | null
          verification_reference?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sa_education_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_education_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_education_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_education_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sa_employment_verifications: {
        Row: {
          created_at: string | null
          dol_reference: string | null
          employer_name: string
          employer_registration_number: string | null
          employment_end_date: string | null
          employment_start_date: string
          employment_type: string | null
          id: string
          job_title: string
          profile_id: string
          salary_verified: boolean | null
          sars_reference: string | null
          tax_certificate_verified: boolean | null
          uif_contributions_verified: boolean | null
          updated_at: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          created_at?: string | null
          dol_reference?: string | null
          employer_name: string
          employer_registration_number?: string | null
          employment_end_date?: string | null
          employment_start_date: string
          employment_type?: string | null
          id?: string
          job_title: string
          profile_id: string
          salary_verified?: boolean | null
          sars_reference?: string | null
          tax_certificate_verified?: boolean | null
          uif_contributions_verified?: boolean | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          created_at?: string | null
          dol_reference?: string | null
          employer_name?: string
          employer_registration_number?: string | null
          employment_end_date?: string | null
          employment_start_date?: string
          employment_type?: string | null
          id?: string
          job_title?: string
          profile_id?: string
          salary_verified?: boolean | null
          sars_reference?: string | null
          tax_certificate_verified?: boolean | null
          uif_contributions_verified?: boolean | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sa_employment_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_employment_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_employment_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_employment_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sa_government_verifications: {
        Row: {
          agency: Database["public"]["Enums"]["sa_government_agency"]
          created_at: string | null
          expiry_date: string | null
          id: string
          metadata: Json | null
          profile_id: string
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string | null
          verification_date: string | null
          verification_id: string
          verification_score: number | null
          verification_type: Database["public"]["Enums"]["sa_verification_type"]
          verified_data: Json | null
        }
        Insert: {
          agency: Database["public"]["Enums"]["sa_government_agency"]
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          profile_id: string
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string | null
          verification_date?: string | null
          verification_id: string
          verification_score?: number | null
          verification_type: Database["public"]["Enums"]["sa_verification_type"]
          verified_data?: Json | null
        }
        Update: {
          agency?: Database["public"]["Enums"]["sa_government_agency"]
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string | null
          verification_date?: string | null
          verification_id?: string
          verification_score?: number | null
          verification_type?: Database["public"]["Enums"]["sa_verification_type"]
          verified_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sa_government_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_government_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_government_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_government_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sa_identity_verifications: {
        Row: {
          biometric_verified: boolean | null
          created_at: string | null
          home_affairs_verified: boolean | null
          id: string
          id_number: string
          id_type: string
          profile_id: string
          updated_at: string | null
          verification_date: string | null
          verification_reference: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          biometric_verified?: boolean | null
          created_at?: string | null
          home_affairs_verified?: boolean | null
          id?: string
          id_number: string
          id_type?: string
          profile_id: string
          updated_at?: string | null
          verification_date?: string | null
          verification_reference?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          biometric_verified?: boolean | null
          created_at?: string | null
          home_affairs_verified?: boolean | null
          id?: string
          id_number?: string
          id_type?: string
          profile_id?: string
          updated_at?: string | null
          verification_date?: string | null
          verification_reference?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sa_identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sa_professional_licenses: {
        Row: {
          cpd_compliant: boolean | null
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          license_number: string
          license_type: string
          professional_body: string
          profile_id: string
          registration_category: string | null
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string | null
          verification_reference: string | null
        }
        Insert: {
          cpd_compliant?: boolean | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          license_number: string
          license_type: string
          professional_body: string
          profile_id: string
          registration_category?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string | null
          verification_reference?: string | null
        }
        Update: {
          cpd_compliant?: boolean | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          license_number?: string
          license_type?: string
          professional_body?: string
          profile_id?: string
          registration_category?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string | null
          verification_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sa_professional_licenses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_professional_licenses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_professional_licenses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_professional_licenses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      sa_seta_certifications: {
        Row: {
          certificate_number: string | null
          completion_date: string | null
          created_at: string | null
          credits_achieved: number | null
          id: string
          profile_id: string
          qualification_title: string
          seta_name: string
          seta_verified: boolean | null
          unit_standards: string[] | null
          updated_at: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          certificate_number?: string | null
          completion_date?: string | null
          created_at?: string | null
          credits_achieved?: number | null
          id?: string
          profile_id: string
          qualification_title: string
          seta_name: string
          seta_verified?: boolean | null
          unit_standards?: string[] | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          certificate_number?: string | null
          completion_date?: string | null
          created_at?: string | null
          credits_achieved?: number | null
          id?: string
          profile_id?: string
          qualification_title?: string
          seta_name?: string
          seta_verified?: boolean | null
          unit_standards?: string[] | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sa_seta_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "sa_seta_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sa_seta_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "sa_seta_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string | null
          id: string
          name: string
          proficiency: string | null
          profile_id: string
          updated_at: string | null
          verified: boolean | null
          video_demo_url: string | null
          video_verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          proficiency?: string | null
          profile_id: string
          updated_at?: string | null
          verified?: boolean | null
          video_demo_url?: string | null
          video_verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          proficiency?: string | null
          profile_id?: string
          updated_at?: string | null
          verified?: boolean | null
          video_demo_url?: string | null
          video_verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "live_candidate_availability"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "recruiter_ratings_summary"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sa_reelpass_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_role_id"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      live_candidate_availability: {
        Row: {
          availability_status:
            | Database["public"]["Enums"]["availability_status"]
            | null
          availability_updated_at: string | null
          available_from: string | null
          bee_status: Database["public"]["Enums"]["bee_level"] | null
          candidate_id: string | null
          email: string | null
          first_name: string | null
          headline: string | null
          last_name: string | null
          location_preferences: string[] | null
          notice_period_days: number | null
          preferred_work_type: string | null
          province: Database["public"]["Enums"]["sa_province"] | null
          reelpass_score: number | null
          salary_expectation_max: number | null
          salary_expectation_min: number | null
          verification_status: string | null
        }
        Relationships: []
      }
      recruiter_ratings_summary: {
        Row: {
          avg_communication: number | null
          avg_professionalism: number | null
          avg_role_accuracy: number | null
          email: string | null
          first_name: string | null
          last_name: string | null
          negative_reviews: number | null
          overall_rating: number | null
          positive_reviews: number | null
          recruiter_id: string | null
          total_reviews: number | null
        }
        Relationships: []
      }
      sa_reelpass_status: {
        Row: {
          bee_status: Database["public"]["Enums"]["bee_level"] | null
          email: string | null
          first_name: string | null
          last_name: string | null
          persona_assessed: boolean | null
          persona_confidence_score: number | null
          profile_id: string | null
          province: Database["public"]["Enums"]["sa_province"] | null
          reelpass_score: number | null
          reelpass_status: string | null
          user_id: string | null
          verified_bee_count: number | null
          verified_education_count: number | null
          verified_employment_count: number | null
          verified_identity_checks: number | null
          verified_license_count: number | null
          verified_seta_count: number | null
          verified_skill_count: number | null
          video_verified_skills: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_sa_reelpass_score: {
        Args: { candidate_profile_id: string }
        Returns: number
      }
      is_user_role: {
        Args: { p_role_name: string }
        Returns: boolean
      }
      update_profile_details: {
        Args: { p_username?: string; p_avatar_url?: string }
        Returns: {
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
      }
    }
    Enums: {
      availability_status: "available" | "open" | "not-looking"
      bee_level:
        | "level_1"
        | "level_2"
        | "level_3"
        | "level_4"
        | "level_5"
        | "level_6"
        | "level_7"
        | "level_8"
        | "non_compliant"
      interview_status: "scheduled" | "completed" | "cancelled" | "rescheduled"
      interview_type: "video" | "phone" | "in-person"
      sa_government_agency:
        | "home_affairs"
        | "sars"
        | "saps"
        | "saqa"
        | "department_labour"
        | "department_education"
        | "professional_councils"
        | "seta_bodies"
        | "bee_verification_agencies"
      sa_language:
        | "afrikaans"
        | "english"
        | "ndebele"
        | "northern_sotho"
        | "sotho"
        | "swazi"
        | "tsonga"
        | "tswana"
        | "venda"
        | "xhosa"
        | "zulu"
      sa_province:
        | "eastern_cape"
        | "free_state"
        | "gauteng"
        | "kwazulu_natal"
        | "limpopo"
        | "mpumalanga"
        | "northern_cape"
        | "north_west"
        | "western_cape"
      sa_verification_type:
        | "id_verification"
        | "tax_clearance"
        | "criminal_record"
        | "credit_check"
        | "education_saqa"
        | "professional_registration"
        | "seta_certification"
        | "bee_certificate"
      user_role: "candidate" | "recruiter" | "admin"
      verification_status:
        | "pending"
        | "verified"
        | "failed"
        | "expired"
        | "revoked"
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
      availability_status: ["available", "open", "not-looking"],
      bee_level: [
        "level_1",
        "level_2",
        "level_3",
        "level_4",
        "level_5",
        "level_6",
        "level_7",
        "level_8",
        "non_compliant",
      ],
      interview_status: ["scheduled", "completed", "cancelled", "rescheduled"],
      interview_type: ["video", "phone", "in-person"],
      sa_government_agency: [
        "home_affairs",
        "sars",
        "saps",
        "saqa",
        "department_labour",
        "department_education",
        "professional_councils",
        "seta_bodies",
        "bee_verification_agencies",
      ],
      sa_language: [
        "afrikaans",
        "english",
        "ndebele",
        "northern_sotho",
        "sotho",
        "swazi",
        "tsonga",
        "tswana",
        "venda",
        "xhosa",
        "zulu",
      ],
      sa_province: [
        "eastern_cape",
        "free_state",
        "gauteng",
        "kwazulu_natal",
        "limpopo",
        "mpumalanga",
        "northern_cape",
        "north_west",
        "western_cape",
      ],
      sa_verification_type: [
        "id_verification",
        "tax_clearance",
        "criminal_record",
        "credit_check",
        "education_saqa",
        "professional_registration",
        "seta_certification",
        "bee_certificate",
      ],
      user_role: ["candidate", "recruiter", "admin"],
      verification_status: [
        "pending",
        "verified",
        "failed",
        "expired",
        "revoked",
      ],
    },
  },
} as const
