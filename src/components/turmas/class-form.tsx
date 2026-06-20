"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { criarTurma, editarTurma, excluirTurma } from "@/actions/classes";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  group_label: z.string().max(40).optional(),
});
type FormData = z.infer<typeof schema>;

interface ClassFormProps {
  mode: "create" | "edit";
  defaultValues?: { id: string; name: string; group_label: string };
  onCancel?: () => void;
}

export function ClassForm({ mode, defaultValues, onCancel }: ClassFormProps) {
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultValues?.name ?? "", group_label: defaultValues?.group_label ?? "" },
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("name", data.name);
    if (data.group_label) formData.set("group_label", data.group_label);
    if (mode === "edit" && defaultValues) formData.set("id", defaultValues.id);
    const result = await (mode === "create" ? criarTurma : editarTurma)(formData);
    if (result?.error) toast.error(result.error);
  }

  async function handleDelete() {
    if (!defaultValues) return;
    if (!confirm("Excluir esta classe? Todos os dados serão perdidos.")) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", defaultValues.id);
    const result = await excluirTurma(formData);
    if (result?.error) { toast.error(result.error); setDeleting(false); }
  }

  const handleCancel = onCancel ?? (() => window.history.back());

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Nome da classe"
        placeholder="Ex: Classe dos Juniores"
        autoFocus
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Grupo (opcional)"
        placeholder="Ex: Juniores, Adolescentes"
        {...register("group_label")}
      />
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting} fullWidth>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {isSubmitting ? "Salvando..." : mode === "create" ? "Criar classe" : "Salvar"}
        </Button>
      </Box>

      {mode === "edit" && defaultValues && (
        <>
          <Divider />
          <Button
            variant="text"
            color="error"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            onClick={handleDelete}
            disabled={deleting || isSubmitting}
            fullWidth
          >
            Excluir classe
          </Button>
        </>
      )}
    </Box>
  );
}
