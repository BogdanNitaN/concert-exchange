import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let instance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!instance) {
    instance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return instance
}

export const supabase = getSupabase()
