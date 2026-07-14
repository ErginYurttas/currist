import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}

const globalForSupabase = globalThis as typeof globalThis & {
  curristSupabase?: SupabaseClient;
};

export const supabase =
  globalForSupabase.curristSupabase ??
  createClient(
    supabaseUrl,
    supabasePublishableKey
  );

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.curristSupabase = supabase;
}