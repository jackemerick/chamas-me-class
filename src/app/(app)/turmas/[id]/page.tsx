import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Calendar, Settings, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("classes").select("name").eq("id", id).single();
  return { title: data?.name ?? "Turma" };
}

export default async function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: cls } = await admin
    .from("classes")
    .select("id, name, group_label, org_id, created_at")
    .eq("id", id)
    .single();

  if (!cls) notFound();

  const { data: member } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", cls.org_id)
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/dashboard");

  const { data: students } = await admin
    .from("students")
    .select("id, name, birthdate")
    .eq("class_id", id)
    .order("name");

  const { data: meetings } = await admin
    .from("meetings")
    .select("id, date, theme")
    .eq("class_id", id)
    .order("date", { ascending: false })
    .limit(5);

  const isAdmin = member.role === "admin";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{cls.name}</h1>
            {cls.group_label && <Badge variant="secondary">{cls.group_label}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Criada em {new Date(cls.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/turmas/${id}/editar`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Settings className="w-4 h-4 mr-1.5" />
            Editar
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#33403515" }}>
              <Users className="w-5 h-5" style={{ color: "#334035" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{students?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">alunos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#7DAF9C15" }}>
              <Calendar className="w-5 h-5" style={{ color: "#7DAF9C" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{meetings?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">encontros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alunos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Alunos</h2>
          <Link
            href={`/turmas/${id}/alunos/novo`}
            className={cn(buttonVariants({ size: "sm" }))}
            style={{ backgroundColor: "#334035" }}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Adicionar
          </Link>
        </div>

        {students && students.length > 0 ? (
          <Card>
            <ul className="divide-y">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/turmas/${id}/alunos/${s.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: "#334035" }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      {s.birthdate && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.birthdate).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Nenhum aluno cadastrado ainda.</p>
              <Link
                href={`/turmas/${id}/alunos/novo`}
                className={cn(buttonVariants({ size: "sm" }))}
                style={{ backgroundColor: "#334035" }}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Adicionar primeiro aluno
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Últimos encontros */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Últimos encontros</h2>
          <Link
            href={`/turmas/${id}/encontros`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Ver todos
          </Link>
        </div>

        {meetings && meetings.length > 0 ? (
          <Card>
            <ul className="divide-y">
              {meetings.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/turmas/${id}/encontros/${m.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#7DAF9C15" }}>
                      <Calendar className="w-4 h-4" style={{ color: "#7DAF9C" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.theme ?? "Sem tema"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Nenhum encontro registrado ainda.</p>
              <Link
                href={`/turmas/${id}/encontros/novo`}
                className={cn(buttonVariants({ size: "sm" }))}
                style={{ backgroundColor: "#334035" }}
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                Novo encontro
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
