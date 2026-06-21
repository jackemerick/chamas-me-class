import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getActiveOrgId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId);
  return cookieStore.get("active_org")?.value ?? memberships?.[0]?.org_id ?? null;
}
