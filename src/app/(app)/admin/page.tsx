import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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

  const [
    { data: members },
    { data: classes },
    { data: classTeachers },
  ] = await Promise.all([
    admin.from("org_members").select("id, role, user_id, created_at").eq("org_id", myMember.org_id).order("created_at"),
    admin.from("classes").select("id, name").eq("org_id", myMember.org_id).order("name"),
    admin.from("class_teachers").select("class_id, user_id"),
  ]);

  const userIds = members?.map(m => m.user_id) ?? [];
  const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", userIds);

  const authUsers = await Promise.all(userIds.map(id => admin.auth.admin.getUserById(id)));
  const emailMap = Object.fromEntries(authUsers.map(r => [r.data.user?.id, r.data.user?.email ?? ""]));
  const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name ?? ""]));

  // Mapa user_id → lista de class_ids vinculados
  const teacherClassMap: Record<string, string[]> = {};
  for (const ct of classTeachers ?? []) {
    if (!teacherClassMap[ct.user_id]) teacherClassMap[ct.user_id] = [];
    teacherClassMap[ct.user_id].push(ct.class_id);
  }

  const membersData = (members ?? []).map(m => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    name: nameMap[m.user_id] || "Sem nome",
    email: emailMap[m.user_id] || "",
    created_at: m.created_at,
    assignedClasses: teacherClassMap[m.user_id] ?? [],
  }));

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Administração</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Gerencie membros de suas classes.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <InviteForm />
        <MembersList
          members={membersData}
          currentUserId={user.id}
          orgId={myMember.org_id}
          classes={classes?.map(c => ({ id: c.id, name: c.name })) ?? []}
        />
      </Box>

      {/* Rodapé legal */}
      <Box sx={{ mt: 6, pt: 3, borderTop: "1px solid", borderColor: "divider", textAlign: "center" }}>
        <Typography variant="caption" color="text.disabled">
          <Link href="/privacidade" style={{ color: "inherit", textDecoration: "underline" }}>
            Privacidade e Segurança
          </Link>
          {" · "}
          <Link href="/termos" style={{ color: "inherit", textDecoration: "underline" }}>
            Termos de Uso
          </Link>
          {" · "}
          contato@jackemerick.com.br
        </Typography>
      </Box>
    </Box>
  );
}
