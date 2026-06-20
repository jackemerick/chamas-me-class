"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { criarAluno, editarAluno, excluirAluno, verificarDuplicata, vincularAluno } from "@/actions/students";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  birthdate: z.string().optional(),
  city: z.string().max(80).optional(),
  responsible_name: z.string().max(100).optional(),
  responsible_phone: z.string().max(20).optional(),
});

type FormData = z.infer<typeof schema>;

interface Duplicate {
  id: string;
  name: string;
  class_name: string;
}

interface StudentFormProps {
  mode: "create" | "edit";
  classId: string;
  defaultValues?: {
    id: string;
    name: string;
    birthdate: string;
    city: string;
    responsible_name: string;
    responsible_phone: string;
  };
}

export function StudentForm({ mode, classId, defaultValues }: StudentFormProps) {
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  async function checkDuplicate() {
    if (mode !== "create") return;
    const values = getValues();
    if (!values.name || !values.birthdate) return;

    const result = await verificarDuplicata({
      name: values.name,
      birthdate: values.birthdate,
      city: values.city,
      classId,
    });

    if (result.duplicate && result.student) {
      setDuplicate(result.student);
    } else {
      setDuplicate(null);
    }
  }

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("class_id", classId);
    formData.set("name", data.name);
    if (data.birthdate) formData.set("birthdate", data.birthdate);
    if (data.city) formData.set("city", data.city);
    if (data.responsible_name) formData.set("responsible_name", data.responsible_name);
    if (data.responsible_phone) formData.set("responsible_phone", data.responsible_phone);
    if (mode === "edit" && defaultValues) formData.set("id", defaultValues.id);

    const action = mode === "create" ? criarAluno : editarAluno;
    const result = await action(formData);
    if (result?.error) toast.error(result.error);
  }

  async function handleVincular() {
    if (!duplicate) return;
    const formData = new FormData();
    formData.set("student_id", duplicate.id);
    formData.set("class_id", classId);
    const result = await vincularAluno(formData);
    if (result?.error) toast.error(result.error);
  }

  async function handleDelete() {
    if (!defaultValues) return;
    if (!confirm("Excluir este aluno da turma?")) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", defaultValues.id);
    formData.set("class_id", classId);
    const result = await excluirAluno(formData);
    if (result?.error) { toast.error(result.error); setDeleting(false); }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Nome do aluno"
              autoFocus
              {...register("name", { onBlur: checkDuplicate })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="birthdate">Data de nascimento</Label>
              <Input
                id="birthdate"
                type="date"
                {...register("birthdate", { onBlur: checkDuplicate })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo"
                {...register("city", { onBlur: checkDuplicate })}
              />
            </div>
          </div>

          {/* Alerta de duplicata */}
          {duplicate && (
            <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "#FFD166", backgroundColor: "#FFD16610" }}>
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#b58a00" }} />
                <p className="text-sm" style={{ color: "#b58a00" }}>
                  <strong>{duplicate.name}</strong> já está cadastrado em <strong>{duplicate.class_name}</strong>. Deseja vincular este aluno à turma atual em vez de criar um novo cadastro?
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleVincular}
                  style={{ backgroundColor: "#334035" }}
                >
                  Sim, vincular
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setDuplicate(null)}
                >
                  Não, criar novo
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="responsible_name">Nome do responsável <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input id="responsible_name" placeholder="Ex: Maria Santos" {...register("responsible_name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible_phone">Telefone do responsável <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input id="responsible_phone" placeholder="Ex: (11) 99999-9999" {...register("responsible_phone")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!duplicate}
              className="flex-1"
              style={{ backgroundColor: "#334035" }}
            >
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : mode === "create" ? "Cadastrar aluno" : "Salvar"
              }
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
                Remover da turma
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
