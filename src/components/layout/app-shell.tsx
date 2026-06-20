"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
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

export function AppShell({ user, membership, allOrgs, children }: AppShellProps) {
  const pathname = usePathname();
  const org = membership.organizations;

  if (pathname.startsWith("/perfil")) {
    return <div className="min-h-screen bg-brand-dark">{children}</div>;
  }

  const isAdmin = membership.role === "admin" || membership.role === "superadmin";

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        org={org}
        role={membership.role}
        currentPath={pathname}
        allOrgs={allOrgs}
        activeOrgId={membership.org_id}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppTopbar user={user} orgName={org?.name ?? ""} />
        <main className="flex-1 overflow-y-auto bg-brand-light p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
