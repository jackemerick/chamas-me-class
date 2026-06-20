"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  member_id: z.string().uuid(),
  org_id: z.string().uuid(),
  new_role: z.enum(["admin", "member"]),
});

const removeSchema = z.object({
  member_id: z.string().uuid(),
  org_id: z.string().uuid(),
});

async function verificarAdmin(userId: string, orgId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("org_members")
    .select("role")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .single();
  return data?.role === "admin";
}

export async function alterarRole(formData: FormData) {
  const parsed = roleSchema.safeParse({
    member_id: formData.get("member_id"),
    org_id: formData.get("org_id"),
    new_role: formData.get("new_role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const isAdmin = await verificarAdmin(user.id, parsed.data.org_id);
  if (!isAdmin) return { error: "Sem permissão." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("org_members")
    .update({ role: parsed.data.new_role })
    .eq("id", parsed.data.member_id)
    .eq("org_id", parsed.data.org_id);

  if (error) return { error: "Erro ao alterar papel." };
  revalidatePath("/admin");
  return { success: true };
}

export async function removerMembro(formData: FormData) {
  const parsed = removeSchema.safeParse({
    member_id: formData.get("member_id"),
    org_id: formData.get("org_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const isAdmin = await verificarAdmin(user.id, parsed.data.org_id);
  if (!isAdmin) return { error: "Sem permissão." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("org_members")
    .delete()
    .eq("id", parsed.data.member_id)
    .eq("org_id", parsed.data.org_id);

  if (error) return { error: "Erro ao remover membro." };
  revalidatePath("/admin");
  return { success: true };
}

const classAssignSchema = z.object({
  user_id: z.string().uuid(),
  class_id: z.string().uuid(),
  org_id: z.string().uuid(),
});

export async function vincularClasse(formData: FormData) {
  const parsed = classAssignSchema.safeParse({
    user_id: formData.get("user_id"),
    class_id: formData.get("class_id"),
    org_id: formData.get("org_id"),
  });
  if (!parsed.success) return { error: "Dados inválidos." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const isAdmin = await verificarAdmin(user.id, parsed.data.org_id);
  if (!isAdmin) return { error: "Sem permissão." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_teachers")
    .upsert({ class_id: parsed.data.class_id, user_id: parsed.data.user_id, added_by: user.id });

  if (error) return { error: "Erro ao vincular classe." };
  revalidatePath("/admin");
  return { success: true };
}

export async function desvincularClasse(formData: FormData) {
  const parsed = classAssignSchema.safeParse({
    user_id: formData.get("user_id"),
    class_id: formData.get("class_id"),
    org_id: formData.get("org_id"),
  });
  if (!parsed.success) return { error: "Dados inválidos." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const isAdmin = await verificarAdmin(user.id, parsed.data.org_id);
  if (!isAdmin) return { error: "Sem permissão." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("class_teachers")
    .delete()
    .eq("class_id", parsed.data.class_id)
    .eq("user_id", parsed.data.user_id);

  if (error) return { error: "Erro ao desvincular classe." };
  revalidatePath("/admin");
  return { success: true };
}
