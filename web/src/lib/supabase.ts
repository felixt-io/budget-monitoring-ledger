import { createClient } from '@supabase/supabase-js'
import { isDemoMode } from './runtime'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  if (!isDemoMode) {
    throw new Error('Missing Supabase environment variables.')
  }
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
