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
      admin_settings: {
        Row: {
          created_at: string
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      citation_contributors: {
        Row: {
          citation_id: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          middle_name: string | null
          role: string
          suffix: string | null
        }
        Insert: {
          citation_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          role: string
          suffix?: string | null
        }
        Update: {
          citation_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          role?: string
          suffix?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citation_contributors_citation_id_fkey"
            columns: ["citation_id"]
            isOneToOne: false
            referencedRelation: "citations"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          accessed_date: string | null
          created_at: string | null
          doi: string | null
          id: string
          isbn: string | null
          publication_date: string | null
          publisher: string | null
          title: string
          type: Database["public"]["Enums"]["citation_type"]
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          accessed_date?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          isbn?: string | null
          publication_date?: string | null
          publisher?: string | null
          title: string
          type: Database["public"]["Enums"]["citation_type"]
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_date?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          isbn?: string | null
          publication_date?: string | null
          publisher?: string | null
          title?: string
          type?: Database["public"]["Enums"]["citation_type"]
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          payment_customer_id: string | null
          payment_processor: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          payment_customer_id?: string | null
          payment_processor?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          payment_customer_id?: string | null
          payment_processor?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          content_type: string
          created_at: string | null
          current_version: number | null
          file_path: string
          filename: string
          id: string
          updated_at: string | null
          user_id: string | null
          versions: Json | null
        }
        Insert: {
          content?: string | null
          content_type: string
          created_at?: string | null
          current_version?: number | null
          file_path: string
          filename: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
          versions?: Json | null
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string | null
          current_version?: number | null
          file_path?: string
          filename?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
          versions?: Json | null
        }
        Relationships: []
      }
      message_usage: {
        Row: {
          created_at: string | null
          daily_message_count: number | null
          id: string
          initial_messages_used: number | null
          last_daily_reset: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_message_count?: number | null
          id?: string
          initial_messages_used?: number | null
          last_daily_reset?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_message_count?: number | null
          id?: string
          initial_messages_used?: number | null
          last_daily_reset?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_products: {
        Row: {
          active: boolean | null
          created_at: string
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string | null
          name: string
          payment_price_id: string
          payment_processor_id: string
          paypal_product_id: string | null
          price: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          name: string
          payment_price_id: string
          payment_processor_id: string
          paypal_product_id?: string | null
          price?: number
        }
        Update: {
          active?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          name?: string
          payment_price_id?: string
          payment_processor_id?: string
          paypal_product_id?: string | null
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          expires_at: string | null
          id: string
          is_student: boolean | null
          payment_price_id: string | null
          payment_processor: string | null
          payment_subscription_id: string | null
          plan_type: string
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          trial_end_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          is_student?: boolean | null
          payment_price_id?: string | null
          payment_processor?: string | null
          payment_subscription_id?: string | null
          plan_type: string
          started_at?: string | null
          status: string
          stripe_customer_id?: string | null
          trial_end_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          is_student?: boolean | null
          payment_price_id?: string | null
          payment_processor?: string | null
          payment_subscription_id?: string | null
          plan_type?: string
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          trial_end_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stripe_product"
            columns: ["payment_price_id"]
            isOneToOne: false
            referencedRelation: "payment_products"
            referencedColumns: ["payment_price_id"]
          },
          {
            foreignKeyName: "subscriptions_payment_price_id_fkey"
            columns: ["payment_price_id"]
            isOneToOne: false
            referencedRelation: "payment_products"
            referencedColumns: ["payment_price_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      citation_type: "website" | "book" | "journal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
