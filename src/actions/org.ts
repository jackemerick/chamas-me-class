"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { redirect } from "next/navigation";

const createOrgSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80),
  slug: z
    .string()
    .min(2, "Identificador deve ter ao menos 2 caracteres")
    .max(40)
    .regex(
      /^[a-z0-9-]+$/,
      "Apenas letras minúsculas, números e hífens"
    ),
});

const joinOrgSchema = z.object({
  slug: z.string().min(2, "Identificador inválido"),
});

// Cria uma nova organizacao e adiciona o usuario como admin
export async function createOrg(formData: FormData) {
  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  // Verifica se o slug ja existe
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", parsed.data.slug)
    .single();

  if (existing) {
    return { error: "Esse identificador já está em uso. Escolha outro." };
  }

  // Cria a org via admin (bypassa RLS no setup inicial)
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      created_by: user.id,
    })
    .select()
    .single();

  if (orgError || !org) {
    console.error("Erro ao criar org:", orgError);
    return { error: "Erro ao criar sua igreja. Tente novamente." };
  }

  // Adiciona o criador como admin
  const { error: memberError } = await admin.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "admin",
    invited_by: user.id,
  });

  if (memberError) {
    console.error("Erro ao adicionar membro:", memberError);
    return { error: "Igreja criada, mas houve um erro ao configurar seu acesso. Contate o suporte." };
  }

  redirect("/dashboard");
}

// Entra em uma organizacao existente pelo slug (como member)
export async function joinOrg(formData: FormData) {
  const parsed = joinOrgSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  // Busca a org pelo slug
  const { data: org } = await admin
    .from("organizations")
    .select("id, name")
    .eq("slug", parsed.data.slug)
    .single();

  if (!org) {
    return { error: "Igreja não encontrada. Verifique o código." };
  }

  // Verifica se ja e membro
  const { data: existing } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    redirect("/dashboard");
  }

  // Adiciona como member
  const { error } = await admin.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "member",
  });

  if (error) {
    console.error("Erro ao entrar na org:", error);
    return { error: "Erro ao entrar na igreja. Tente novamente." };
  }

  redirect("/dashboard");
}
