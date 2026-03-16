import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { getCurrentUsuario } from "@/lib/current-user";

function buildFullName(usuario: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [
    usuario.primerNombre,
    usuario.segundoNombre,
    usuario.primerApellido,
    usuario.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <AppSidebar
          usuario={{
            nombreCompleto: [
              usuario.primerNombre,
              usuario.segundoNombre,
              usuario.primerApellido,
              usuario.segundoApellido,
            ]
              .filter(Boolean)
              .join(" "),
            username: usuario.username,
          }}
        />

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}