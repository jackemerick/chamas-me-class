"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { criarAula, marcarAulaConcluida, salvarNotasAula, excluirAula } from "@/actions/plans";

interface PlanItem {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

interface PlanClientProps {
  classId: string;
  plans: PlanItem[];
}

const schema = z.object({
  title: z.string().min(1, "Informe o título da aula").max(200),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function PlanClient({ classId, plans: initialPlans }: PlanClientProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(initialPlans.map(p => [p.id, p.notes ?? ""]))
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const completed = plans.filter(p => p.completed).length;
  const total = plans.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("class_id", classId);
    formData.set("title", data.title);
    if (data.description) formData.set("description", data.description);
    const result = await criarAula(formData);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Aula adicionada.");
    reset();
    setShowForm(false);
  }

  async function toggleCompleted(plan: PlanItem) {
    setTogglingId(plan.id);
    const formData = new FormData();
    formData.set("id", plan.id);
    formData.set("class_id", classId);
    formData.set("completed", (!plan.completed).toString());
    const result = await marcarAulaConcluida(formData);
    if (result?.error) toast.error(result.error);
    else setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, completed: !p.completed } : p));
    setTogglingId(null);
  }

  async function saveNotes(planId: string) {
    setSavingNotes(planId);
    const formData = new FormData();
    formData.set("id", planId);
    formData.set("class_id", classId);
    formData.set("notes", notes[planId] ?? "");
    const result = await salvarNotasAula(formData);
    if (result?.error) toast.error(result.error);
    else toast.success("Notas salvas.");
    setSavingNotes(null);
  }

  async function deleteAula(planId: string) {
    if (!confirm("Excluir esta aula do planejamento?")) return;
    setDeletingId(planId);
    const formData = new FormData();
    formData.set("id", planId);
    formData.set("class_id", classId);
    const result = await excluirAula(formData);
    if (result?.error) { toast.error(result.error); setDeletingId(null); return; }
    setPlans(prev => prev.filter(p => p.id !== planId));
    setDeletingId(null);
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Planejamento</Typography>
          {total > 0 && (
            <Typography variant="caption" color="text.secondary">
              {completed}/{total} aulas concluídas
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => setShowForm(v => !v)}
        >
          Nova aula
        </Button>
      </Box>

      {/* Barra de progresso */}
      {total > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Progresso</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>{pct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#33403514",
              "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 4 },
            }}
          />
        </Box>
      )}

      {/* Formulário de nova aula */}
      <Collapse in={showForm}>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Nova aula</Typography>
              <IconButton size="small" onClick={() => { setShowForm(false); reset(); }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Título da aula"
                placeholder="Ex: A vida de Paulo"
                autoFocus
                size="small"
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title")}
              />
              <TextField
                label="Descrição (opcional)"
                placeholder="Versículos, objetivos, conteúdo..."
                multiline
                rows={2}
                size="small"
                {...register("description")}
              />
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button variant="outlined" size="small" onClick={() => { setShowForm(false); reset(); }} disabled={isSubmitting} fullWidth>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" size="small" disabled={isSubmitting} fullWidth
                  startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}>
                  {isSubmitting ? "Salvando..." : "Adicionar"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Lista de aulas */}
      {plans.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center", py: 6 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nenhuma aula planejada ainda.
          </Typography>
          <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => setShowForm(true)}>
            Adicionar primeira aula
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {plans.map((plan, idx) => {
            const expanded = expandedId === plan.id;
            return (
              <Card
                key={plan.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: plan.completed ? "#7DAF9C40" : "divider",
                  borderRadius: 3,
                  bgcolor: plan.completed ? "#7DAF9C08" : "background.paper",
                  transition: "all 0.2s",
                }}
              >
                {/* Row principal */}
                <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, gap: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.disabled", minWidth: 20, fontWeight: 600 }}>
                    {idx + 1}
                  </Typography>
                  <Checkbox
                    checked={plan.completed}
                    disabled={togglingId === plan.id}
                    onChange={() => toggleCompleted(plan)}
                    size="small"
                    sx={{
                      p: 0.5,
                      color: "text.disabled",
                      "&.Mui-checked": { color: "#7DAF9C" },
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        textDecoration: plan.completed ? "line-through" : "none",
                        color: plan.completed ? "text.secondary" : "text.primary",
                      }}
                      noWrap
                    >
                      {plan.title}
                    </Typography>
                    {plan.completed && plan.completed_at && (
                      <Typography variant="caption" sx={{ color: "#7DAF9C" }}>
                        Concluída em {new Date(plan.completed_at).toLocaleDateString("pt-BR")}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setExpandedId(expanded ? null : plan.id)}
                  >
                    {expanded ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                  </IconButton>
                </Box>

                {/* Expanded: descrição + notas */}
                <Collapse in={expanded}>
                  <Divider />
                  <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {plan.description && (
                      <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
                    )}
                    <TextField
                      label="Notas do encontro"
                      multiline
                      rows={3}
                      size="small"
                      placeholder="Observações, como foi, o que funcionou..."
                      value={notes[plan.id] ?? ""}
                      onChange={e => setNotes(prev => ({ ...prev, [plan.id]: e.target.value }))}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={savingNotes === plan.id ? <CircularProgress size={14} /> : <SaveRoundedIcon />}
                        disabled={savingNotes === plan.id}
                        onClick={() => saveNotes(plan.id)}
                      >
                        Salvar notas
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        startIcon={deletingId === plan.id ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineRoundedIcon />}
                        disabled={deletingId === plan.id}
                        onClick={() => deleteAula(plan.id)}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
