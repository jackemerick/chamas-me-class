import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ClassCard } from "@/components/classes/class-card";
import { CreateClassButton } from "@/components/classes/create-class-button";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Busca membership do usuario
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");

  // Busca turmas da org com contagem de alunos
  const { data: classes } = await supabase
    .from("classes")
    .select(
      `
      id,
      name,
      group_label,
      created_at,
      students(count)
    `
    )
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Turmas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {classes?.length ?? 0}{" "}
            {classes?.length === 1 ? "turma ativa" : "turmas ativas"}
          </p>
        </div>
        <CreateClassButton orgId={membership.org_id} />
      </div>

      {classes && classes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              groupLabel={cls.group_label}
              studentCount={
                Array.isArray(cls.students) ? cls.students.length : 0
              }
            />
          ))}
        </div>
      ) : (
        /* Estado vazio */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "#334035" + "20" }}
          >
            <BookOpen className="w-8 h-8" style={{ color: "#334035" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma turma ainda</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Crie a primeira turma para comecar a gerenciar alunos, encontros e presenca.
          </p>
          <CreateClassButton orgId={membership.org_id} />
        </div>
      )}
    </div>
  );
}
