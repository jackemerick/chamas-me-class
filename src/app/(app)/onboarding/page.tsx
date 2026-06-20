import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = { title: "Configurar sua igreja" };

export default function OnboardingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#334035",
        px: 2,
        py: 6,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Image src="/logo-min.svg" alt="Chamas-me" width={48} height={48} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "white", display: "block" }}>
            Bem-vindo ao Chamas-me Class
          </Typography>
          <Typography variant="body2" sx={{ color: "#7DAF9C", mt: 0.5 }}>
            Para começar, crie ou entre em uma classe.
          </Typography>
        </Box>
        <OnboardingFlow />
      </Box>
    </Box>
  );
}
