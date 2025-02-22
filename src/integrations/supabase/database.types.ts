
export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          content: string | null
          content_type: string
          created_at: string | null
          file_path: string
          filename: string
          id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_type: string
          created_at?: string | null
          file_path: string
          filename: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string | null
          file_path?: string
          filename?: string
          id?: string
          updated_at?: string | null
        }
      }
      message_usage: {
        Row: {
          message_count: number | null
          id: string
          user_id: string
          created_at: string | null
          last_message_at: string | null
        }
        Insert: {
          message_count?: number | null
          id?: string
          user_id: string
          created_at?: string | null
          last_message_at?: string | null
        }
        Update: {
          message_count?: number | null
          id?: string
          user_id?: string
          created_at?: string | null
          last_message_at?: string | null
        }
      }
      profiles: {
        Row: {
          username: string | null
          id: string
          updated_at: string | null
          avatar_url: string | null
        }
        Insert: {
          username?: string | null
          id: string
          updated_at?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          id?: string
          updated_at?: string | null
          avatar_url?: string | null
        }
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          started_at: string | null
          user_id: string
          id: string
          trial_end_at: string | null
          plan_type: string
          status: string
          created_at: string | null
        }
        Insert: {
          expires_at?: string | null
          started_at?: string | null
          user_id: string
          id?: string
          trial_end_at?: string | null
          plan_type: string
          status: string
          created_at?: string | null
        }
        Update: {
          expires_at?: string | null
          started_at?: string | null
          user_id?: string
          id?: string
          trial_end_at?: string | null
          plan_type?: string
          status?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updateables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

