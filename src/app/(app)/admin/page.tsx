import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { InviteForm } from "@/components/admin/invite-form";
import { MembersList } from "@/components/admin/members-list";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id);

  const activeOrgId = cookieStore.get("active_org")?.value ?? memberships?.[0]?.org_id;
  const myMember = memberships?.find(m => m.org_id === activeOrgId) ?? memberships?.[0];

  if (!myMember || myMember.role !== "admin") redirect("/dashboard");

  // Busca membros da org
  const { data: members } = await admin
    .from("org_members")
    .select("id, role, user_id, created_at")
    .eq("org_id", myMember.org_id)
    .order("created_at");

  // Busca perfis dos membros
  const userIds = members?.map(m => m.user_id) ?? [];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  // Busca emails via auth admin
  const authUsers = await Promise.all(
    userIds.map(id => admin.auth.admin.getUserById(id))
  );
  const emailMap = Object.fromEntries(
    authUsers.map(r => [r.data.user?.id, r.data.user?.email ?? ""])
  );
  const nameMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p.full_name ?? ""])
  );

  const membersData = (members ?? []).map(m => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    name: nameMap[m.user_id] || "Sem nome",
    email: emailMap[m.user_id] || "",
    created_at: m.created_at,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Administração</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie membros da sua igreja.</p>
      </div>

      <InviteForm />

      <MembersList members={membersData} currentUserId={user.id} orgId={myMember.org_id} />
    </div>
  );
}
