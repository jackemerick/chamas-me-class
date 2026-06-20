"use client";

import { useState, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import { sendMagicLink } from "@/actions/auth";

const schema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});
type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  searchParams: Promise<{ error?: string }>;
}

export function LoginForm({ searchParams }: LoginFormProps) {
  const params = use(searchParams);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("email", data.email);
    const result = await sendMagicLink(formData);
    if (result.error) { toast.error(result.error); return; }
    setSentEmail(data.email);
    setSent(true);
  }

  if (sent) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "secondary.main", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <MailOutlineRoundedIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Verifique seu e-mail</Typography>
          <Typography variant="body2" color="text.secondary">
            Enviamos um link de acesso para <strong>{sentEmail}</strong>. Clique no link para entrar.
          </Typography>
          <Button variant="text" size="small" onClick={() => setSent(false)} sx={{ mt: 2 }}>
            Não recebeu? Tentar de novo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Entrar</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Informe seu e-mail para receber o link de acesso.
        </Typography>

        {params.error === "link_invalido" && (
          <Alert severity="error" sx={{ mb: 2 }}>O link expirou ou é inválido. Solicite um novo.</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isSubmitting ? "Enviando..." : "Receber link de acesso"}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 3 }}>
          Sem senha. Acesso seguro por e-mail.
        </Typography>
      </CardContent>
    </Card>
  );
}
