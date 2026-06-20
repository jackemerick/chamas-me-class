"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
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

  if (error) {
    console.error("Erro ao salvar perfil:", error);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  redirect("/dashboard");
}
