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

  let classIds: string[] = [];
  if (myRole === "admin" || myRole === "superadmin") {
    const { data } = await admin.from("classes").select("id").eq("org_id", activeOrgId);
    classIds = data?.map(c => c.id) ?? [];
  } else {
    const { data } = await admin.from("class_teachers").select("class_id").eq("user_id", user.id);
    classIds = data?.map(c => c.class_id) ?? [];
  }

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const to = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split("T")[0];

  const { data: meetings } = classIds.length > 0
    ? await admin
        .from("meetings")
        .select("id, date, theme, class_id, concluded")
        .in("class_id", classIds)
        .gte("date", from)
        .lte("date", to)
        .order("date")
    : { data: [] };

  const { data: classes } = myRole === "admin" || myRole === "superadmin"
    ? await admin.from("classes").select("id, name").eq("org_id", activeOrgId).order("name")
    : await admin.from("classes").select("id, name").in("id", classIds).order("name");

  const meetingClassIds = [...new Set((meetings ?? []).map(m => m.class_id))];
  const { data: classNames } = meetingClassIds.length > 0
    ? await admin.from("classes").select("id, name").in("id", meetingClassIds)
    : { data: [] };
  const classNameMap = Object.fromEntries((classNames ?? []).map(c => [c.id, c.name]));

  const meetingsFormatted = (meetings ?? []).map(m => ({
    id: m.id,
    date: m.date,
    theme: m.theme,
    class_id: m.class_id,
    class_name: classNameMap[m.class_id] ?? "",
    concluded: m.concluded ?? false,
  }));

  const today = now.toISOString().split("T")[0];
  const nextMeeting = meetingsFormatted.find(m => m.date >= today) ?? null;

  return (
    <AgendaClient
      meetings={meetingsFormatted}
      nextMeeting={nextMeeting}
      classes={classes ?? []}
    />
  );
}
