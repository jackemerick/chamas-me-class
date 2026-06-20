"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { createOrg } from "@/actions/org";
import { entrarComConvite } from "@/actions/invite";

type Mode = "choose" | "create" | "join";

const createSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
});
const joinSchema = z.object({ code: z.string().min(1, "Informe o código de convite") });
type CreateForm = z.infer<typeof createSchema>;
type JoinForm = z.infer<typeof joinSchema>;

export function OnboardingFlow() {
  const [mode, setMode] = useState<Mode>("choose");
  if (mode === "create") return <CreateOrgForm onBack={() => setMode("choose")} />;
  if (mode === "join") return <JoinOrgForm onBack={() => setMode("choose")} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <CardActionArea onClick={() => setMode("create")} sx={{ p: 0.5 }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#F2542D18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AddCircleOutlineRoundedIcon sx={{ color: "#F2542D" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Criar conta para sua Igreja</Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure o Chamas-me Class para sua igreja ou grupo. Você será o administrador.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <CardActionArea onClick={() => setMode("join")} sx={{ p: 0.5 }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#7DAF9C18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LoginRoundedIcon sx={{ color: "#7DAF9C" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Entrar em conta de sua Igreja</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sua igreja já usa o Chamas-me Class. Entre com o código de convite que o administrador te passou.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}

function CreateOrgForm({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slug = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug, { shouldValidate: true });
  }

  async function onSubmit(data: CreateForm) {
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("slug", data.slug);
    const result = await createOrg(formData);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Criar conta para sua Igreja</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Informe o nome da sua igreja ou grupo.</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nome da igreja ou grupo"
            placeholder="Ex: Igreja Batista Central"
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name", { onChange: handleNameChange })}
          />
          <input type="hidden" {...register("slug")} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={onBack} disabled={isSubmitting} fullWidth>Voltar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {isSubmitting ? "Criando..." : "Criar igreja"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function JoinOrgForm({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  });

  async function onSubmit(data: JoinForm) {
    const formData = new FormData();
    formData.set("code", data.code);
    const result = await entrarComConvite(formData);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Entrar em conta de sua Igreja</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Cole o código de convite que o administrador te enviou.</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Código de convite"
            placeholder="Ex: ABCD-1234"
            autoFocus
            slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
            error={!!errors.code}
            helperText={errors.code?.message}
            {...register("code")}
          />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={onBack} disabled={isSubmitting} fullWidth>Voltar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
