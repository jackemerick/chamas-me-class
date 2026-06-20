"use client";

import type { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "@/actions/auth";

interface AppTopbarProps {
  user: User;
  orgName: string;
}

export function AppTopbar({ user, orgName }: AppTopbarProps) {
  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    toast.success("Você saiu da conta.");
    // Middleware vai redirecionar para /login automaticamente
    window.location.href = "/login";
  }

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Nome da org no mobile */}
      <span className="text-sm font-semibold md:hidden truncate max-w-50">
        {orgName}
      </span>
      {/* Espaço vazio no desktop (sidebar já mostra o nome) */}
      <div className="hidden md:block" />

      {/* Menu do usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: "#334035" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => { window.location.href = "/perfil"; }}
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Meu perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
