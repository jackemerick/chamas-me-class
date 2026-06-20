"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80),
  group_label: z.string().max(40).optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateClassButtonProps {
  orgId: string;
}

export function CreateClassButton({ orgId }: CreateClassButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    const { error } = await supabase.from("classes").insert({
      org_id: orgId,
      name: data.name,
      group_label: data.group_label || null,
      created_by: user.id,
      updated_by: user.id,
    });

    if (error) {
      toast.error("Erro ao criar classe. Tente novamente.");
      return;
    }

    toast.success("Classe criada com sucesso!");
    reset();
    setOpen(false);
    router.refresh();
  }

  if (open) {
    return (
      <Card className="w-full max-w-sm shadow-lg border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nova classe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Nome da classe</Label>
              <Input
                id="class-name"
                placeholder="Ex: Classe dos Juniores"
                autoFocus
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-label">
                Grupo{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="group-label"
                placeholder="Ex: Juniores, Adolescentes"
                {...register("group_label")}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                style={{ backgroundColor: "#334035" }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Criar classe"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={() => setOpen(true)}
      style={{ backgroundColor: "#334035" }}
      className="gap-2"
    >
      <Plus className="w-4 h-4" />
      Nova classe
    </Button>
  );
}
