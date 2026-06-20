import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Busca todas as memberships do usuario
  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  // Qual org está ativa? Lê do cookie ou usa a primeira
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org")?.value ?? memberships[0].org_id;
  const activeMember = memberships.find(m => m.org_id === activeOrgId) ?? memberships[0];

  // Busca dados das orgs
  const orgIds = memberships.map(m => m.org_id);
  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, logo_url, primary_color")
    .in("id", orgIds);

  const activeOrg = orgs?.find(o => o.id === activeMember.org_id) ?? null;

  const membership = activeOrg
    ? { org_id: activeMember.org_id, role: activeMember.role, organizations: activeOrg }
    : null;

  if (!membership) redirect("/onboarding");

  return (
    <AppShell user={user} membership={membership} allOrgs={orgs ?? []}>
      {children}
    </AppShell>
  );
}
