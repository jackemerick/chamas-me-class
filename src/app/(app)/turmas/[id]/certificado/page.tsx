import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CertificadoClient } from "@/components/certificado/certificado-client";
import { buscarElegibilidade } from "@/actions/certificado";

export const metadata: Metadata = { title: "Certificado" };

export default async function CertificadoPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { criteria, elegibility, totalMeetings } = await buscarElegibilidade(id);

  // garante que background_url chega no componente
  type CriteriaWithBg = typeof criteria & { background_url?: string | null };
  const criteriaFull = criteria as CriteriaWithBg | null;

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Link href={`/turmas/${id}`} style={{ textDecoration: "none" }}>
          <Button size="small" variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ color: "text.secondary" }}>
            {cls.name}
          </Button>
        </Link>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Certificado</Typography>

      <CertificadoClient
        classId={id}
        className={cls.name}
        criteria={criteriaFull ? { ...criteriaFull, background_url: criteriaFull.background_url ?? null } : null}
        elegibility={elegibility ?? []}
        totalMeetings={totalMeetings ?? 0}
      />
    </Box>
  );
}
