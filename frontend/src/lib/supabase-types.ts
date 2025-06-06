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
      bots: {
        Row: {
          bot_token: string
          bot_username: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          media_type: Database["public"]["Enums"]["media_type_enum"] | null
          media_url: string | null
          name: string | null
          updated_at: string
          user_id: string
          vip_chat_id: string | null
          vip_name: string | null
          vip_type: string | null
          welcome_text: string | null
        }
        Insert: {
          bot_token: string
          bot_username: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type_enum"] | null
          media_url?: string | null
          name?: string | null
          updated_at?: string
          user_id: string
          vip_chat_id?: string | null
          vip_name?: string | null
          vip_type?: string | null
          welcome_text?: string | null
        }
        Update: {
          bot_token?: string
          bot_username?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type_enum"] | null
          media_url?: string | null
          name?: string | null
          updated_at?: string
          user_id?: string
          vip_chat_id?: string | null
          vip_name?: string | null
          vip_type?: string | null
          welcome_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          bot_id: string
          created_at: string
          duration_days: number
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          duration_days: number
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          duration_days?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          access_expires_at: string | null
          amount_received: number | null
          bot_id: string
          created_at: string
          id: string
          plan_id: string
          pushinpay_payment_id: string | null
          status: Database["public"]["Enums"]["sale_status_enum"]
          updated_at: string
          user_telegram_id: string
        }
        Insert: {
          access_expires_at?: string | null
          amount_received?: number | null
          bot_id: string
          created_at?: string
          id?: string
          plan_id: string
          pushinpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["sale_status_enum"]
          updated_at?: string
          user_telegram_id: string
        }
        Update: {
          access_expires_at?: string | null
          amount_received?: number | null
          bot_id?: string
          created_at?: string
          id?: string
          plan_id?: string
          pushinpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["sale_status_enum"]
          updated_at?: string
          user_telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          id: string
          nome: string | null
          pushinpay_token: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          pushinpay_token?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          pushinpay_token?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bot_sales_stats: {
        Args: { bot_uuid: string }
        Returns: {
          total_sales: number
          pending_sales: number
          paid_sales: number
          cancelled_sales: number
          total_revenue: number
        }[]
      }
      get_sales_by_period: {
        Args: { bot_uuid: string; start_date?: string; end_date?: string }
        Returns: {
          sale_date: string
          sales_count: number
          revenue: number
        }[]
      }
      get_user_profile: {
        Args: { user_uuid?: string }
        Returns: {
          id: string
          email: string
          pushinpay_token: string
          created_at: string
          updated_at: string
          email_confirmed_at: string
          last_sign_in_at: string
        }[]
      }
      user_can_access_bot: {
        Args: { bot_uuid: string; user_uuid?: string }
        Returns: boolean
      }
    }
    Enums: {
      media_type_enum: "photo" | "video"
      sale_status_enum: "pending" | "paid" | "cancelled"
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
      media_type_enum: ["photo", "video"],
      sale_status_enum: ["pending", "paid", "cancelled"],
    },
  },
} as const 