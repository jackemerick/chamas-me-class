"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { criarEncontro, editarEncontro, excluirEncontro, buscarTituloMusica } from "@/actions/meetings";

const schema = z.object({
  class_id: z.string().uuid("Selecione uma turma"),
  date: z.string().min(1, "Informe a data"),
  theme: z.string().min(1, "Informe o tema").max(120),
  recurrence: z.enum(["none", "weekly", "biweekly", "monthly"]),
  recurrence_end_date: z.string().optional(),
  responsible_user_id: z.string().optional(),
  music_url: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ClassOption { id: string; name: string }
interface TeacherOption { id: string; name: string; email: string }

interface MeetingFormProps {
  classes: ClassOption[];
  defaultValues?: Partial<FormData> & { id?: string };
  onCancel?: () => void;
}

export function MeetingForm({ classes, defaultValues, onCancel }: MeetingFormProps) {
  const isEdit = !!defaultValues?.id;
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [musicTitle, setMusicTitle] = useState<string | null>(null);
  const [fetchingMusic, setFetchingMusic] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recurrence: "none", ...defaultValues },
  });

  const recurrence = watch("recurrence");
  const classId = watch("class_id");

  const loadTeachers = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoadingTeachers(true);
    try {
      const res = await fetch(`/api/class-teachers?class_id=${cid}`);
      const data = await res.json();
      setTeachers(data.teachers ?? []);
    } catch { setTeachers([]); }
    finally { setLoadingTeachers(false); }
  }, []);

  async function handleClassChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("class_id", e.target.value);
    setValue("responsible_user_id", "");
    await loadTeachers(e.target.value);
  }

  async function handleMusicBlur(e: React.FocusEvent<HTMLInputElement>) {
    const url = e.target.value.trim();
    if (!url) return;
    setFetchingMusic(true);
    const result = await buscarTituloMusica(url);
    setMusicTitle(result.title);
    setFetchingMusic(false);
  }

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) formData.set(k, v); });
    if (musicTitle) formData.set("music_title", musicTitle);
    if (isEdit && defaultValues?.id) formData.set("id", defaultValues.id);
    const action = isEdit ? editarEncontro : criarEncontro;
    const result = await action(formData);
    if (result?.error) toast.error(result.error);
  }

  async function handleDelete() {
    if (!defaultValues?.id) return;
    if (!confirm("Excluir este encontro?")) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", defaultValues.id);
    const result = await excluirEncontro(formData);
    if (result?.error) { toast.error(result.error); setDeleting(false); }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Tema"
        placeholder="Ex: A fé que move montanhas"
        autoFocus
        error={!!errors.theme}
        helperText={errors.theme?.message}
        {...register("theme")}
      />

      <TextField
        select
        label="Turma"
        defaultValue={defaultValues?.class_id ?? ""}
        error={!!errors.class_id}
        helperText={errors.class_id?.message}
        {...register("class_id", { onChange: handleClassChange })}
      >
        <MenuItem value="">Selecione uma turma</MenuItem>
        {classes.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))}
      </TextField>

      <TextField
        label="Data"
        type="date"
        slotProps={{ inputLabel: { shrink: true } }}
        error={!!errors.date}
        helperText={errors.date?.message}
        {...register("date")}
      />

      <TextField
        select
        label="Recorrência"
        defaultValue="none"
        {...register("recurrence")}
      >
        <MenuItem value="none">Sem recorrência</MenuItem>
        <MenuItem value="weekly">Semanal</MenuItem>
        <MenuItem value="biweekly">Quinzenal</MenuItem>
        <MenuItem value="monthly">Mensal</MenuItem>
      </TextField>

      {recurrence !== "none" && (
        <TextField
          label="Repetir até"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          {...register("recurrence_end_date")}
        />
      )}

      {classId && (
        <TextField
          select
          label="Responsável"
          defaultValue=""
          disabled={loadingTeachers}
          {...register("responsible_user_id")}
        >
          <MenuItem value="">
            {loadingTeachers ? "Carregando..." : "Nenhum"}
          </MenuItem>
          {teachers.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.name || t.email}</MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        label="Música"
        placeholder="https://..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LinkRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        {...register("music_url")}
        onBlur={handleMusicBlur}
        helperText={
          fetchingMusic ? "Buscando título..." :
          musicTitle ? musicTitle :
          "Link do YouTube ou Spotify"
        }
      />

      <TextField
        label="Notas"
        multiline
        rows={3}
        placeholder="Observações, links, tópicos do encontro..."
        {...register("notes")}
      />

      <Box sx={{ display: "flex", gap: 1.5 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting} fullWidth>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isSubmitting ? "Salvando..." : isEdit ? "Salvar" : recurrence !== "none" ? "Criar encontros" : "Criar encontro"}
        </Button>
      </Box>

      {isEdit && defaultValues?.id && (
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
            Excluir encontro
          </Button>
        </>
      )}
    </Box>
  );
}
