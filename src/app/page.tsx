import { redirect } from "next/navigation";

// Raiz redireciona para o dashboard (middleware cuida da auth)
export default function Home() {
  redirect("/dashboard");
}
