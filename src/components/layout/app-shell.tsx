"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { BottomNav } from "./bottom-nav";

interface OrgBasic {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
}

interface Membership {
  org_id: string;
  role: string;
  organizations: OrgBasic | null;
}

interface AppShellProps {
  user: User;
  membership: Membership;
  allOrgs: OrgBasic[];
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 240;

export function AppShell({ user, membership, allOrgs, children }: AppShellProps) {
  const pathname = usePathname();
  const org = membership.organizations;
  const isAdmin = membership.role === "admin" || membership.role === "superadmin";

  if (pathname.startsWith("/perfil")) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#334035" }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar — desktop only */}
      <AppSidebar
        org={org}
        role={membership.role}
        currentPath={pathname}
        allOrgs={allOrgs}
        activeOrgId={membership.org_id}
      />

      {/* Área principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ml: { md: `${SIDEBAR_WIDTH}px` },
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <AppTopbar user={user} orgName={org?.name ?? ""} />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: "background.default",
            p: { xs: 2, md: 3 },
            pb: { xs: 10, md: 3 }, // espaço para bottom nav no mobile
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Bottom nav — mobile only */}
      <BottomNav isAdmin={isAdmin} />
    </Box>
  );
}
