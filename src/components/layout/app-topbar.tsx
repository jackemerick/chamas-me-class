"use client";

import type { User } from "@supabase/supabase-js";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/actions/auth";

interface AppTopbarProps {
  user: User;
  orgName: string;
  avatarUrl: string | null;
  displayName: string;
}

export function AppTopbar({ user, orgName, avatarUrl, displayName }: AppTopbarProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const email = user.email ?? "";
  const initials = (displayName || email).charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut();
    toast.success("Você saiu da conta.");
    window.location.href = "/login";
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        display: { xs: "flex", md: "none" },
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
        <Typography
          variant="subtitle1"
          sx={{ flexGrow: 1, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {orgName}
        </Typography>

        <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
          <Avatar
            src={avatarUrl ?? undefined}
            sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}
          >
            {!avatarUrl && initials}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {displayName ? `${displayName} · ${email}` : email}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchor(null); window.location.href = "/perfil"; }}>
            <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
            Meu perfil
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
            <ListItemIcon><LogoutRoundedIcon fontSize="small" color="error" /></ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
