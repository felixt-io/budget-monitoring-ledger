const hasSupabaseEnv = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !hasSupabaseEnv
