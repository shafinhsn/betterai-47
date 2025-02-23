
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
          daily_message_count: number | null
          last_daily_reset: string | null
        }
        Insert: {
          message_count?: number | null
          id?: string
          user_id: string
          created_at?: string | null
          last_message_at?: string | null
          daily_message_count?: number | null
          last_daily_reset?: string | null
        }
        Update: {
          message_count?: number | null
          id?: string
          user_id?: string
          created_at?: string | null
          last_message_at?: string | null
          daily_message_count?: number | null
          last_daily_reset?: string | null
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
      stripe_products: {
        Row: {
          id: string
          name: string
          stripe_product_id: string
          stripe_price_id: string
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          stripe_product_id: string
          stripe_price_id: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          stripe_product_id?: string
          stripe_price_id?: string
          description?: string | null
          active?: boolean
          created_at?: string
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
          stripe_current_period_end: string | null
          is_student: boolean | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
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
          stripe_current_period_end?: string | null
          is_student?: boolean | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
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
          stripe_current_period_end?: string | null
          is_student?: boolean | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: 'admin' | 'user'
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'admin' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updateables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
