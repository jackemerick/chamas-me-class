import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("class_id");
  if (!classId) return NextResponse.json({ teachers: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const admin = createAdminClient();

  // Busca professores vinculados à turma
  const { data: links } = await admin
    .from("class_teachers")
    .select("user_id")
    .eq("class_id", classId);

  if (!links?.length) return NextResponse.json({ teachers: [] });

  const userIds = links.map((l) => l.user_id);

  // Busca perfis
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  // Busca emails
  const authUsers = await Promise.all(
    userIds.map((id) => admin.auth.admin.getUserById(id))
  );
  const emailMap = Object.fromEntries(
    authUsers.map((r) => [r.data.user?.id, r.data.user?.email ?? ""])
  );
  const nameMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? ""])
  );

  const teachers = userIds.map((id) => ({
    id,
    name: nameMap[id] || "",
    email: emailMap[id] || "",
  }));

  return NextResponse.json({ teachers });
}
