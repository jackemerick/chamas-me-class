"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Link as LinkIcon, Trash2, Music } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    defaultValues: {
      recurrence: "none",
      ...defaultValues,
    },
  });

  const recurrence = watch("recurrence");
  const classId = watch("class_id");

  // Carrega professores ao trocar de turma
  const loadTeachers = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoadingTeachers(true);
    try {
      const res = await fetch(`/api/class-teachers?class_id=${cid}`);
      const data = await res.json();
      setTeachers(data.teachers ?? []);
    } catch {
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  async function handleClassChange(e: React.ChangeEvent<HTMLSelectElement>) {
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

  const selectClass = "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-0 px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Tema */}
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Input id="theme" placeholder="Ex: A fé que move montanhas" autoFocus {...register("theme")} />
            {errors.theme && <p className="text-sm text-destructive">{errors.theme.message}</p>}
          </div>

          {/* Turma */}
          <div className="space-y-2">
            <Label htmlFor="class_id">Turma</Label>
            <select
              id="class_id"
              className={selectClass}
              defaultValue={defaultValues?.class_id ?? ""}
              {...register("class_id")}
              onChange={handleClassChange}
            >
              <option value="">Selecione uma turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.class_id && <p className="text-sm text-destructive">{errors.class_id.message}</p>}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          {/* Recorrência */}
          <div className="space-y-2">
            <Label htmlFor="recurrence">Recorrência</Label>
            <select id="recurrence" className={selectClass} {...register("recurrence")}>
              <option value="none">Sem recorrência</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>

          {recurrence !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="recurrence_end_date">Repetir até</Label>
              <Input id="recurrence_end_date" type="date" {...register("recurrence_end_date")} />
            </div>
          )}

          {/* Responsável */}
          {classId && (
            <div className="space-y-2">
              <Label htmlFor="responsible_user_id">Responsável</Label>
              {loadingTeachers ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Carregando professores...
                </div>
              ) : (
                <select id="responsible_user_id" className={selectClass} {...register("responsible_user_id")}>
                  <option value="">Nenhum</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name || t.email}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Música */}
          <div className="space-y-2">
            <Label htmlFor="music_url">
              <Music className="w-3.5 h-3.5 inline mr-1" />
              Música <span className="text-muted-foreground font-normal">(link YouTube ou Spotify)</span>
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="music_url"
                placeholder="https://..."
                className="pl-8"
                {...register("music_url")}
                onBlur={handleMusicBlur}
              />
            </div>
            {fetchingMusic && <p className="text-xs text-muted-foreground">Buscando título...</p>}
            {musicTitle && (
              <p className="text-xs font-medium" style={{ color: "#334035" }}>
                {musicTitle}
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Observações, links, tópicos do encontro..."
              className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register("notes")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1" style={{ backgroundColor: "#334035" }}>
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEdit ? "Salvar" : recurrence !== "none" ? "Criar encontros" : "Criar encontro"
              }
            </Button>
          </div>

          {isEdit && defaultValues?.id && (
            <div className="pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive w-full"
                onClick={handleDelete}
                disabled={deleting || isSubmitting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Excluir encontro
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
