"use client";

import { useState } from "react";
import { toast } from "sonner";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alterarRole, removerMembro, vincularClasse, desvincularClasse } from "@/actions/members";

interface ClassOption {
  id: string;
  name: string;
}

interface MemberItem {
  id: string;
  user_id: string;
  role: string;
  name: string;
  email: string;
  created_at: string;
  assignedClasses: string[];
}

export function MembersList({
  members,
  currentUserId,
  orgId,
  classes,
}: {
  members: MemberItem[];
  currentUserId: string;
  orgId: string;
  classes: ClassOption[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignedMap, setAssignedMap] = useState<Record<string, string[]>>(
    Object.fromEntries(members.map(m => [m.user_id, m.assignedClasses]))
  );
  const [selectedClass, setSelectedClass] = useState<Record<string, string>>({});

  async function handleRole(memberId: string, currentRole: string) {
    setLoading(memberId);
    const fd = new FormData();
    fd.set("member_id", memberId);
    fd.set("new_role", currentRole === "admin" ? "member" : "admin");
    fd.set("org_id", orgId);
    const result = await alterarRole(fd);
    if (result?.error) toast.error(result.error);
    else toast.success("Papel atualizado.");
    setLoading(null);
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remover este membro?")) return;
    setLoading(memberId);
    const fd = new FormData();
    fd.set("member_id", memberId);
    fd.set("org_id", orgId);
    const result = await removerMembro(fd);
    if (result?.error) toast.error(result.error);
    else toast.success("Membro removido.");
    setLoading(null);
  }

  async function handleVincular(userId: string) {
    const classId = selectedClass[userId];
    if (!classId) return;
    setLoading(userId + classId);
    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("class_id", classId);
    fd.set("org_id", orgId);
    const result = await vincularClasse(fd);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Classe vinculada.");
      setAssignedMap(prev => ({ ...prev, [userId]: [...(prev[userId] ?? []), classId] }));
      setSelectedClass(prev => ({ ...prev, [userId]: "" }));
    }
    setLoading(null);
  }

  async function handleDesvincular(userId: string, classId: string) {
    setLoading(userId + classId);
    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("class_id", classId);
    fd.set("org_id", orgId);
    const result = await desvincularClasse(fd);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Classe removida.");
      setAssignedMap(prev => ({ ...prev, [userId]: prev[userId].filter(c => c !== classId) }));
    }
    setLoading(null);
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <CardContent sx={{ pb: "12px !important" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Membros ({members.length})
        </Typography>
      </CardContent>
      <List disablePadding>
        {members.map((m, idx) => {
          const isMe = m.user_id === currentUserId;
          const busy = loading === m.id || loading?.startsWith(m.user_id);
          const isAdmin = m.role === "admin" || m.role === "superadmin";
          const expanded = expandedId === m.id;
          const assigned = assignedMap[m.user_id] ?? [];
          const unassigned = classes.filter(c => !assigned.includes(c.id));
          const classNameMap = Object.fromEntries(classes.map(c => [c.id, c.name]));

          return (
            <Box key={m.id}>
              {idx > 0 && <Divider component="li" />}
              <ListItem
                sx={{ px: 2, py: 1.5 }}
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {!isMe && (
                      <>
                        <Tooltip title={isAdmin ? "Remover admin" : "Tornar admin"}>
                          <IconButton size="small" disabled={busy} onClick={() => handleRole(m.id, m.role)}>
                            {busy
                              ? <CircularProgress size={14} />
                              : isAdmin
                                ? <ShieldRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                                : <AdminPanelSettingsRoundedIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover da org">
                          <IconButton size="small" disabled={busy} onClick={() => handleRemove(m.id)} sx={{ color: "error.main" }}>
                            <PersonOffRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <IconButton size="small" onClick={() => setExpandedId(expanded ? null : m.id)}>
                      {expanded ? <ExpandLessRoundedIcon sx={{ fontSize: 18 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
                    {(m.name || m.email).charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ flex: 1, minWidth: 0, pr: 10 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {m.name || "Sem nome"}
                    </Typography>
                    <Chip
                      label={isAdmin ? "Admin" : "Membro"}
                      size="small"
                      color={isAdmin ? "primary" : "default"}
                      sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {m.email}
                  </Typography>
                </Box>
              </ListItem>

              {/* Seletor de classes */}
              <Collapse in={expanded}>
                <Box sx={{ px: 2, pb: 2, pt: 0.5, bgcolor: "action.hover" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Classes vinculadas
                  </Typography>

                  {assigned.length === 0 ? (
                    <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5, mb: 1.5 }}>
                      Nenhuma classe vinculada.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1, mb: 1.5 }}>
                      {assigned.map(classId => (
                        <Chip
                          key={classId}
                          label={classNameMap[classId] ?? classId}
                          size="small"
                          onDelete={() => handleDesvincular(m.user_id, classId)}
                          deleteIcon={<CloseRoundedIcon />}
                          disabled={!!loading}
                          sx={{ height: 24 }}
                        />
                      ))}
                    </Box>
                  )}

                  {unassigned.length > 0 && (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Adicionar classe</InputLabel>
                        <Select
                          label="Adicionar classe"
                          value={selectedClass[m.user_id] ?? ""}
                          onChange={e => setSelectedClass(prev => ({ ...prev, [m.user_id]: e.target.value }))}
                        >
                          {unassigned.map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        disabled={!selectedClass[m.user_id] || !!loading}
                        onClick={() => handleVincular(m.user_id)}
                        sx={{ minWidth: 0, px: 1.5, whiteSpace: "nowrap" }}
                      >
                        Vincular
                      </Button>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Card>
  );
}
