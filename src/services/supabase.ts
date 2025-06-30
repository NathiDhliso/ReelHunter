import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log Supabase environment variables presence (truncate keys for security)
console.log('[Supabase] Initializing client', {
  hasUrl: !!supabaseUrl,
  anonKeyPrefix: supabaseAnonKey ? supabaseAnonKey.slice(0, 6) + '...' : null
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)