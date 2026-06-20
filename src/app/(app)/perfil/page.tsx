import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = { title: "Configurar perfil" };

export default function PerfilPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <img src="/logo-min.svg" alt="Chamas-me Class" className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo!</h1>
          <p className="text-sm mt-2" style={{ color: "#7DAF9C" }}>
            Antes de começar, informe seu nome.
          </p>
        </div>
        <ProfileForm />
      </div>
    </main>
  );
}
