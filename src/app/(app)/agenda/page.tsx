import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { AgendaClient } from "@/components/agenda/agenda-client";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage() {
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
  const myRole = memberships?.find(m => m.org_id === activeOrgId)?.role ?? "member";

  if (!activeOrgId) redirect("/onboarding");

  // Turmas visíveis: admin vê todas, member vê só as suas
  let classIds: string[] = [];
  if (myRole === "admin") {
    const { data: allClasses } = await admin
      .from("classes")
      .select("id")
      .eq("org_id", activeOrgId);
    classIds = allClasses?.map(c => c.id) ?? [];
  } else {
    const { data: myClasses } = await admin
      .from("class_teachers")
      .select("class_id")
      .eq("user_id", user.id);
    classIds = myClasses?.map(c => c.class_id) ?? [];
  }

  // Busca encontros dos próximos 12 meses + passados do mês atual
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const to = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split("T")[0];

  const { data: meetings } = classIds.length > 0
    ? await admin
        .from("meetings")
        .select("id, date, theme, class_id")
        .in("class_id", classIds)
        .gte("date", from)
        .lte("date", to)
        .order("date")
    : { data: [] };

  // Turmas para o formulário
  const { data: classes } = myRole === "admin"
    ? await admin.from("classes").select("id, name").eq("org_id", activeOrgId).order("name")
    : await admin.from("classes").select("id, name").in("id", classIds).order("name");

  // Busca nomes das turmas separadamente para evitar problema de join nos tipos
  const meetingClassIds = [...new Set((meetings ?? []).map(m => m.class_id))];
  const { data: classNames } = meetingClassIds.length > 0
    ? await admin.from("classes").select("id, name").in("id", meetingClassIds)
    : { data: [] };
  const classNameMap = Object.fromEntries((classNames ?? []).map(c => [c.id, c.name]));

  const meetingsFormatted = (meetings ?? []).map(m => ({
    id: m.id,
    date: m.date,
    theme: m.theme,
    class_name: classNameMap[m.class_id] ?? "",
  }));

  const nextMeeting = meetingsFormatted.find(m => m.date >= now.toISOString().split("T")[0]) ?? null;

  return (
    <AgendaClient
      meetings={meetingsFormatted}
      nextMeeting={nextMeeting}
      classes={classes ?? []}
    />
  );
}
