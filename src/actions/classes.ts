"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  group_label: z.string().max(40).optional(),
});

async function getActiveOrgId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId);
  const activeOrgId = cookieStore.get("active_org")?.value ?? memberships?.[0]?.org_id;
  return activeOrgId ?? null;
}

export async function criarTurma(formData: FormData) {
  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    group_label: formData.get("group_label") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const orgId = await getActiveOrgId(user.id);
  if (!orgId) return { error: "Nenhuma igreja ativa." };

  const admin = createAdminClient();
  const { data, error } = await admin.from("classes").insert({
    org_id: orgId,
    name: parsed.data.name,
    group_label: parsed.data.group_label ?? null,
    created_by: user.id,
    updated_by: user.id,
  }).select("id").single();

  if (error || !data) return { error: "Erro ao criar turma." };

  revalidatePath("/dashboard");
  revalidatePath("/turmas");
  redirect(`/turmas/${data.id}`);
}

export async function editarTurma(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID inválido." };

  const parsed = classSchema.safeParse({
    name: formData.get("name"),
    group_label: formData.get("group_label") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin.from("classes").update({
    name: parsed.data.name,
    group_label: parsed.data.group_label ?? null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: "Erro ao salvar." };

  revalidatePath(`/turmas/${id}`);
  revalidatePath("/dashboard");
  redirect(`/turmas/${id}`);
}

export async function excluirTurma(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID inválido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin.from("classes").delete().eq("id", id);
  if (error) return { error: "Erro ao excluir turma." };

  revalidatePath("/dashboard");
  revalidatePath("/turmas");
  redirect("/dashboard");
}
