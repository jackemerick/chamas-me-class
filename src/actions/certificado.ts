"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const criterioSchema = z.object({
  class_id: z.string().uuid(),
  temporada: z.string().min(1).max(60),
  min_attendance_pct: z.coerce.number().int().min(0).max(100),
  min_points: z.coerce.number().int().min(0),
  titulo: z.string().min(1).max(120),
  texto_livre: z.string().max(800).optional(),
  assinatura_nome: z.string().max(80).optional(),
  assinatura_cargo: z.string().max(60).optional(),
  data_emissao: z.string().optional(),
});

export async function salvarCriterioCertificado(formData: FormData) {
  const parsed = criterioSchema.safeParse({
    class_id: formData.get("class_id"),
    temporada: formData.get("temporada"),
    min_attendance_pct: formData.get("min_attendance_pct"),
    min_points: formData.get("min_points"),
    titulo: formData.get("titulo"),
    texto_livre: formData.get("texto_livre"),
    assinatura_nome: formData.get("assinatura_nome"),
    assinatura_cargo: formData.get("assinatura_cargo"),
    data_emissao: formData.get("data_emissao"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  // Upload do background se enviado
  let background_url: string | undefined;
  const file = formData.get("background_file") as File | null;
  if (file && file.size > 0) {
    if (file.size > 1_048_576) return { error: "A imagem de fundo deve ter no máximo 1MB." };
    if (!file.type.startsWith("image/")) return { error: "Formato inválido. Envie uma imagem." };

    const bytes = await file.arrayBuffer();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `cert-backgrounds/${parsed.data.class_id}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("profiles")
      .upload(path, bytes, { upsert: true, contentType: file.type });

    if (uploadError) return { error: "Erro ao fazer upload da imagem." };

    const { data: urlData } = admin.storage.from("profiles").getPublicUrl(path);
    background_url = urlData.publicUrl;
  }

  const payload = {
    ...parsed.data,
    ...(background_url ? { background_url } : {}),
  };

  const { error } = await admin
    .from("cert_criteria")
    .upsert(payload, { onConflict: "class_id" });

  if (error) return { error: "Erro ao salvar critérios." };

  revalidatePath(`/turmas/${parsed.data.class_id}/certificado`);
  return { success: true };
}

export async function removerBackgroundCertificado(classId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  // Remove arquivos possíveis (png, jpg, jpeg, webp)
  await Promise.allSettled(
    ["png", "jpg", "jpeg", "webp"].map(ext =>
      admin.storage.from("profiles").remove([`cert-backgrounds/${classId}.${ext}`])
    )
  );

  await admin.from("cert_criteria").update({ background_url: null }).eq("class_id", classId);
  revalidatePath(`/turmas/${classId}/certificado`);
  return { success: true };
}

export async function buscarCriterioCertificado(classId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cert_criteria")
    .select("*")
    .eq("class_id", classId)
    .maybeSingle();
  return data;
}

export async function buscarElegibilidade(classId: string) {
  const admin = createAdminClient();

  const [{ data: criteria }, { data: students }, { data: meetings }, { data: attendance }, { data: points }] = await Promise.all([
    admin.from("cert_criteria").select("*").eq("class_id", classId).maybeSingle(),
    admin.from("students").select("id, name").eq("class_id", classId).order("name"),
    admin.from("meetings").select("id").eq("class_id", classId).eq("concluded", true),
    admin.from("attendance").select("student_id, status").in(
      "meeting_id",
      (await admin.from("meetings").select("id").eq("class_id", classId).eq("concluded", true)).data?.map(m => m.id) ?? []
    ),
    admin.from("points").select("student_id, value").eq("class_id", classId),
  ]);

  if (!students) return { criteria: null, elegibility: [] };

  const totalMeetings = meetings?.length ?? 0;

  const presencaMap: Record<string, number> = {};
  for (const a of attendance ?? []) {
    if (a.status === "present") presencaMap[a.student_id] = (presencaMap[a.student_id] ?? 0) + 1;
  }

  const pointsMap: Record<string, number> = {};
  for (const p of points ?? []) {
    pointsMap[p.student_id] = (pointsMap[p.student_id] ?? 0) + p.value;
  }

  const elegibility = students.map(s => {
    const presencas = presencaMap[s.id] ?? 0;
    const pct = totalMeetings > 0 ? Math.round((presencas / totalMeetings) * 100) : 0;
    const pts = pointsMap[s.id] ?? 0;
    const minPct = criteria?.min_attendance_pct ?? 0;
    const minPts = criteria?.min_points ?? 0;
    const elegivel = pct >= minPct && pts >= minPts;

    return { id: s.id, name: s.name, presencas, pct, pts, elegivel };
  });

  return { criteria, elegibility, totalMeetings };
}
