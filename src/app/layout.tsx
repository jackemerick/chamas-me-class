import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://class.chamas.me"
  ),
  title: {
    default: "CBSTA App",
    template: "%s | CBSTA App",
  },
  description:
    "Gestao de classes biblicas CBSTA. Turmas, alunos, presenca, pontos e certificados.",
  openGraph: {
    title: "CBSTA App",
    description: "Gestao de classes biblicas para professores e organizadores.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${ubuntu.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
