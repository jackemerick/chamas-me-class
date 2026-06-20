import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlanClient } from "@/components/planejamento/plan-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("classes").select("name").eq("id", id).single();
  return { title: `Planejamento — ${data?.name ?? "Classe"}` };
}

export default async function PlanejamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: cls } = await admin
    .from("classes")
    .select("id, name, org_id")
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

  const { data: plans } = await admin
    .from("class_plans")
    .select("id, title, description, order_index, completed, completed_at, notes")
    .eq("class_id", id)
    .order("order_index", { ascending: true });

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Button
          component={Link}
          href={`/turmas/${id}`}
          size="small"
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ color: "text.secondary" }}
        >
          {cls.name}
        </Button>
      </Box>

      <PlanClient classId={id} plans={plans ?? []} />
    </Box>
  );
}
