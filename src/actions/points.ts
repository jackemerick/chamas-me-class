"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  class_id: z.string().uuid(),
  name: z.string().min(1).max(80),
  default_value: z.coerce.number().int().min(1).max(9999),
});

export async function criarCategoria(formData: FormData) {
  const parsed = categorySchema.safeParse({
    class_id: formData.get("class_id"),
    name: formData.get("name"),
    default_value: formData.get("default_value"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin.from("point_categories").insert(parsed.data);
  if (error) return { error: "Erro ao criar categoria." };

  revalidatePath("/pontos");
  return { success: true };
}

export async function editarCategoria(formData: FormData) {
  const id = formData.get("id") as string;
  const parsed = categorySchema.safeParse({
    class_id: formData.get("class_id"),
    name: formData.get("name"),
    default_value: formData.get("default_value"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("point_categories")
    .update({ name: parsed.data.name, default_value: parsed.data.default_value })
    .eq("id", id);
  if (error) return { error: "Erro ao editar categoria." };

  revalidatePath("/pontos");
  return { success: true };
}

export async function excluirCategoria(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  await admin.from("point_categories").delete().eq("id", id);
  revalidatePath("/pontos");
  return { success: true };
}

export async function registrarPontoManual(formData: FormData) {
  const parsed = z.object({
    student_id: z.string().uuid(),
    class_id: z.string().uuid(),
    value: z.coerce.number().int().min(1).max(9999),
    reason: z.string().min(1).max(120),
  }).safeParse({
    student_id: formData.get("student_id"),
    class_id: formData.get("class_id"),
    value: formData.get("value"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin.from("points").insert({ ...parsed.data, recorded_by: user.id });
  if (error) return { error: "Erro ao registrar pontos." };

  revalidatePath("/pontos");
  return { success: true };
}
