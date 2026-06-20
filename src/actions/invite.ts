"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

function gerarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Admin gera um codigo de convite para sua org
export async function criarConvite() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  const { data: member } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role !== "admin") {
    return { error: "Apenas administradores podem gerar convites." };
  }

  const code = gerarCodigo();

  const { data, error } = await admin
    .from("invites")
    .insert({
      org_id: member.org_id,
      code,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Erro ao criar convite:", error);
    return { error: "Erro ao gerar convite. Tente novamente." };
  }

  return { code: data.code };
}

const joinSchema = z.object({
  code: z.string().min(1, "Informe o código do convite"),
});

// Novo professor usa o codigo para entrar na org
export async function entrarComConvite(formData: FormData) {
  const parsed = joinSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const code = parsed.data.code.trim().toUpperCase();

  const { data: invite } = await admin
    .from("invites")
    .select("id, org_id, used_by, expires_at")
    .eq("code", code)
    .single();

  if (!invite) return { error: "Código inválido. Verifique e tente novamente." };
  if (invite.used_by) return { error: "Este convite já foi usado." };
  if (new Date(invite.expires_at) < new Date()) return { error: "Este convite expirou. Peça um novo ao administrador." };

  // Verifica se ja e membro
  const { data: existing } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", invite.org_id)
    .eq("user_id", user.id)
    .single();

  if (existing) redirect("/dashboard");

  // Adiciona como member
  const { error: memberError } = await admin.from("org_members").insert({
    org_id: invite.org_id,
    user_id: user.id,
    role: "member",
    invited_by: invite.org_id,
  });

  if (memberError) {
    console.error("Erro ao entrar com convite:", memberError);
    return { error: "Erro ao entrar na igreja. Tente novamente." };
  }

  // Marca convite como usado
  await admin
    .from("invites")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("id", invite.id);

  redirect("/dashboard");
}
