
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
      media: {
        Row: {
          id: string
          name: string
          type: string
          url: string
          userId: string
          interactions: number
          timeSlotEnd: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          url: string
          userId: string
          interactions?: number
          timeSlotEnd?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          url?: string
          userId?: string
          interactions?: number
          timeSlotEnd?: string | null
          created_at?: string
        }
      }
      active_media: {
        Row: {
          id: string
          media_id: string | null
          controller_id: string
          activated_at: string
        }
        Insert: {
          id?: string
          media_id?: string | null
          controller_id: string
          activated_at?: string
        }
        Update: {
          id?: string
          media_id?: string | null
          controller_id?: string
          activated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_media_interaction: {
        Args: {
          media_id: string
        }
        Returns: undefined
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
