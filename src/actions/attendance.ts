"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const attendanceItemSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(["present", "absent", "justified"]),
  extra_points: z.number().int().min(0).max(9999).default(0),
  extra_reason: z.string().max(120).optional(),
});

const concludeSchema = z.object({
  meeting_id: z.string().uuid(),
  class_id: z.string().uuid(),
  attendance: z.array(attendanceItemSchema),
  // pontos automáticos de presença definidos pela config da classe
  presence_points: z.number().int().min(0).max(9999).default(10),
});

export async function concluirEncontro(payload: {
  meeting_id: string;
  class_id: string;
  attendance: { student_id: string; status: "present" | "absent" | "justified"; extra_points: number; extra_reason?: string }[];
  presence_points: number;
}) {
  const parsed = concludeSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const { meeting_id, class_id, attendance, presence_points } = parsed.data;

  // Upsert presença — um registro por aluno por encontro
  const attendanceRows = attendance.map(a => ({
    meeting_id,
    student_id: a.student_id,
    status: a.status,
    recorded_by: user.id,
  }));

  const { error: attError } = await admin
    .from("attendance")
    .upsert(attendanceRows, { onConflict: "meeting_id,student_id" });

  if (attError) return { error: "Erro ao salvar presença." };

  // Pontos de presença para quem está presente
  const pointRows: { student_id: string; class_id: string; value: number; reason: string; recorded_by: string }[] = [];

  for (const a of attendance) {
    if (a.status === "present" && presence_points > 0) {
      pointRows.push({
        student_id: a.student_id,
        class_id,
        value: presence_points,
        reason: "Presença",
        recorded_by: user.id,
      });
    }
    if (a.extra_points > 0) {
      pointRows.push({
        student_id: a.student_id,
        class_id,
        value: a.extra_points,
        reason: a.extra_reason || "Pontos extras",
        recorded_by: user.id,
      });
    }
  }

  if (pointRows.length > 0) {
    // Remove pontos anteriores do mesmo encontro para evitar duplicatas ao re-concluir
    const studentIds = attendance.map(a => a.student_id);
    await admin
      .from("points")
      .delete()
      .eq("class_id", class_id)
      .in("student_id", studentIds)
      .eq("reason", "Presença")
      // filtra pelos criados no mesmo dia do encontro para não apagar histórico
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    await admin.from("points").insert(pointRows);
  }

  // Marca encontro como concluído
  const { error: meetError } = await admin
    .from("meetings")
    .update({ concluded: true, concluded_at: new Date().toISOString() })
    .eq("id", meeting_id);

  if (meetError) return { error: "Erro ao concluir encontro." };

  revalidatePath(`/turmas/${class_id}/encontros/${meeting_id}`);
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  revalidatePath("/pontos");
  return { success: true };
}

export async function buscarPresencaExistente(meetingId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("attendance")
    .select("student_id, status")
    .eq("meeting_id", meetingId);
  return data ?? [];
}
