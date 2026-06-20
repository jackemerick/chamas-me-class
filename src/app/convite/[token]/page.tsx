import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { aceitarConvite } from "@/actions/invite";
import { ConviteClient } from "@/components/convite/convite-client";

export const metadata: Metadata = { title: "Aceitar convite" };

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await aceitarConvite(token);

  // Convite inválido ou expirado
  if ("error" in result && result.error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-5">
            <img src="/logo-min.svg" alt="Chamas-me Class" className="h-10 w-auto" />
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-destructive">Convite inválido</h2>
            <p className="text-muted-foreground text-sm mb-6">{result.error}</p>
            <a
              href="/login"
              className="inline-block text-sm underline text-muted-foreground"
            >
              Ir para o login
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Precisa logar: mostra tela de aguardo com e-mail preenchido
  if ("needsLogin" in result && result.needsLogin) {
    return <ConviteClient email={result.email} />;
  }

  // Logado e convite aceito: redireciona
  if ("redirectTo" in result && result.redirectTo) {
    redirect(result.redirectTo);
  }

  redirect("/dashboard");
}
