"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { concluirEncontro } from "@/actions/attendance";

type Status = "present" | "absent" | "justified";

interface Student {
  id: string;
  name: string;
}

interface ConcludeClientProps {
  meetingId: string;
  classId: string;
  students: Student[];
  presencePoints: number; // valor de "Presença" configurado na classe
  existingAttendance: { student_id: string; status: Status }[];
  concluded: boolean;
}

export function ConcludeClient({
  meetingId,
  classId,
  students,
  presencePoints,
  existingAttendance,
  concluded: initialConcluded,
}: ConcludeClientProps) {
  const router = useRouter();

  const buildInitial = () => {
    const map: Record<string, Status> = {};
    // padrão: todos presentes
    for (const s of students) map[s.id] = "present";
    // sobrescreve com dados existentes
    for (const a of existingAttendance) map[a.student_id] = a.status;
    return map;
  };

  const [statusMap, setStatusMap] = useState<Record<string, Status>>(buildInitial);
  const [extraPoints, setExtraPoints] = useState<Record<string, number>>({});
  const [extraReason, setExtraReason] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [concluded, setConcluded] = useState(initialConcluded);

  const presentCount = Object.values(statusMap).filter(s => s === "present").length;

  function setAllPresent() {
    const map: Record<string, Status> = {};
    for (const s of students) map[s.id] = "present";
    setStatusMap(map);
  }

  async function handleConclude() {
    setSaving(true);
    const attendance = students.map(s => ({
      student_id: s.id,
      status: statusMap[s.id] ?? "absent",
      extra_points: extraPoints[s.id] ?? 0,
      extra_reason: extraReason[s.id] ?? undefined,
    }));
    const result = await concluirEncontro({ meeting_id: meetingId, class_id: classId, attendance, presence_points: presencePoints });
    setSaving(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Encontro concluído!");
    setConcluded(true);
    router.refresh();
  }

  const STATUS_LABELS: Record<Status, string> = { present: "P", absent: "F", justified: "J" };
  const STATUS_COLORS: Record<Status, string> = { present: "#7DAF9C", absent: "#F2542D", justified: "#FFD166" };

  if (students.length === 0) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center", py: 5 }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum aluno cadastrado nesta classe ainda.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header da seção */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Presença</Typography>
          <Typography variant="caption" color="text.secondary">
            {presentCount}/{students.length} presentes
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={setAllPresent} disabled={saving}>
            Todos presentes
          </Button>
        </Box>
      </Box>

      {/* Legenda */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        {(["present", "absent", "justified"] as Status[]).map(s => (
          <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: STATUS_COLORS[s], display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: "white" }}>{STATUS_LABELS[s]}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {s === "present" ? "Presente" : s === "absent" ? "Falta" : "Justificada"}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Lista */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 2 }}>
        {students.map((s, idx) => {
          const status = statusMap[s.id] ?? "present";
          const isExpanded = expanded === s.id;

          return (
            <Box key={s.id}>
              {idx > 0 && <Divider />}
              <Box sx={{ px: 2, py: 1.25 }}>
                {/* Linha principal */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {s.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>{s.name}</Typography>

                  {/* Pontos extras badge */}
                  {(extraPoints[s.id] ?? 0) > 0 && (
                    <Chip label={`+${extraPoints[s.id]}pts`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: "#FFD16620", color: "#b38a00" }} />
                  )}

                  {/* Toggle P/F/J */}
                  <ToggleButtonGroup
                    value={status}
                    exclusive
                    size="small"
                    onChange={(_, val) => { if (val) setStatusMap(prev => ({ ...prev, [s.id]: val })); }}
                    sx={{ "& .MuiToggleButton-root": { px: 1, py: 0.25, minWidth: 28, fontSize: 11, fontWeight: 800, border: "1px solid", borderColor: "divider" } }}
                  >
                    <ToggleButton value="present" sx={{ "&.Mui-selected": { bgcolor: "#7DAF9C20", color: "#7DAF9C", borderColor: "#7DAF9C !important" } }}>P</ToggleButton>
                    <ToggleButton value="absent" sx={{ "&.Mui-selected": { bgcolor: "#F2542D20", color: "#F2542D", borderColor: "#F2542D !important" } }}>F</ToggleButton>
                    <ToggleButton value="justified" sx={{ "&.Mui-selected": { bgcolor: "#FFD16630", color: "#b38a00", borderColor: "#FFD166 !important" } }}>J</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Expand pontos extras */}
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setExpanded(isExpanded ? null : s.id)}
                    sx={{ minWidth: 0, px: 0.5, fontSize: 11, color: "text.secondary" }}
                  >
                    +pts
                  </Button>
                </Box>

                {/* Pontos extras expandido */}
                {isExpanded && (
                  <Box sx={{ display: "flex", gap: 1, mt: 1, pl: 5 }}>
                    <TextField
                      type="number"
                      label="Pontos extras"
                      size="small"
                      sx={{ width: 110 }}
                      value={extraPoints[s.id] ?? 0}
                      onChange={e => setExtraPoints(prev => ({ ...prev, [s.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      slotProps={{ htmlInput: { min: 0, max: 9999 } }}
                    />
                    <TextField
                      label="Motivo"
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder="Ex: Trouxe bíblia"
                      value={extraReason[s.id] ?? ""}
                      onChange={e => setExtraReason(prev => ({ ...prev, [s.id]: e.target.value }))}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Card>

      {/* Pontos de presença info */}
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Cada presença vale <strong>{presencePoints} pontos</strong>. Pontos extras são somados individualmente.
      </Typography>

      {/* Botão concluir */}
      {concluded ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, bgcolor: "#7DAF9C12", borderRadius: 3, border: "1px solid #7DAF9C40" }}>
          <CheckCircleRoundedIcon sx={{ color: "#7DAF9C" }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#7DAF9C" }}>
            Encontro concluído. Presença e pontos salvos.
          </Typography>
          <Button size="small" variant="text" onClick={handleConclude} disabled={saving} sx={{ ml: "auto", color: "text.secondary", fontSize: 11 }}>
            Atualizar
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleConclude}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckRoundedIcon />}
        >
          {saving ? "Salvando..." : "Concluir encontro"}
        </Button>
      )}
    </Box>
  );
}
