"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

const createSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

export async function criarAula(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = createSchema.safeParse({
    class_id: formData.get("class_id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: "Dados inválidos." };

  const admin = createAdminClient();

  // Próximo order_index
  const { data: last } = await admin
    .from("class_plans")
    .select("order_index")
    .eq("class_id", parsed.data.class_id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const order_index = (last?.order_index ?? -1) + 1;

  const { error } = await admin.from("class_plans").insert({
    class_id: parsed.data.class_id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    order_index,
    created_by: user.id,
  });

  if (error) return { error: "Erro ao criar aula." };
  revalidatePath(`/turmas/${parsed.data.class_id}/planejamento`);
  revalidatePath("/dashboard");
}

export async function marcarAulaConcluida(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true";
  const classId = formData.get("class_id") as string;

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_plans")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: "Erro ao atualizar aula." };
  revalidatePath(`/turmas/${classId}/planejamento`);
  revalidatePath("/dashboard");
}

export async function salvarNotasAula(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const notes = formData.get("notes") as string;
  const classId = formData.get("class_id") as string;

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_plans")
    .update({ notes })
    .eq("id", id);

  if (error) return { error: "Erro ao salvar notas." };
  revalidatePath(`/turmas/${classId}/planejamento`);
}

export async function excluirAula(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const classId = formData.get("class_id") as string;

  const admin = createAdminClient();
  const { error } = await admin.from("class_plans").delete().eq("id", id);

  if (error) return { error: "Erro ao excluir aula." };
  revalidatePath(`/turmas/${classId}/planejamento`);
  revalidatePath("/dashboard");
}

export async function reordenarAulas(classId: string, orderedIds: string[]) {
  const admin = createAdminClient();
  await Promise.all(
    orderedIds.map((id, idx) =>
      admin.from("class_plans").update({ order_index: idx }).eq("id", id)
    )
  );
  revalidatePath(`/turmas/${classId}/planejamento`);
}
