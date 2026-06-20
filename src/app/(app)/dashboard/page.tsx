import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { buscarDadosDashboard } from "@/actions/dashboard";

export const metadata: Metadata = { title: "Início" };

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default async function DashboardPage() {
  const { classes, nextMeetings } = await buscarDadosDashboard();

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Início</Typography>

      {/* Cards por classe */}
      {classes.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center", py: 6 }}>
          <MenuBookRoundedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Nenhuma classe encontrada.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          {classes.map((cls) => (
            <Card key={cls.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
              <Link href={`/turmas/${cls.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <CardActionArea sx={{ borderRadius: "12px 12px 0 0" }}>
                <CardContent sx={{ pb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, flex: 1 }} noWrap>{cls.name}</Typography>
                    {cls.group_label && (
                      <Chip label={cls.group_label} size="small" sx={{ fontSize: 11, height: 20 }} />
                    )}
                  </Box>

                  {/* Métricas */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
                    {/* Alunos */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <PeopleRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, fontSize: 18 }}>
                          {cls.studentCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">alunos</Typography>
                      </Box>
                    </Box>

                    {/* Frequência */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, fontSize: 18 }}>
                          {cls.attendanceAvg !== null ? `${cls.attendanceAvg}%` : "--"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">presença</Typography>
                      </Box>
                    </Box>

                    {/* Conclusão */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, fontSize: 18 }}>
                          {cls.completionPct !== null ? `${cls.completionPct}%` : "--"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">conclusão</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                </CardActionArea>
              </Link>

              {/* Barra de progresso do planejamento */}
              {cls.planTotal > 0 && (
                <Box sx={{ px: 2, pb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Planejamento: {cls.planCompleted}/{cls.planTotal} aulas
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
                      {cls.completionPct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cls.completionPct ?? 0}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#33403514",
                      "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 3 },
                    }}
                  />
                </Box>
              )}
            </Card>
          ))}
        </Box>
      )}

      {/* Próximos encontros */}
      {nextMeetings.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>
            Próximos encontros
          </Typography>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <List disablePadding>
              {nextMeetings.map((m, idx) => (
                <Box key={m.id}>
                  {idx > 0 && <Divider />}
                  <ListItem
                    sx={{ px: 2, py: 1.25 }}
                    secondaryAction={
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(m.date)}
                      </Typography>
                    }
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#F2542D", mr: 1.5, flexShrink: 0 }} />
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {m.theme ?? "Sem tema"}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">{m.class_name}</Typography>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Card>
        </Box>
      )}
    </Box>
  );
}
