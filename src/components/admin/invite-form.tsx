"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { enviarConvite } from "@/actions/invite";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type FormData = z.infer<typeof schema>;

export function InviteForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.set("email", data.email);
    const result = await enviarConvite(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Convite enviado para ${data.email}`);
      reset();
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#7DAF9C20" }}>
            <Mail className="w-4 h-4" style={{ color: "#7DAF9C" }} />
          </div>
          <div>
            <CardTitle className="text-base">Convidar professor</CardTitle>
            <CardDescription>A pessoa receberá um e-mail com link de acesso direto.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-email" className="sr-only">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="professor@email.com"
              autoComplete="off"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#334035" }}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1.5" />Enviar</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
