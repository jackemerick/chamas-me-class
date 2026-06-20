import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, Phone, User, Calendar, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string; studentId: string }> }): Promise<Metadata> {
  const { studentId } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("students").select("name").eq("id", studentId).single();
  return { title: data?.name ?? "Aluno" };
}

export default async function AlunoPage({ params }: { params: Promise<{ id: string; studentId: string }> }) {
  const { id, studentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: student } = await admin
    .from("students")
    .select("id, name, birthdate, city, responsible_name, responsible_phone, class_id, created_at")
    .eq("id", studentId)
    .eq("class_id", id)
    .single();

  if (!student) notFound();

  const { data: cls } = await admin.from("classes").select("id, name, org_id").eq("id", id).single();
  if (!cls) notFound();

  const { data: member } = await admin
    .from("org_members")
    .select("role")
    .eq("org_id", cls.org_id)
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/dashboard");

  // Busca presença do aluno nesta turma
  const { data: attendances } = await admin
    .from("attendance")
    .select("status, meeting_id, meetings(date, theme)")
    .eq("student_id", studentId)
    .order("meeting_id", { ascending: false })
    .limit(10);

  // Calcula presença
  const total = attendances?.length ?? 0;
  const present = attendances?.filter((a) => a.status === "present").length ?? 0;
  const pct = total > 0 ? Math.round((present / total) * 100) : null;

  // Busca pontos
  const { data: pointRows } = await admin
    .from("points")
    .select("value")
    .eq("student_id", studentId)
    .eq("class_id", id);

  const totalPoints = pointRows?.reduce((acc, p) => acc + p.value, 0) ?? 0;

  function idade(birthdate: string) {
    const diff = Date.now() - new Date(birthdate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: "#334035" }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{cls.name}</p>
          </div>
        </div>
        <Link
          href={`/turmas/${id}/alunos/${studentId}/editar`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Editar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: "#334035" }}>
              {pct !== null ? `${pct}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">presença ({present}/{total})</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: "#7DAF9C" }}>{totalPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">pontos</p>
          </CardContent>
        </Card>
      </div>

      {/* Dados pessoais */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          {student.birthdate && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                {new Date(student.birthdate).toLocaleDateString("pt-BR")}
                <span className="text-muted-foreground ml-2">({idade(student.birthdate)} anos)</span>
              </span>
            </div>
          )}
          {student.city && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{student.city}</span>
            </div>
          )}
          {student.responsible_name && (
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{student.responsible_name}</span>
            </div>
          )}
          {student.responsible_phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                href={`https://wa.me/55${student.responsible_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted"
              >
                {student.responsible_phone}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de presença */}
      {attendances && attendances.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Últimos encontros</h2>
          <Card>
            <ul className="divide-y">
              {attendances.map((a) => {
                const meeting = Array.isArray(a.meetings) ? a.meetings[0] : a.meetings;
                return (
                  <li key={a.meeting_id} className="flex items-center gap-3 px-5 py-3">
                    <Badge
                      variant={a.status === "present" ? "default" : a.status === "justified" ? "secondary" : "destructive"}
                      className="w-20 justify-center shrink-0"
                    >
                      {a.status === "present" ? "Presente" : a.status === "justified" ? "Justificado" : "Falta"}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{meeting?.theme ?? "Sem tema"}</p>
                      <p className="text-xs text-muted-foreground">
                        {meeting?.date ? new Date(meeting.date).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
