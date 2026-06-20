import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

// Layout das rotas autenticadas -- verifica sessao e org do usuario
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca membership do usuario
  const { data: memberRow } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  // Busca dados da org separadamente para evitar problemas de join
  let org = null;
  if (memberRow) {
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("id, name, slug, logo_url, primary_color")
      .eq("id", memberRow.org_id)
      .single();
    org = orgRow;
  }

  const membership =
    memberRow && org
      ? { org_id: memberRow.org_id, role: memberRow.role, organizations: org }
      : null;

  return (
    <AppShell user={user} membership={membership}>
      {children}
    </AppShell>
  );
}
