"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

    const action = mode === "create" ? criarTurma : editarTurma;
    const result = await action(formData);
    if (result?.error) toast.error(result.error);
  }

  async function handleDelete() {
    if (!defaultValues) return;
    if (!confirm("Excluir esta turma? Todos os dados serão perdidos.")) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", defaultValues.id);
    const result = await excluirTurma(formData);
    if (result?.error) { toast.error(result.error); setDeleting(false); }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da turma</Label>
            <Input id="name" placeholder="Ex: Turma dos Juniores" autoFocus {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group_label">
              Grupo <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input id="group_label" placeholder="Ex: Juniores, Adolescentes" {...register("group_label")} />
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancelar
              </Button>
            )}
            {mode === "edit" && !onCancel && (
              <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isSubmitting} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1" style={{ backgroundColor: "#334035" }}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "create" ? "Criar turma" : "Salvar"}
            </Button>
          </div>

          {mode === "edit" && defaultValues && (
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
                Excluir turma
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
