"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { atualizarPerfil } from "@/actions/profile";

interface ProfileEditFormProps {
  initialName: string;
  initialAvatarUrl: string | null;
  email: string;
}

export function ProfileEditForm({ initialName, initialAvatarUrl, email }: ProfileEditFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [preview, setPreview] = useState<string | null>(initialAvatarUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast.error("Foto deve ter no máximo 1MB."); return; }
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem."); return; }
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!name.trim() || name.trim().length < 2) { setError("Nome deve ter pelo menos 2 caracteres."); return; }
    setSaving(true);
    setError(null);
    const fd = new FormData();
    fd.set("full_name", name.trim());
    if (photoFile) fd.set("photo", photoFile);
    const result = await atualizarPerfil(fd);
    setSaving(false);
    if (result?.error) { setError(result.error); return; }
    toast.success("Perfil atualizado.");
    router.back();
  }

  function handleCancel() {
    router.back();
  }

  const initials = (initialName || email).charAt(0).toUpperCase();

  return (
    <Box sx={{ maxWidth: 480, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Meu perfil</Typography>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Foto */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={preview ?? undefined}
                sx={{ width: 88, height: 88, bgcolor: "primary.main", fontSize: 32, fontWeight: 700 }}
              >
                {!preview && initials}
              </Avatar>
              <IconButton
                size="small"
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "background.paper",
                  border: "2px solid",
                  borderColor: "divider",
                  width: 28,
                  height: 28,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
              onClick={() => fileRef.current?.click()}
            >
              Alterar foto · máx 1MB
            </Typography>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </Box>

          {/* Nome */}
          <TextField
            label="Nome completo"
            value={name}
            onChange={e => setName(e.target.value)}
            size="small"
            error={!!error}
            helperText={error ?? undefined}
            fullWidth
            autoComplete="name"
          />

          {/* E-mail (somente leitura) */}
          <TextField
            label="E-mail"
            value={email}
            size="small"
            fullWidth
            disabled
            helperText="O e-mail não pode ser alterado."
          />
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button variant="outlined" fullWidth onClick={handleCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Box>
  );
}
