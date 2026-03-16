import { notFound } from "next/navigation";

import { EditarColaboradorForm } from "@/features/colaboradores/components/editar-colaborador-form";
import { ResetColaboradorPasswordForm } from "@/features/colaboradores/components/reset-colaborador-password-form";
import { prisma } from "@/lib/prisma";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const colaboradorId = Number(id);

  if (!Number.isInteger(colaboradorId)) {
    notFound();
  }

  const colaborador = await prisma.usuario.findUnique({
    where: { id: colaboradorId },
    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      telefono: true,
      email: true,
      username: true,
      estado: true,
      rolId: true,
    },
  });

  if (!colaborador) {
    notFound();
  }

  const roles = await prisma.rol.findMany({
    where: {
      OR: [{ estado: "ACTIVO" }, { id: colaborador.rolId }],
    },
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
    },
  });

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Administración / Colaboradores
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Editar colaborador
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Actualiza la información general del colaborador, su rol, su estado
            operativo y su contraseña temporal.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <EditarColaboradorForm colaborador={colaborador} roles={roles} />
      </section>

      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Seguridad
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Reasignar contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Define una nueva contraseña temporal para este colaborador.
          </p>
        </div>

        <ResetColaboradorPasswordForm colaboradorId={colaborador.id} />
      </section>
    </main>
  );
}