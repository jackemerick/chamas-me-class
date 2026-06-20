"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createOrg, joinOrg } from "@/actions/org";

type Mode = "choose" | "create" | "join";

// Schema de criacao
const createSchema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres").max(80),
  slug: z
    .string()
    .min(2, "Minimo 2 caracteres")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Apenas letras minusculas, numeros e hifens"),
});

// Schema de entrada
const joinSchema = z.object({
  slug: z.string().min(2, "Informe o identificador da organizacao"),
});

type CreateForm = z.infer<typeof createSchema>;
type JoinForm = z.infer<typeof joinSchema>;

export function OnboardingFlow() {
  const [mode, setMode] = useState<Mode>("choose");

  if (mode === "create") {
    return <CreateOrgForm onBack={() => setMode("choose")} />;
  }

  if (mode === "join") {
    return <JoinOrgForm onBack={() => setMode("choose")} />;
  }

  return (
    <div className="grid gap-4">
      {/* Opcao: criar org */}
      <Card
        className="cursor-pointer border-2 border-transparent hover:border-brand-accent transition-colors"
        onClick={() => setMode("create")}
      >
        <CardContent className="flex items-start gap-4 pt-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: "#F2542D20" }}
          >
            <Plus className="w-5 h-5" style={{ color: "#F2542D" }} />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Criar organizacao</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Configure o CBSTA para sua igreja ou grupo. Voce sera o administrador.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Opcao: entrar em org existente */}
      <Card
        className="cursor-pointer border-2 border-transparent hover:border-brand-accent transition-colors"
        onClick={() => setMode("join")}
      >
        <CardContent className="flex items-start gap-4 pt-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: "#7DAF9C20" }}
          >
            <LogIn className="w-5 h-5" style={{ color: "#7DAF9C" }} />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Entrar em uma organizacao</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ja existe uma org do CBSTA na sua igreja. Entre com o identificador.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateOrgForm({ onBack }: { onBack: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  // Gera slug automatico a partir do nome
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
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Criar organizacao</CardTitle>
        <CardDescription>
          Informe o nome da sua igreja ou grupo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da organizacao</Label>
            <Input
              id="name"
              placeholder="Ex: Igreja Batista Central"
              autoFocus
              {...register("name", { onChange: handleNameChange })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Identificador{" "}
              <span className="text-muted-foreground font-normal">
                (unico, nao pode mudar depois)
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">cbsta.me/</span>
              <Input
                id="slug"
                placeholder="minha-igreja"
                {...register("slug")}
              />
            </div>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              style={{ backgroundColor: "#334035" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar organizacao"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function JoinOrgForm({ onBack }: { onBack: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  });

  async function onSubmit(data: JoinForm) {
    const formData = new FormData();
    formData.set("slug", data.slug);

    const result = await joinOrg(formData);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Entrar em uma organizacao</CardTitle>
        <CardDescription>
          Solicite o identificador ao administrador da sua org.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Identificador da organizacao</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">cbsta.me/</span>
              <Input
                id="slug"
                placeholder="minha-igreja"
                autoFocus
                {...register("slug")}
              />
            </div>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              style={{ backgroundColor: "#334035" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
