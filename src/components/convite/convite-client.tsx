"use client";

import { Mail } from "lucide-react";

// Tela exibida quando o usuario nao esta logado e precisamos enviar o magic link
export function ConviteClient({ email }: { email: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <img src="/logo-min.svg" alt="Chamas-me Class" className="h-10 w-auto" />
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#7DAF9C20" }}
            >
              <Mail className="w-7 h-7" style={{ color: "#7DAF9C" }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Confirme seu e-mail</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enviamos um link de acesso para{" "}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Clique no link para entrar e aceitar o convite automaticamente.
          </p>
          <p className="text-xs text-muted-foreground mt-6">
            Não recebeu? Verifique sua caixa de spam.
          </p>
        </div>
      </div>
    </main>
  );
}
