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
      content_ideas: {
        Row: {
          analysis: string | null
          analysis_status: string
          created_at: string
          description: string | null
          id: number
          project_status: string
          raw_content: string | null
          score: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: string | null
          analysis_status: string
          created_at?: string
          description?: string | null
          id?: number
          project_status: string
          raw_content?: string | null
          score?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: string | null
          analysis_status?: string
          created_at?: string
          description?: string | null
          id?: number
          project_status?: string
          raw_content?: string | null
          score?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_insights: {
        Row: {
          content: string | null
          created_at: string
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      detailed_content_ideas: {
        Row: {
          analysis: string | null
          analysis_status: string | null
          created_at: string | null
          id: number | null
          project_status: string | null
          score: number | null
          title: string | null
          user_email: string | null
          user_id: string | null
        }
      }
    }
    Functions: {
      request_content_analysis: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
