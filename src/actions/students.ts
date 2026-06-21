"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  birthdate: z.string().optional(),
  city: z.string().max(80).optional(),
  responsible_name: z.string().max(100).optional(),
  responsible_phone: z.string().max(20).optional(),
});

// Verifica se ja existe aluno com mesmo nome + nascimento + cidade na mesma org
export async function verificarDuplicata(data: {
  name: string;
  birthdate?: string;
  city?: string;
  classId: string;
}): Promise<{ duplicate: boolean; student?: { id: string; name: string; class_name: string } }> {
  if (!data.birthdate) return { duplicate: false };

  const admin = createAdminClient();

  // Busca a org da turma
  const { data: cls } = await admin
    .from("classes")
    .select("org_id")
    .eq("id", data.classId)
    .single();

  if (!cls) return { duplicate: false };

  // Busca todas as turmas da org
  const { data: orgClasses } = await admin
    .from("classes")
    .select("id, name")
    .eq("org_id", cls.org_id);

  if (!orgClasses?.length) return { duplicate: false };

  const classIds = orgClasses.map((c) => c.id);

  // Busca aluno com mesmo nome + nascimento (+ cidade se informada)
  let query = admin
    .from("students")
    .select("id, name, class_id")
    .in("class_id", classIds)
    .ilike("name", data.name.trim())
    .eq("birthdate", data.birthdate);

  if (data.city?.trim()) {
    query = query.ilike("city", data.city.trim());
  }

  const { data: found } = await query.limit(1).single();

  if (!found) return { duplicate: false };

  const className = orgClasses.find((c) => c.id === found.class_id)?.name ?? "outra classe";
  return { duplicate: true, student: { id: found.id, name: found.name, class_name: className } };
}

export async function criarAluno(formData: FormData) {
  const classId = formData.get("class_id") as string;
  if (!classId) return { error: "Classe não informada." };

  const parsed = studentSchema.safeParse({
    name: formData.get("name"),
    birthdate: formData.get("birthdate") || undefined,
    city: formData.get("city") || undefined,
    responsible_name: formData.get("responsible_name") || undefined,
    responsible_phone: formData.get("responsible_phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("students").insert({
    class_id: classId,
    name: parsed.data.name.trim(),
    birthdate: parsed.data.birthdate ?? null,
    city: parsed.data.city?.trim() ?? null,
    responsible_name: parsed.data.responsible_name?.trim() ?? null,
    responsible_phone: parsed.data.responsible_phone?.trim() ?? null,
    created_by: user.id,
  }).select("id").single();

  if (error || !data) return { error: "Erro ao cadastrar aluno." };

  revalidatePath(`/turmas/${classId}`);
  redirect(`/turmas/${classId}/alunos/${data.id}`);
}

export async function vincularAluno(formData: FormData) {
  // Vincula aluno existente a uma nova turma (aluno em mais de uma turma)
  const studentId = formData.get("student_id") as string;
  const classId = formData.get("class_id") as string;
  if (!studentId || !classId) return { error: "Dados inválidos." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  // Verifica se o aluno ja esta na turma
  const { data: existing } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("class_id", classId)
    .single();

  if (existing) {
    redirect(`/turmas/${classId}/alunos/${studentId}`);
  }

  // Copia o aluno para a nova turma mantendo os dados
  const { data: original } = await admin
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (!original) return { error: "Aluno não encontrado." };

  const { data: novo, error } = await admin.from("students").insert({
    class_id: classId,
    name: original.name,
    birthdate: original.birthdate,
    city: original.city,
    responsible_name: original.responsible_name,
    responsible_phone: original.responsible_phone,
    created_by: user.id,
  }).select("id").single();

  if (error || !novo) return { error: "Erro ao vincular aluno." };

  revalidatePath(`/turmas/${classId}`);
  redirect(`/turmas/${classId}/alunos/${novo.id}`);
}

export async function editarAluno(formData: FormData) {
  const id = formData.get("id") as string;
  const classId = formData.get("class_id") as string;
  if (!id) return { error: "ID inválido." };

  const parsed = studentSchema.safeParse({
    name: formData.get("name"),
    birthdate: formData.get("birthdate") || undefined,
    city: formData.get("city") || undefined,
    responsible_name: formData.get("responsible_name") || undefined,
    responsible_phone: formData.get("responsible_phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  if (!classId) return { error: "Classe inválida." };

  const admin = createAdminClient();
  const { error } = await admin.from("students").update({
    name: parsed.data.name.trim(),
    birthdate: parsed.data.birthdate ?? null,
    city: parsed.data.city?.trim() ?? null,
    responsible_name: parsed.data.responsible_name?.trim() ?? null,
    responsible_phone: parsed.data.responsible_phone?.trim() ?? null,
  }).eq("id", id).eq("class_id", classId);

  if (error) return { error: "Erro ao salvar." };

  revalidatePath(`/turmas/${classId}/alunos/${id}`);
  redirect(`/turmas/${classId}/alunos/${id}`);
}

export async function excluirAluno(formData: FormData) {
  const id = formData.get("id") as string;
  const classId = formData.get("class_id") as string;
  if (!id) return { error: "ID inválido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin.from("students").delete().eq("id", id);
  if (error) return { error: "Erro ao excluir." };

  revalidatePath(`/turmas/${classId}`);
  redirect(`/turmas/${classId}`);
}
