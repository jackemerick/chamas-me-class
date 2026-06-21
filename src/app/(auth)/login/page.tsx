import { LoginForm } from "@/components/auth/login-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;

  // Supabase às vezes redireciona para /login com token_hash — encaminha para /auth/confirm
  if (params.token_hash) {
    const qs = new URLSearchParams({ token_hash: params.token_hash, type: params.type ?? "magiclink" });
    redirect(`/auth/confirm?${qs.toString()}`);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#334035",
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <img src="/logo-min.svg" alt="Chamas-me Class" style={{ height: 48, width: "auto" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "white", display: "block" }}>
            Chamas-me Class
          </Typography>
          <Typography variant="body2" sx={{ color: "#7DAF9C", mt: 0.5 }}>
            Gestão de classes bíblicas
          </Typography>
        </Box>

        <LoginForm searchParams={searchParams} />

        {/* Links legais */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
            <Link href="/privacidade" style={{ color: "inherit", textDecoration: "underline" }}>
              Privacidade e Segurança
            </Link>
            {" · "}
            <Link href="/termos" style={{ color: "inherit", textDecoration: "underline" }}>
              Termos de Uso
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
