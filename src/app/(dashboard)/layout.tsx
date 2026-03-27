import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { getCurrentUsuario } from "@/lib/current-user";

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
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1720px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 xl:flex-row xl:items-start xl:gap-5 xl:px-5 xl:py-5">
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

        <section className="min-w-0 flex-1 pb-2">{children}</section>
      </div>
    </div>
  );
}

