import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F4F9", display: "flex", flexDirection: "column" }}>
      {/* Header simples */}
      <Box sx={{ px: 3, py: 2, bgcolor: "#334035" }}>
        <Link href="/login" style={{ textDecoration: "none" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: 0.5 }}>
            Chamas-me Class
          </Typography>
        </Link>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ flex: 1, maxWidth: 720, mx: "auto", width: "100%", px: 3, py: 5 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.disabled">
          Chamas-me Class · Jack Lopes Emerick Dutra ·{" "}
          <Link href="/privacidade" style={{ color: "inherit" }}>Privacidade</Link>
          {" · "}
          <Link href="/termos" style={{ color: "inherit" }}>Termos</Link>
        </Typography>
      </Box>
    </Box>
  );
}
