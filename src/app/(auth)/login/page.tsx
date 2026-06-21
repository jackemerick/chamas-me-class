import { LoginForm } from "@/components/auth/login-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
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
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "#F2542D",
              mb: 2,
            }}
          >
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: 24 }}>C</Typography>
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
