import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for subscriptions and reads)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for inserts with service role)
export const getSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Sticker {
  id: string
  sticker_url: string // URL to image in Supabase Storage
  description: string
  embedding: number[]
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      emoji: {
        Row: Sticker
        Insert: Omit<Sticker, 'id' | 'created_at'>
        Update: Partial<Omit<Sticker, 'id' | 'created_at'>>
      }
    }
    Functions: {
      emoji_semantic_search: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: Array<Sticker & { similarity: number }>
      }
    }
  }
}
