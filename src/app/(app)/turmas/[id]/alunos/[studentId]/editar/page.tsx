import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StudentForm } from "@/components/alunos/student-form";

export const metadata: Metadata = { title: "Editar aluno" };

export default async function EditarAlunoPage({ params }: { params: Promise<{ id: string; studentId: string }> }) {
  const { id, studentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: student } = await admin
    .from("students")
    .select("id, name, birthdate, city, responsible_name, responsible_phone, class_id")
    .eq("id", studentId)
    .eq("class_id", id)
    .single();

  if (!student) notFound();

  const { data: cls } = await admin.from("classes").select("org_id, name").eq("id", id).single();
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
        <h1 className="text-2xl font-bold">Editar aluno</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{student.name}</p>
      </div>
      <StudentForm
        mode="edit"
        classId={id}
        defaultValues={{
          id: student.id,
          name: student.name,
          birthdate: student.birthdate ?? "",
          city: student.city ?? "",
          responsible_name: student.responsible_name ?? "",
          responsible_phone: student.responsible_phone ?? "",
        }}
      />
    </div>
  );
}
