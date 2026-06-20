"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useState } from "react";

const SIDEBAR_WIDTH = 240;

interface OrgBasic {
  id: string;
  name: string;
  primary_color: string;
  logo_url: string | null;
}

interface SidebarProps {
  org: OrgBasic | null;
  role: string;
  currentPath: string;
  allOrgs: OrgBasic[];
  activeOrgId: string;
}

const navItems = [
  { href: "/dashboard", label: "Início", icon: <HomeRoundedIcon /> },
  { href: "/turmas", label: "Turmas", icon: <MenuBookRoundedIcon /> },
  { href: "/agenda", label: "Agenda", icon: <CalendarMonthRoundedIcon /> },
  { href: "/pontos", label: "Pontos", icon: <EmojiEventsRoundedIcon /> },
];

export function AppSidebar({ org, role, currentPath, allOrgs, activeOrgId }: SidebarProps) {
  const router = useRouter();
  const [orgMenuAnchor, setOrgMenuAnchor] = useState<null | HTMLElement>(null);
  const isAdmin = role === "admin" || role === "superadmin";
  const primaryColor = org?.primary_color ?? "#334035";

  async function switchOrg(orgId: string) {
    setOrgMenuAnchor(null);
    await fetch("/api/switch-org", { method: "POST", body: JSON.stringify({ orgId }) });
    router.refresh();
  }

  function isActive(href: string) {
    return currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href));
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "flex" },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          bgcolor: primaryColor,
          color: "white",
          border: "none",
          boxSizing: "border-box",
        },
      }}
    >
      {/* Header da org */}
      <Box
        onClick={(e) => allOrgs.length > 1 && setOrgMenuAnchor(e.currentTarget)}
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: allOrgs.length > 1 ? "pointer" : "default",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          "&:hover": allOrgs.length > 1 ? { bgcolor: "rgba(255,255,255,0.08)" } : {},
        }}
      >
        <Avatar
          src={org?.logo_url ?? undefined}
          sx={{ width: 32, height: 32, bgcolor: "#F2542D", fontSize: 13, fontWeight: 700 }}
        >
          {org?.name?.charAt(0) ?? "C"}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "white" }} noWrap>
            {org?.name ?? "Chamas-me Class"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>
            {role}
          </Typography>
        </Box>
        {allOrgs.length > 1 && (
          <ExpandMoreRoundedIcon sx={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }} />
        )}
      </Box>

      {/* Menu de troca de org */}
      <Menu
        anchorEl={orgMenuAnchor}
        open={Boolean(orgMenuAnchor)}
        onClose={() => setOrgMenuAnchor(null)}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
      >
        {allOrgs.map((o) => (
          <MenuItem key={o.id} onClick={() => switchOrg(o.id)}>
            <ListItemText primary={o.name} />
            {o.id === activeOrgId && <CheckRoundedIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { setOrgMenuAnchor(null); window.location.href = "/onboarding"; }}>
          Entrar em outra Igreja
        </MenuItem>
      </Menu>

      {/* Navegação */}
      <List sx={{ px: 1, py: 1.5, flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? "white" : "rgba(255,255,255,0.65)",
                bgcolor: active ? "rgba(255,255,255,0.15) !important" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { style: { fontSize: 14, fontWeight: active ? 600 : 400 } } }} />
            </ListItemButton>
          );
        })}

        {isAdmin && (
          <>
            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
            <Typography variant="caption" sx={{ px: 1.5, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Admin
            </Typography>
            <ListItemButton
              component={Link}
              href="/admin"
              selected={isActive("/admin")}
              sx={{
                borderRadius: 2,
                mt: 0.5,
                color: isActive("/admin") ? "white" : "rgba(255,255,255,0.65)",
                bgcolor: isActive("/admin") ? "rgba(255,255,255,0.15) !important" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                <AdminPanelSettingsRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Administração" slotProps={{ primary: { style: { fontSize: 14 } } }} />
            </ListItemButton>
          </>
        )}
      </List>
    </Drawer>
  );
}
