import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { ClassCard } from "@/components/classes/class-card";
import { NewClassButton } from "@/components/turmas/new-class-button";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id);

  const orgId = cookieStore.get("active_org")?.value ?? memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const { data: classes } = await admin
    .from("classes")
    .select("id, name, group_label, created_at, students(count)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Turmas</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {classes?.length ?? 0} {classes?.length === 1 ? "turma ativa" : "turmas ativas"}
          </Typography>
        </Box>
        <NewClassButton />
      </Box>

      {classes && classes.length > 0 ? (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              groupLabel={cls.group_label}
              studentCount={Array.isArray(cls.students) ? cls.students.length : 0}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: "#33403514", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <MenuBookRoundedIcon sx={{ color: "primary.main", fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Nenhuma turma ainda</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mb: 3 }}>
            Crie a primeira turma para começar a gerenciar alunos, encontros e presença.
          </Typography>
          <NewClassButton />
        </Box>
      )}
    </Box>
  );
}
