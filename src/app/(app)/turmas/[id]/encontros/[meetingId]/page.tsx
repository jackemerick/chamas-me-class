import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ConcludeClient } from "@/components/encontro/conclude-client";
import { buscarPresencaExistente } from "@/actions/attendance";

export async function generateMetadata({ params }: { params: Promise<{ id: string; meetingId: string }> }): Promise<Metadata> {
  const { meetingId } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("meetings").select("theme").eq("id", meetingId).single();
  return { title: data?.theme ?? "Encontro" };
}

export default async function EncontroPage({ params }: { params: Promise<{ id: string; meetingId: string }> }) {
  const { id, meetingId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: meeting } = await admin
    .from("meetings")
    .select("id, class_id, date, theme, music_url, music_title, notes, concluded, concluded_at")
    .eq("id", meetingId)
    .single();
  if (!meeting) notFound();

  const { data: cls } = await admin
    .from("classes")
    .select("id, name, org_id")
    .eq("id", id)
    .single();
  if (!cls || meeting.class_id !== id) notFound();

  const { data: member } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", cls.org_id)
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/dashboard");

  const [{ data: students }, { data: categories }, existingAttendance] = await Promise.all([
    admin.from("students").select("id, name").eq("class_id", id).order("name"),
    admin.from("point_categories").select("id, name, default_value").eq("class_id", id).order("name"),
    buscarPresencaExistente(meetingId),
  ]);

  // Valor de presença configurado (categoria "Presença") ou 10 por padrão
  const presenceCategory = categories?.find(c => c.name === "Presença");
  const presencePoints = presenceCategory?.default_value ?? 10;

  const dateFormatted = (() => {
    const [y, m, d] = meeting.date.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      {/* Voltar */}
      <Box sx={{ mb: 3 }}>
        <Link href={`/turmas/${id}`} style={{ textDecoration: "none" }}>
          <Button size="small" variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ color: "text.secondary" }}>
            {cls.name}
          </Button>
        </Link>
      </Box>

      {/* Header do encontro */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{meeting.theme ?? "Sem tema"}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">{dateFormatted}</Typography>
            </Box>
          </Box>
          {meeting.concluded && (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
              label="Concluído"
              size="small"
              sx={{ bgcolor: "#7DAF9C20", color: "#7DAF9C", fontWeight: 700, border: "1px solid #7DAF9C40" }}
            />
          )}
        </Box>
      </Box>

      {/* Detalhes */}
      {(meeting.music_url || meeting.notes) && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {meeting.music_url && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MusicNoteRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography
                  component="a"
                  href={meeting.music_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  {meeting.music_title ?? meeting.music_url}
                </Typography>
              </Box>
            )}
            {meeting.notes && (
              <>
                {meeting.music_url && <Divider />}
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                  {meeting.notes}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conclusão: presença + pontos */}
      <ConcludeClient
        meetingId={meetingId}
        classId={id}
        students={students ?? []}
        presencePoints={presencePoints}
        existingAttendance={existingAttendance}
        concluded={meeting.concluded ?? false}
      />
    </Box>
  );
}
