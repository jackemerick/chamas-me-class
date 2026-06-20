import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buscarPerfil } from "@/actions/profile";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const perfil = await buscarPerfil();
  if (!perfil) redirect("/login");

  return (
    <ProfileEditForm
      initialName={perfil.full_name}
      initialAvatarUrl={perfil.avatar_url}
      email={perfil.email}
    />
  );
}
