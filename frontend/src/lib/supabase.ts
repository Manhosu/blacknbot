import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criar uma única instância global do cliente Supabase
const supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export const createClient = () => supabaseInstance

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nome: string | null
          telefone: string | null
          cpf: string | null
          pushinpay_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome?: string | null
          telefone?: string | null
          cpf?: string | null
          pushinpay_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          telefone?: string | null
          cpf?: string | null
          pushinpay_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bots: {
        Row: {
          id: string
          user_id: string
          bot_token: string
          bot_username: string
          welcome_text: string
          media_url: string | null
          media_type: 'photo' | 'video' | null
          vip_group_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bot_token: string
          bot_username: string
          welcome_text: string
          media_url?: string | null
          media_type?: 'photo' | 'video' | null
          vip_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bot_token?: string
          bot_username?: string
          welcome_text?: string
          media_url?: string | null
          media_type?: 'photo' | 'video' | null
          vip_group_id?: string | null
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
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 