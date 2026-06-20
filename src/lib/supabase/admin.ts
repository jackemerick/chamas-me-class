import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cliente com service_role — bypassa RLS
// Usar APENAS em server actions e route handlers, nunca no client
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
