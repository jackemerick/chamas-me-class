"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Trophy,
  Award,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  org: { name: string; primary_color: string; logo_url: string | null } | null;
  role: string;
  currentPath: string;
}

const navItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/turmas", label: "Turmas", icon: BookOpen },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/encontros", label: "Encontros", icon: Calendar },
  { href: "/pontos", label: "Pontos", icon: Trophy },
  { href: "/certificados", label: "Certificados", icon: Award },
];

const adminItems = [
  { href: "/admin", label: "Administração", icon: Settings },
];

export function AppSidebar({ org, role, currentPath }: SidebarProps) {
  const primaryColor = org?.primary_color ?? "#334035";
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <aside
      className="hidden md:flex flex-col w-60 shrink-0 h-full"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Header da sidebar com nome da org */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {org?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logo_url}
              alt={org.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {org?.name?.charAt(0) ?? "C"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {org?.name ?? "Chamas-me Class"}
            </p>
            <p className="text-white/50 text-xs capitalize">{role}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
        </div>
      </div>

      {/* Navegacao */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              currentPath === item.href ||
              (item.href !== "/dashboard" && currentPath.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Itens de admin */}
        {isAdmin && (
          <div className="mt-6">
            <p className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              Admin
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = currentPath.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-white/15 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
