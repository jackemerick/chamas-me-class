"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { salvarPerfil } from "@/actions/profile";
import { useSearchParams } from "next/navigation";

const schema = z.object({ full_name: z.string().min(2, "Mínimo 2 caracteres").max(80) });
type FormData = z.infer<typeof schema>;

export function ProfileForm() {
  const searchParams = useSearchParams();
  const org = searchParams.get("org");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("full_name", data.full_name);
    if (org) formData.set("org", org);
    const result = await salvarPerfil(formData);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Seu nome</CardTitle>
        <CardDescription>Como você quer ser identificado no app?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              placeholder="Ex: Maria Santos"
              autoFocus
              autoComplete="name"
              {...register("full_name")}
            />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full" style={{ backgroundColor: "#334035" }}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Entrar no app"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
