import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criar uma única instância global
const supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

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
          id: string
          user_id: string
          bot_token: string
          bot_username: string
          name: string | null
          description: string | null
          welcome_text: string | null
          media_url: string | null
          media_type: 'photo' | 'video' | null
          vip_chat_id: string | null
          vip_type: 'group' | 'channel' | null
          vip_name: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bot_token: string
          bot_username: string
          name?: string | null
          description?: string | null
          welcome_text?: string | null
          media_url?: string | null
          media_type?: 'photo' | 'video' | null
          vip_chat_id?: string | null
          vip_type?: 'group' | 'channel' | null
          vip_name?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bot_token?: string
          bot_username?: string
          name?: string | null
          description?: string | null
          welcome_text?: string | null
          media_url?: string | null
          media_type?: 'photo' | 'video' | null
          vip_chat_id?: string | null
          vip_type?: 'group' | 'channel' | null
          vip_name?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          bot_id: string
          name: string
          price: number
          duration_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bot_id: string
          name: string
          price: number
          duration_days: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bot_id?: string
          name?: string
          price?: number
          duration_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          bot_id: string
          user_telegram_id: string
          plan_id: string
          status: 'pending' | 'paid' | 'cancelled' | 'expired'
          pushinpay_payment_id: string | null
          amount_received: number | null
          access_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bot_id: string
          user_telegram_id: string
          plan_id: string
          status?: 'pending' | 'paid' | 'cancelled' | 'expired'
          pushinpay_payment_id?: string | null
          amount_received?: number | null
          access_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bot_id?: string
          user_telegram_id?: string
          plan_id?: string
          status?: 'pending' | 'paid' | 'cancelled' | 'expired'
          pushinpay_payment_id?: string | null
          amount_received?: number | null
          access_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          pushinpay_token: string | null
          cpf: string | null
          nome: string | null
          telefone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          pushinpay_token?: string | null
          cpf?: string | null
          nome?: string | null
          telefone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          pushinpay_token?: string | null
          cpf?: string | null
          nome?: string | null
          telefone?: string | null
          created_at?: string
          updated_at?: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
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
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export function createClient() {
  return supabaseInstance
} 