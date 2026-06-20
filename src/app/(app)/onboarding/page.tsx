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
          <h1 className="text-2xl font-bold text-white">Bem-vindo ao CBSTA</h1>
          <p className="text-sm mt-2" style={{ color: "#7DAF9C" }}>
            Para começar, crie ou entre em uma organização.
          </p>
        </div>
        <OnboardingFlow />
      </div>
    </main>
  );
}
