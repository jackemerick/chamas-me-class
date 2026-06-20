import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { AlunosClient } from "@/components/alunos/alunos-client";

export const metadata: Metadata = { title: "Alunos" };

function calcAge(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default async function AlunosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id);

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

  const { data: classes } = await admin
    .from("classes")
    .select("id, name")
    .in("id", classIds)
    .order("name");

  const { data: studentsRaw } = classIds.length > 0
    ? await admin
        .from("students")
        .select("id, name, birthdate, city, class_id")
        .in("class_id", classIds)
        .order("name")
    : { data: [] };

  const classMap = new Map(classes?.map(c => [c.id, c.name]) ?? []);

  const students = (studentsRaw ?? []).map(s => ({
    id: s.id,
    name: s.name,
    birthdate: s.birthdate,
    city: s.city,
    class_id: s.class_id,
    class_name: classMap.get(s.class_id) ?? "",
    age: calcAge(s.birthdate),
  }));

  return (
    <AlunosClient
      students={students}
      classes={classes?.map(c => ({ id: c.id, name: c.name })) ?? []}
    />
  );
}
