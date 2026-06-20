"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  org: z.string().uuid().optional(),
});

export async function salvarPerfil(formData: FormData) {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    org: formData.get("org") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert({ id: user.id, full_name: parsed.data.full_name, updated_at: new Date().toISOString() });

  if (error) return { error: "Erro ao salvar. Tente novamente." };

  redirect("/dashboard");
}

export async function atualizarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const full_name = (formData.get("full_name") as string)?.trim();
  if (!full_name || full_name.length < 2) return { error: "Nome deve ter pelo menos 2 caracteres." };
  if (full_name.length > 80) return { error: "Nome muito longo." };

  const photoFile = formData.get("photo") as File | null;
  let avatar_url: string | undefined;

  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > 1024 * 1024) return { error: "Foto deve ter no máximo 1MB." };
    if (!photoFile.type.startsWith("image/")) return { error: "Arquivo deve ser uma imagem." };

    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const path = `avatars/${user.id}.${ext}`;
    const bytes = await photoFile.arrayBuffer();

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("profiles")
      .upload(path, bytes, { contentType: photoFile.type, upsert: true });

    if (uploadError) return { error: "Erro ao fazer upload da foto." };

    const { data: { publicUrl } } = admin.storage.from("profiles").getPublicUrl(path);
    avatar_url = publicUrl;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").upsert({
    id: user.id,
    full_name,
    updated_at: new Date().toISOString(),
    ...(avatar_url ? { avatar_url } : {}),
  });
  if (error) return { error: "Erro ao salvar perfil." };

  revalidatePath("/perfil");
  return { success: true };
}

export async function buscarPerfil() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return { email: user.email ?? "", full_name: data?.full_name ?? "", avatar_url: data?.avatar_url ?? null };
}
