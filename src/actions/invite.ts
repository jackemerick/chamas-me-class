"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

// Admin envia convite por e-mail
export async function enviarConvite(formData: FormData) {
  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

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
    return { error: "Apenas administradores podem enviar convites." };
  }

  const { data: org } = await admin
    .from("organizations")
    .select("id, name")
    .eq("id", member.org_id)
    .single();

  if (!org) return { error: "Igreja não encontrada." };

  const email = parsed.data.email.toLowerCase().trim();

  // Verifica se já é membro
  const { data: authUser } = await admin.auth.admin.listUsers();
  const existingAuthUser = authUser?.users?.find(u => u.email === email);
  if (existingAuthUser) {
    const { data: alreadyMember } = await admin
      .from("org_members")
      .select("id")
      .eq("org_id", org.id)
      .eq("user_id", existingAuthUser.id)
      .single();
    if (alreadyMember) return { error: "Este e-mail já faz parte da sua igreja." };
  }

  // Cria o token de convite (code gerado automaticamente pelo banco via gen_random_uuid)
  const { data: invite, error: inviteError } = await admin
    .from("invites")
    .insert({
      org_id: org.id,
      email,
      code: crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(),
      created_by: user.id,
    })
    .select("token")
    .single();

  if (inviteError || !invite) {
    console.error("Erro ao criar convite:", inviteError);
    return { error: "Erro ao gerar convite. Tente novamente." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/convite/${invite.token}`;

  const { error: emailError } = await resend.emails.send({
    from: "Chamas-me Class <class@chamas.me>",
    to: email,
    subject: `Você foi convidado para ${org.name} no Chamas-me Class`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <img src="${appUrl}/logo-min.svg" alt="Chamas-me Class" style="height: 36px; margin-bottom: 24px;" />
        <h2 style="color: #334035; margin: 0 0 8px;">Você foi convidado</h2>
        <p style="color: #555; margin: 0 0 24px;">
          Você recebeu um convite para entrar em <strong>${org.name}</strong> no Chamas-me Class.
        </p>
        <a
          href="${link}"
          style="display:inline-block; background:#334035; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600;"
        >
          Aceitar convite
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Este link expira em 7 dias e é de uso único.<br/>
          Se você não esperava este convite, pode ignorar este e-mail.
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Erro ao enviar e-mail:", emailError);
    return { error: "Convite criado, mas falhou ao enviar o e-mail. Tente novamente." };
  }

  return { success: true };
}

// Aceita o convite via token (chamado na rota /convite/[token])
export async function aceitarConvite(token: string) {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("id, org_id, email, used_by, expires_at")
    .eq("token", token)
    .single();

  if (!invite) return { error: "Link de convite inválido." };
  if (invite.used_by) return { error: "Este convite já foi usado." };
  if (new Date(invite.expires_at) < new Date()) return { error: "Este convite expirou. Peça um novo ao administrador." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Se não está logado: envia magic link com redirect de volta pro convite
  if (!user) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.signInWithOtp({
      email: invite.email ?? "",
      options: {
        emailRedirectTo: `${appUrl}/convite/${token}`,
      },
    });
    if (error) return { error: "Erro ao enviar link de acesso. Tente novamente." };
    return { needsLogin: true as const, email: invite.email ?? "" };
  }

  // Já logado: aceita o convite
  return await _processarConvite(invite, user.id);
}

async function _processarConvite(
  invite: { id: string; org_id: string; email: string | null },
  userId: string
) {
  const admin = createAdminClient();

  // Verifica se já é membro
  const { data: existing } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", invite.org_id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    const { error: memberError } = await admin.from("org_members").insert({
      org_id: invite.org_id,
      user_id: userId,
      role: "member",
      invited_by: userId,
    });
    if (memberError) {
      console.error("Erro ao aceitar convite:", memberError);
      return { error: "Erro ao entrar na igreja. Tente novamente." };
    }
  }

  // Marca como usado
  await admin
    .from("invites")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("id", invite.id);

  // Verifica se perfil está completo
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  if (!profile?.full_name) {
    return { redirectTo: `/perfil?org=${invite.org_id}` as string };
  }

  return { redirectTo: "/dashboard" as string };
}

// Mantido para compatibilidade com onboarding-flow (fluxo antigo de codigo)
export async function entrarComConvite(formData: FormData) {
  return { error: "Use o link de convite enviado por e-mail." };
}
