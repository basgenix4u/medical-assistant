// src/lib/supabase/client.ts
// Re-exports the local backend client under the legacy "@/lib/supabase/client"
// import path so existing code (auth-context, database.ts, etc.) keeps working.

export { createClient, getSupabaseClient } from "@/lib/local/client";
