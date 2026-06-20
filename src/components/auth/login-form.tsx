"use client";

import { useState, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
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
import { sendMagicLink } from "@/actions/auth";

const schema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  searchParams: Promise<{ error?: string }>;
}

export function LoginForm({ searchParams }: LoginFormProps) {
  const params = use(searchParams);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("email", data.email);

    const result = await sendMagicLink(formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSentEmail(data.email);
    setSent(true);
  }

  // Tela pos-envio
  if (sent) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#7DAF9C20" }}
            >
              <Mail className="w-7 h-7" style={{ color: "#7DAF9C" }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Verifique seu e-mail</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enviamos um link de acesso para{" "}
            <span className="font-medium text-foreground">{sentEmail}</span>.
            Clique no link para entrar no app.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Não recebeu?{" "}
            <button
              onClick={() => setSent(false)}
              className="underline hover:no-underline cursor-pointer"
            >
              Tentar de novo
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>
          Informe seu e-mail para receber o link de acesso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mensagem de erro via URL (ex: link expirado) */}
        {params.error === "link_invalido" && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: "#F2542D20", color: "#F2542D" }}
          >
            O link expirou ou é inválido. Solicite um novo.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            style={{ backgroundColor: "#334035" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Receber link de acesso"
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Sem senha. Acesso seguro por e-mail.
        </p>
      </CardContent>
    </Card>
  );
}
