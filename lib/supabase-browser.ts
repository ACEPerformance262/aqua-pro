import { createClient } from '@supabase/supabase-js'

// Anon-key client only — safe to bundle into client components.
// Kept separate from lib/supabase.ts so that file's service-role client
// (supabaseAdmin) can never end up reachable from a browser bundle.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
