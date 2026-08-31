import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client with anon key (read-only via RLS)
// Used for Realtime subscriptions
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key);
}
