"use client";

import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

interface BottomNavProps {
  isAdmin: boolean;
}

// Mobile: Início, Classes, Alunos, Agenda, Admin (ou Pontos se não for admin)
const baseRoutes = [
  { value: "/dashboard", label: "Início", icon: <HomeRoundedIcon /> },
  { value: "/turmas", label: "Classes", icon: <MenuBookRoundedIcon /> },
  { value: "/alunos", label: "Alunos", icon: <PeopleRoundedIcon /> },
  { value: "/agenda", label: "Agenda", icon: <CalendarMonthRoundedIcon /> },
];

const adminRoute = { value: "/admin", label: "Admin", icon: <AdminPanelSettingsRoundedIcon /> };
const pontosRoute = { value: "/pontos", label: "Pontos", icon: <EmojiEventsRoundedIcon /> };

export function BottomNav({ isAdmin }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const items = [...baseRoutes, isAdmin ? adminRoute : pontosRoute];

  const active = items.find(
    (r) => pathname === r.value || (r.value !== "/dashboard" && pathname.startsWith(r.value))
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
      <BottomNavigation value={active} onChange={(_, val) => router.push(val)} showLabels>
        {items.map((item) => (
          <BottomNavigationAction
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
            sx={{ color: "text.secondary", "&.Mui-selected": { color: "primary.main" } }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
