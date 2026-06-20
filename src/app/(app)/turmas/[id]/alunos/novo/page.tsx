import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StudentForm } from "@/components/alunos/student-form";

export const metadata: Metadata = { title: "Novo aluno" };

export default async function NovoAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: cls } = await admin.from("classes").select("id, name, org_id").eq("id", id).single();
  if (!cls) notFound();

  const { data: member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", cls.org_id)
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo aluno</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{cls.name}</p>
      </div>
      <StudentForm mode="create" classId={id} />
    </div>
  );
}
