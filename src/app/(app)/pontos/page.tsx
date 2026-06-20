import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PontosClient } from "@/components/pontos/pontos-client";

export const metadata: Metadata = { title: "Pontos" };

export default async function PontosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("org_members").select("org_id, role").eq("user_id", user.id);

  const orgId = cookieStore.get("active_org")?.value ?? memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const role = memberships?.find(m => m.org_id === orgId)?.role;
  const isAdmin = role === "admin" || role === "superadmin";

  // Classes visíveis
  let classIds: string[] = [];
  if (isAdmin) {
    const { data } = await admin.from("classes").select("id").eq("org_id", orgId);
    classIds = data?.map(c => c.id) ?? [];
  } else {
    const { data } = await admin.from("class_teachers").select("class_id").eq("user_id", user.id);
    classIds = data?.map(c => c.class_id) ?? [];
  }

  if (classIds.length === 0) {
    redirect("/dashboard");
  }

  const [{ data: classes }, { data: categories }, { data: pointsRaw }, { data: students }] = await Promise.all([
    admin.from("classes").select("id, name").in("id", classIds).order("name"),
    admin.from("point_categories").select("id, class_id, name, default_value").in("class_id", classIds).order("name"),
    admin.from("points").select("student_id, class_id, value").in("class_id", classIds),
    admin.from("students").select("id, name, class_id").in("class_id", classIds).order("name"),
  ]);

  // Agrupa pontos por student_id
  const totalsMap: Record<string, number> = {};
  for (const p of pointsRaw ?? []) {
    totalsMap[p.student_id] = (totalsMap[p.student_id] ?? 0) + p.value;
  }

  const classNameMap = Object.fromEntries((classes ?? []).map(c => [c.id, c.name]));

  // Ranking: alunos com pontos, ordenados por total desc
  const ranking = (students ?? [])
    .map(s => ({
      id: s.id,
      name: s.name,
      class_id: s.class_id,
      class_name: classNameMap[s.class_id] ?? "",
      total: totalsMap[s.id] ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <PontosClient
      classes={classes?.map(c => ({ id: c.id, name: c.name })) ?? []}
      categories={categories ?? []}
      ranking={ranking}
    />
  );
}
