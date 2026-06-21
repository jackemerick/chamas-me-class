"use client";

import { useState } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Slider from "@mui/material/Slider";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { salvarCriterioCertificado } from "@/actions/certificado";

interface Criterio {
  temporada: string | null;
  min_attendance_pct: number | null;
  min_points: number | null;
  titulo: string | null;
  texto_livre: string | null;
  assinatura_nome: string | null;
  assinatura_cargo: string | null;
  data_emissao: string | null;
}

interface Elegivel {
  id: string;
  name: string;
  presencas: number;
  pct: number;
  pts: number;
  elegivel: boolean;
}

interface CertificadoClientProps {
  classId: string;
  className: string;
  criteria: Criterio | null;
  elegibility: Elegivel[];
  totalMeetings: number;
}

export function CertificadoClient({ classId, className, criteria, elegibility, totalMeetings }: CertificadoClientProps) {
  const [saving, setSaving] = useState(false);

  // Campos do formulário
  const [temporada, setTemporada] = useState(criteria?.temporada ?? "");
  const [titulo, setTitulo] = useState(criteria?.titulo ?? "Certificado de Participação");
  const [textoLivre, setTextoLivre] = useState(criteria?.texto_livre ?? "");
  const [assinaturaNome, setAssinaturaNome] = useState(criteria?.assinatura_nome ?? "");
  const [assinaturaCargo, setAssinaturaCargo] = useState(criteria?.assinatura_cargo ?? "");
  const [dataEmissao, setDataEmissao] = useState(criteria?.data_emissao ?? "");
  const [minPct, setMinPct] = useState(criteria?.min_attendance_pct ?? 75);
  const [minPts, setMinPts] = useState(criteria?.min_points ?? 0);

  const elegiveis = eligibility_computed();

  function eligibility_computed() {
    return elegibility.map(s => ({
      ...s,
      elegivel: s.pct >= minPct && s.pts >= minPts,
    }));
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("temporada", temporada);
    fd.set("titulo", titulo);
    fd.set("texto_livre", textoLivre);
    fd.set("assinatura_nome", assinaturaNome);
    fd.set("assinatura_cargo", assinaturaCargo);
    fd.set("data_emissao", dataEmissao);
    fd.set("min_attendance_pct", String(minPct));
    fd.set("min_points", String(minPts));
    const result = await salvarCriterioCertificado(fd);
    setSaving(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Critérios salvos.");
  }

  const totalElegiveis = elegiveis.filter(s => s.elegivel).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Config do certificado */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <WorkspacePremiumRoundedIcon sx={{ color: "#FFD166" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Configuração do certificado</Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Temporada */}
            <TextField
              label="Temporada / Ano"
              size="small"
              fullWidth
              placeholder="Ex: 2026 - 1º Semestre"
              value={temporada}
              onChange={e => setTemporada(e.target.value)}
              helperText="Identifica a turma e período no certificado"
            />

            {/* Título do certificado */}
            <TextField
              label="Título do certificado"
              size="small"
              fullWidth
              placeholder="Ex: Certificado de Participação"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />

            {/* Texto livre */}
            <TextField
              label="Texto do certificado"
              size="small"
              fullWidth
              multiline
              minRows={3}
              placeholder={`Ex: Certificamos que [NOME] participou com dedicação da ${className}, cumprindo os requisitos estabelecidos para este período.`}
              value={textoLivre}
              onChange={e => setTextoLivre(e.target.value)}
              helperText="Use [NOME] para inserir o nome do aluno automaticamente"
            />

            <Divider />

            {/* Critérios de elegibilidade */}
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Critérios para receber o certificado</Typography>

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Frequência mínima</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{minPct}%</Typography>
              </Box>
              <Slider
                value={minPct}
                onChange={(_, v) => setMinPct(v as number)}
                min={0} max={100} step={5}
                sx={{ color: "#334035" }}
              />
            </Box>

            <TextField
              label="Pontos mínimos"
              type="number"
              size="small"
              value={minPts}
              onChange={e => setMinPts(Math.max(0, parseInt(e.target.value) || 0))}
              slotProps={{ htmlInput: { min: 0 } }}
              helperText="0 = sem exigência de pontos"
              sx={{ width: 180 }}
            />

            <Divider />

            {/* Assinatura */}
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Assinatura</Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                label="Nome do responsável"
                size="small"
                sx={{ flex: 1 }}
                placeholder="Ex: Pastor João Silva"
                value={assinaturaNome}
                onChange={e => setAssinaturaNome(e.target.value)}
              />
              <TextField
                label="Cargo / Função"
                size="small"
                sx={{ flex: 1 }}
                placeholder="Ex: Diretor da CBSTA"
                value={assinaturaCargo}
                onChange={e => setAssinaturaCargo(e.target.value)}
              />
            </Box>

            {/* Data de emissão */}
            <TextField
              label="Data de emissão"
              type="date"
              size="small"
              sx={{ width: 200 }}
              value={dataEmissao}
              onChange={e => setDataEmissao(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !temporada || !titulo}
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {saving ? "Salvando..." : "Salvar configuração"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Elegibilidade dos alunos */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <CardContent sx={{ pb: "12px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Alunos elegíveis</Typography>
            <Chip
              label={`${totalElegiveis} de ${elegiveis.length}`}
              size="small"
              sx={{ bgcolor: "#7DAF9C20", color: "#7DAF9C", fontWeight: 700 }}
            />
          </Box>

          {totalMeetings === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nenhum encontro concluído ainda. Conclua os encontros para calcular a frequência.
            </Typography>
          )}

          {elegiveis.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum aluno cadastrado nesta classe.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {elegiveis.map((s, idx) => (
                <Box key={s.id}>
                  {idx > 0 && <Divider />}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {s.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.presencas}/{totalMeetings} encontros ({s.pct}%) · {s.pts} pts
                      </Typography>
                    </Box>
                    {s.elegivel
                      ? <CheckCircleRoundedIcon sx={{ color: "#7DAF9C", fontSize: 20, flexShrink: 0 }} />
                      : <CancelRoundedIcon sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />
                    }
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
