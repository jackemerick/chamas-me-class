"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

interface Membership {
  org_id: string;
  role: string;
  organizations: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
  } | null;
}

interface AppShellProps {
  user: User;
  membership: Membership | null;
  children: React.ReactNode;
}

export function AppShell({ user, membership, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Redireciona para onboarding se usuario nao tem org e nao esta la ainda
  useEffect(() => {
    if (!membership && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [membership, pathname, router]);

  // Durante redirect, nao renderiza nada
  if (!membership && !pathname.startsWith("/onboarding")) {
    return null;
  }

  // Tela de onboarding sem sidebar
  if (!membership || pathname.startsWith("/onboarding")) {
    return (
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    );
  }

  const org = membership.organizations;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        org={org}
        role={membership.role}
        currentPath={pathname}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppTopbar user={user} orgName={org?.name ?? ""} />
        <main className="flex-1 overflow-y-auto bg-brand-light p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
