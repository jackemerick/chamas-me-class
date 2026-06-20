import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
};

// Recupera mensagem de erro da URL se houver
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md">
        {/* Logo e titulo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: "#F2542D" }}
          >
            {/* Placeholder para logo CBSTA */}
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Chamas-me Class</h1>
          <p className="text-sm mt-1" style={{ color: "#7DAF9C" }}>
            Gestao de classes biblicas
          </p>
        </div>

        <LoginForm searchParams={searchParams} />
      </div>
    </main>
  );
}
