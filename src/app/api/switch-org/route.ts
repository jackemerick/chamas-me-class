import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId obrigatório" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  // Verifica se o usuario realmente é membro dessa org
  const admin = createAdminClient();
  const { data: member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Sem acesso" }, { status: 403 });

  const cookieStore = await cookies();
  cookieStore.set("active_org", orgId, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });

  return NextResponse.json({ ok: true });
}
