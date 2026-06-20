import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Configurar organização",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img
            src="/logo-min.svg"
            alt="Chamas-me"
            className="h-10 w-auto mx-auto mb-5"
          />
          <h1 className="text-2xl font-bold text-white">Bem-vindo ao Chamas-me Class</h1>
          <p className="text-sm mt-2" style={{ color: "#7DAF9C" }}>
            Para começar, crie ou entre em uma classe.
          </p>
        </div>
        <OnboardingFlow />
      </div>
    </main>
  );
}
