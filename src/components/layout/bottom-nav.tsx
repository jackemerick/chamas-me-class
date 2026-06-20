"use client";

import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

interface BottomNavProps {
  isAdmin: boolean;
}

const routes = [
  { value: "/dashboard", label: "Início", icon: <HomeRoundedIcon /> },
  { value: "/turmas", label: "Turmas", icon: <MenuBookRoundedIcon /> },
  { value: "/agenda", label: "Agenda", icon: <CalendarMonthRoundedIcon /> },
  { value: "/pontos", label: "Pontos", icon: <EmojiEventsRoundedIcon /> },
];

const adminRoute = {
  value: "/admin",
  label: "Admin",
  icon: <AdminPanelSettingsRoundedIcon />,
};

export function BottomNav({ isAdmin }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const items = isAdmin ? [...routes, adminRoute] : routes;

  // Determina qual tab está ativa
  const active = items.find(
    (r) =>
      pathname === r.value ||
      (r.value !== "/dashboard" && pathname.startsWith(r.value))
  )?.value ?? "/dashboard";

  return (
    <Paper
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
      }}
      elevation={8}
    >
      <BottomNavigation
        value={active}
        onChange={(_, val) => router.push(val)}
        showLabels
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
            sx={{
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.main" },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
