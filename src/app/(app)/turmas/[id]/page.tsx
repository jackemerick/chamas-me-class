import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("classes").select("name").eq("id", id).single();
  return { title: data?.name ?? "Classe" };
}

export default async function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: cls } = await admin
    .from("classes")
    .select("id, name, group_label, org_id, created_at")
    .eq("id", id)
    .single();
  if (!cls) notFound();

  const { data: member } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", cls.org_id)
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/dashboard");

  const [{ data: students }, { data: meetings }, { data: planStats }] = await Promise.all([
    admin.from("students").select("id, name, birthdate").eq("class_id", id).order("name"),
    admin.from("meetings").select("id, date, theme").eq("class_id", id).order("date", { ascending: false }).limit(5),
    admin.from("class_plans").select("id, completed").eq("class_id", id),
  ]);

  const isAdmin = member.role === "admin" || member.role === "superadmin";
  const planTotal = planStats?.length ?? 0;
  const planCompleted = planStats?.filter(p => p.completed).length ?? 0;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{cls.name}</Typography>
            {cls.group_label && (
              <Chip label={cls.group_label} size="small" sx={{ height: 22, fontSize: 11 }} />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Criada em {new Date(cls.created_at).toLocaleDateString("pt-BR")}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            component={Link}
            href={`/turmas/${id}/editar`}
            variant="outlined"
            size="small"
            startIcon={<SettingsRoundedIcon fontSize="small" />}
          >
            Editar
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 3 }}>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, textAlign: "center" }}>
          <PeopleRoundedIcon sx={{ fontSize: 22, color: "primary.main", mb: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{students?.length ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary">alunos</Typography>
        </Card>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, textAlign: "center" }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 22, color: "#7DAF9C", mb: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{meetings?.length ?? 0}</Typography>
          <Typography variant="caption" color="text.secondary">encontros</Typography>
        </Card>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 2, textAlign: "center" }}>
          <ListAltRoundedIcon sx={{ fontSize: 22, color: "#F2542D", mb: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
            {planTotal > 0 ? `${planCompleted}/${planTotal}` : "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">aulas</Typography>
        </Card>
      </Box>

      {/* Link de planejamento */}
      <Button
        component={Link}
        href={`/turmas/${id}/planejamento`}
        variant="outlined"
        fullWidth
        startIcon={<ListAltRoundedIcon />}
        sx={{ mb: 3, justifyContent: "flex-start", px: 2 }}
      >
        Ver planejamento de aulas
        {planTotal > 0 && (
          <Chip
            label={`${Math.round((planCompleted / planTotal) * 100)}%`}
            size="small"
            sx={{ ml: "auto", height: 20, fontSize: 11 }}
          />
        )}
      </Button>

      {/* Alunos */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Alunos</Typography>
          <Button
            component={Link}
            href={`/turmas/${id}/alunos/novo`}
            variant="contained"
            size="small"
            startIcon={<PersonAddRoundedIcon />}
          >
            Adicionar
          </Button>
        </Box>

        {students && students.length > 0 ? (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <List disablePadding>
              {students.map((s, idx) => (
                <Box key={s.id} component={Link} href={`/turmas/${id}/alunos/${s.id}`} sx={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  {idx > 0 && <Divider />}
                  <ListItem
                    sx={{ px: 2, py: 1.25, "&:hover": { bgcolor: "action.hover" }, transition: "background 0.15s" }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 12, fontWeight: 700 }}>
                        {s.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>}
                      secondary={s.birthdate ? (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(s.birthdate).toLocaleDateString("pt-BR")}
                        </Typography>
                      ) : undefined}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Card>
        ) : (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center", py: 5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Nenhum aluno cadastrado ainda.
            </Typography>
            <Button component={Link} href={`/turmas/${id}/alunos/novo`} variant="contained" size="small" startIcon={<PersonAddRoundedIcon />}>
              Adicionar primeiro aluno
            </Button>
          </Card>
        )}
      </Box>

      {/* Últimos encontros */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Últimos encontros</Typography>
          <Button component={Link} href={`/turmas/${id}/encontros`} variant="outlined" size="small">
            Ver todos
          </Button>
        </Box>

        {meetings && meetings.length > 0 ? (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <List disablePadding>
              {meetings.map((m, idx) => (
                <Box key={m.id} component={Link} href={`/turmas/${id}/encontros/${m.id}`} sx={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  {idx > 0 && <Divider />}
                  <ListItem sx={{ px: 2, py: 1.25, "&:hover": { bgcolor: "action.hover" }, transition: "background 0.15s" }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#7DAF9C20" }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: "#7DAF9C" }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{m.theme ?? "Sem tema"}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(m.date).toLocaleDateString("pt-BR")}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Card>
        ) : (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center", py: 5 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum encontro registrado ainda.
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
