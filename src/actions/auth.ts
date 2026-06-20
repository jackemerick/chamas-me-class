"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("E-mail invalido"),
});

// Envia magic link via Supabase Auth (configurado para usar Resend como SMTP)
export async function sendMagicLink(formData: FormData) {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("Erro ao enviar magic link:", error.message);
    return { error: "Nao foi possivel enviar o link. Tente novamente." };
  }

  return { success: true };
}

// Encerra a sessao do usuario
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
