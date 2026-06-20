"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface ClassDashboard {
  id: string;
  name: string;
  group_label: string | null;
  studentCount: number;
  attendanceAvg: number | null;   // % média de presença (0-100)
  planTotal: number;               // total de aulas planejadas
  planCompleted: number;           // aulas concluídas
  completionPct: number | null;    // % conclusão (0-100)
}

export interface NextMeetingDash {
  id: string;
  date: string;
  theme: string | null;
  class_name: string;
}

export async function buscarDadosDashboard() {
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

  // Classes visíveis: admin vê todas, professor só as suas
  let classIds: string[] = [];
  if (isAdmin) {
    const { data: allClasses } = await admin
      .from("classes")
      .select("id")
      .eq("org_id", orgId);
    classIds = allClasses?.map(c => c.id) ?? [];
  } else {
    const { data: myClasses } = await admin
      .from("class_teachers")
      .select("class_id")
      .eq("user_id", user.id);
    classIds = myClasses?.map(c => c.class_id) ?? [];
  }

  if (classIds.length === 0) return { classes: [], nextMeetings: [] };

  // Dados base das classes
  const { data: classes } = await admin
    .from("classes")
    .select("id, name, group_label")
    .in("id", classIds)
    .order("name");

  // Alunos por classe
  const { data: students } = await admin
    .from("students")
    .select("id, class_id")
    .in("class_id", classIds);

  // Encontros passados para calcular presença
  const today = new Date().toISOString().split("T")[0];
  const { data: pastMeetings } = await admin
    .from("meetings")
    .select("id, class_id")
    .in("class_id", classIds)
    .lte("date", today);

  // Presença de todos esses encontros
  const meetingIds = pastMeetings?.map(m => m.id) ?? [];
  const { data: attendance } = meetingIds.length > 0
    ? await admin.from("attendance").select("meeting_id, status").in("meeting_id", meetingIds)
    : { data: [] };

  // Planejamento
  const { data: plans } = await admin
    .from("class_plans")
    .select("id, class_id, completed")
    .in("class_id", classIds);

  // Próximos encontros (max 5)
  const { data: nextMeetingsRaw } = await admin
    .from("meetings")
    .select("id, date, theme, class_id")
    .in("class_id", classIds)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(5);

  // Monta dashboard por classe
  const classMap = new Map(classes?.map(c => [c.id, c]) ?? []);

  const classDashboards: ClassDashboard[] = (classes ?? []).map(cls => {
    const studentCount = students?.filter(s => s.class_id === cls.id).length ?? 0;

    // Presença média
    const clsMeetings = pastMeetings?.filter(m => m.class_id === cls.id) ?? [];
    let attendanceAvg: number | null = null;
    if (clsMeetings.length > 0 && studentCount > 0) {
      const totalExpected = clsMeetings.length * studentCount;
      const totalPresent = attendance?.filter(a =>
        clsMeetings.some(m => m.id === a.meeting_id) && a.status === "present"
      ).length ?? 0;
      attendanceAvg = Math.round((totalPresent / totalExpected) * 100);
    }

    // Planejamento
    const clsPlans = plans?.filter(p => p.class_id === cls.id) ?? [];
    const planTotal = clsPlans.length;
    const planCompleted = clsPlans.filter(p => p.completed).length;
    const completionPct = planTotal > 0 ? Math.round((planCompleted / planTotal) * 100) : null;

    return {
      id: cls.id,
      name: cls.name,
      group_label: cls.group_label,
      studentCount,
      attendanceAvg,
      planTotal,
      planCompleted,
      completionPct,
    };
  });

  const nextMeetings: NextMeetingDash[] = (nextMeetingsRaw ?? []).map(m => ({
    id: m.id,
    date: m.date,
    theme: m.theme,
    class_name: classMap.get(m.class_id)?.name ?? "",
  }));

  return { classes: classDashboards, nextMeetings };
}
