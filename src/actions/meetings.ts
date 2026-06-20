"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

const meetingSchema = z.object({
  class_id: z.string().uuid("Selecione uma classe"),
  date: z.string().min(1, "Informe a data"),
  theme: z.string().min(1, "Informe o tema").max(120),
  recurrence: z.enum(["none", "weekly", "biweekly", "monthly"]).default("none"),
  recurrence_end_date: z.string().optional(),
  responsible_user_id: z.string().uuid().optional(),
  music_url: z.string().url("URL inválida").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function criarEncontro(formData: FormData) {
  const raw = {
    class_id: formData.get("class_id"),
    date: formData.get("date"),
    theme: formData.get("theme"),
    recurrence: formData.get("recurrence") || "none",
    recurrence_end_date: formData.get("recurrence_end_date") || undefined,
    responsible_user_id: formData.get("responsible_user_id") || undefined,
    music_url: formData.get("music_url") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = meetingSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const d = parsed.data;

  // Se tem recorrência, gera as datas
  const dates = gerarDatas(d.date, d.recurrence, d.recurrence_end_date);

  const inserts = dates.map((date) => ({
    class_id: d.class_id,
    date,
    theme: d.theme,
    recurrence: d.recurrence,
    recurrence_end_date: d.recurrence_end_date ?? null,
    responsible_user_id: d.responsible_user_id ?? null,
    music_url: d.music_url || null,
    notes: d.notes ?? null,
    created_by: user.id,
    updated_by: user.id,
  }));

  const { error } = await admin.from("meetings").insert(inserts);
  if (error) { console.error(error); return { error: "Erro ao criar encontro." }; }

  revalidatePath("/agenda");
  redirect("/agenda");
}

export async function editarEncontro(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID inválido." };

  const parsed = meetingSchema.safeParse({
    class_id: formData.get("class_id"),
    date: formData.get("date"),
    theme: formData.get("theme"),
    recurrence: formData.get("recurrence") || "none",
    recurrence_end_date: formData.get("recurrence_end_date") || undefined,
    responsible_user_id: formData.get("responsible_user_id") || undefined,
    music_url: formData.get("music_url") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const d = parsed.data;

  const { error } = await admin.from("meetings").update({
    date: d.date,
    theme: d.theme,
    recurrence: d.recurrence,
    recurrence_end_date: d.recurrence_end_date ?? null,
    responsible_user_id: d.responsible_user_id ?? null,
    music_url: d.music_url || null,
    notes: d.notes ?? null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: "Erro ao salvar." };

  revalidatePath("/agenda");
  redirect("/agenda");
}

export async function excluirEncontro(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID inválido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  await admin.from("meetings").delete().eq("id", id);

  revalidatePath("/agenda");
  redirect("/agenda");
}

// Busca titulo da musica a partir da URL (YouTube, Spotify, etc.)
export async function buscarTituloMusica(url: string): Promise<{ title: string | null }> {
  try {
    // YouTube oEmbed
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const apiUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        return { title: data.title ?? null };
      }
    }
    // Spotify — pega do og:title via fetch da pagina
    if (url.includes("spotify.com")) {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await res.text();
      const match = html.match(/<title>([^<]+)<\/title>/);
      if (match) return { title: match[1].replace(" | Spotify", "").trim() };
    }
    return { title: null };
  } catch {
    return { title: null };
  }
}

function gerarDatas(
  startDate: string,
  recurrence: string,
  endDate?: string
): string[] {
  if (recurrence === "none" || !endDate) return [startDate];

  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  const intervalDays = recurrence === "weekly" ? 7 : recurrence === "biweekly" ? 14 : 0;

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    if (recurrence === "monthly") {
      current.setMonth(current.getMonth() + 1);
    } else {
      current.setDate(current.getDate() + intervalDays);
    }
    if (dates.length > 52) break; // seguranca: max 1 ano de semanal
  }

  return dates;
}
