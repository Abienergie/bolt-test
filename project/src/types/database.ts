export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      consumption_data: {
        Row: {
          id: string
          prm: string
          date: string
          peak_hours: number
          off_peak_hours: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          prm: string
          date: string
          peak_hours: number
          off_peak_hours: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          prm?: string
          date?: string
          peak_hours?: number
          off_peak_hours?: number
          created_at?: string
          user_id?: string
        }
      }
      salespeople: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          active: boolean
          created_at: string
          last_login: string | null
          reset_token: string | null
          reset_token_expires: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          active?: boolean
          created_at?: string
          last_login?: string | null
          reset_token?: string | null
          reset_token_expires?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          active?: boolean
          created_at?: string
          last_login?: string | null
          reset_token?: string | null
          reset_token_expires?: string | null
        }
      }
      pricing_rules: {
        Row: {
          id: string
          salesperson_id: string
          rule_type: string
          value: number
          min_power: number
          max_power: number
          created_at: string
          active: boolean
        }
        Insert: {
          id?: string
          salesperson_id: string
          rule_type: string
          value: number
          min_power: number
          max_power: number
          created_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          salesperson_id?: string
          rule_type?: string
          value?: number
          min_power?: number
          max_power?: number
          created_at?: string
          active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_reset_token: {
        Args: { p_email: string }
        Returns: string
      }
      validate_reset_token: {
        Args: { p_token: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}