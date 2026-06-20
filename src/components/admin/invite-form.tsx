"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import { enviarConvite } from "@/actions/invite";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type FormData = z.infer<typeof schema>;

export function InviteForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("email", data.email);
    const result = await enviarConvite(formData);
    if (result?.error) toast.error(result.error);
    else { toast.success(`Convite enviado para ${data.email}`); reset(); }
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#7DAF9C20" }}>
            <MailRoundedIcon sx={{ fontSize: 18, color: "#7DAF9C" }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Convidar professor</Typography>
            <Typography variant="caption" color="text.secondary">
              A pessoa receberá um e-mail com link de acesso direto.
            </Typography>
          </Box>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <TextField
            type="email"
            placeholder="professor@email.com"
            size="small"
            autoComplete="off"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ flex: 1 }}
            {...register("email")}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon />}
            sx={{ whiteSpace: "nowrap", mt: 0.125 }}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
