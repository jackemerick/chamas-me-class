"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, CalendarDays, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  isAdmin: boolean;
}

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Início", icon: LayoutDashboard },
    { href: "/turmas", label: "Turmas", icon: BookOpen },
    { href: "/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/pontos", label: "Pontos", icon: Trophy },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <ul className="flex items-stretch h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 text-[10px] font-medium transition-colors",
                  active ? "text-brand-dark" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active && "stroke-[2.5]")}
                  style={active ? { color: "#334035" } : undefined}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
