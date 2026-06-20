"use client";

import { useState } from "react";
import { Loader2, Shield, ShieldOff, UserX } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { alterarRole, removerMembro } from "@/actions/members";

interface MemberItem {
  id: string;
  user_id: string;
  role: string;
  name: string;
  email: string;
  created_at: string;
}

export function MembersList({
  members,
  currentUserId,
  orgId,
}: {
  members: MemberItem[];
  currentUserId: string;
  orgId: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRole(memberId: string, userId: string, currentRole: string) {
    setLoading(memberId);
    const formData = new FormData();
    formData.set("member_id", memberId);
    formData.set("new_role", currentRole === "admin" ? "member" : "admin");
    formData.set("org_id", orgId);
    const result = await alterarRole(formData);
    if (result?.error) toast.error(result.error);
    else toast.success("Papel atualizado.");
    setLoading(null);
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remover este membro da igreja?")) return;
    setLoading(memberId);
    const formData = new FormData();
    formData.set("member_id", memberId);
    formData.set("org_id", orgId);
    const result = await removerMembro(formData);
    if (result?.error) toast.error(result.error);
    else toast.success("Membro removido.");
    setLoading(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Membros ({members.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {members.map((m) => {
            const isMe = m.user_id === currentUserId;
            const busy = loading === m.id;
            return (
              <li key={m.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(m.name || m.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <Badge variant={m.role === "admin" ? "default" : "secondary"} className="shrink-0">
                  {m.role === "admin" ? "Admin" : "Membro"}
                </Badge>
                {!isMe && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={busy}
                      onClick={() => handleRole(m.id, m.user_id, m.role)}
                      title={m.role === "admin" ? "Remover admin" : "Tornar admin"}
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : m.role === "admin" ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      disabled={busy}
                      onClick={() => handleRemove(m.id)}
                      title="Remover da igreja"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
