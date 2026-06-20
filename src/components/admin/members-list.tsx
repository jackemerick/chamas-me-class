"use client";

import { useState } from "react";
import { toast } from "sonner";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { alterarRole, removerMembro } from "@/actions/members";

interface MemberItem {
  id: string;
  user_id: string;
  role: string;
  name: string;
  email: string;
  created_at: string;
}

export function MembersList({
  members,
  currentUserId,
  orgId,
}: {
  members: MemberItem[];
  currentUserId: string;
  orgId: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRole(memberId: string, currentRole: string) {
    setLoading(memberId);
    const formData = new FormData();
    formData.set("member_id", memberId);
    formData.set("new_role", currentRole === "admin" ? "member" : "admin");
    formData.set("org_id", orgId);
    const result = await alterarRole(formData);
    if (result?.error) toast.error(result.error);
    else toast.success("Papel atualizado.");
    setLoading(null);
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remover este membro da igreja?")) return;
    setLoading(memberId);
    const formData = new FormData();
    formData.set("member_id", memberId);
    formData.set("org_id", orgId);
    const result = await removerMembro(formData);
    if (result?.error) toast.error(result.error);
    else toast.success("Membro removido.");
    setLoading(null);
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <CardContent sx={{ pb: "0 !important" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Membros ({members.length})
        </Typography>
      </CardContent>
      <List disablePadding>
        {members.map((m, idx) => {
          const isMe = m.user_id === currentUserId;
          const busy = loading === m.id;
          const initials = (m.name || m.email).charAt(0).toUpperCase();
          const isAdmin = m.role === "admin" || m.role === "superadmin";

          return (
            <Box key={m.id}>
              {idx > 0 && <Divider component="li" />}
              <ListItem
                sx={{ px: 2, py: 1.5 }}
                secondaryAction={
                  !isMe ? (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title={isAdmin ? "Remover admin" : "Tornar admin"}>
                        <IconButton
                          size="small"
                          disabled={busy}
                          onClick={() => handleRole(m.id, m.role)}
                        >
                          {busy
                            ? <CircularProgress size={14} />
                            : isAdmin
                              ? <ShieldRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                              : <AdminPanelSettingsRoundedIcon sx={{ fontSize: 16 }} />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover da igreja">
                        <IconButton
                          size="small"
                          disabled={busy}
                          onClick={() => handleRemove(m.id)}
                          sx={{ color: "error.main" }}
                        >
                          <PersonOffRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : undefined
                }
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
                    {initials}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
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
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {m.email}
                    </Typography>
                  }
                />
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Card>
  );
}
