import { notFound, redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { EditarColaboradorForm } from "@/features/colaboradores/components/editar-colaborador-form";
import { ResetColaboradorPasswordForm } from "@/features/colaboradores/components/reset-colaborador-password-form";
import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.COLLABORATOR_MANAGE)) {
    return (
      <main className="space-y-6">
        <section className="rounded-[28px] border bg-background p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Administracion / Colaboradores
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Editar colaborador
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Actualiza la informacion general del colaborador, su rol, su estado
              operativo y su contrasena temporal.
            </p>
          </div>
        </section>

        <AccessDeniedState
          title="No tienes acceso a editar colaboradores"
          description="Tu perfil actual no tiene permisos para administrar usuarios internos."
        />
      </main>
    );
  }

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

  const rawRoles = await prisma.rol.findMany({
    where: {
      OR: [{ estado: "ACTIVO" }, { id: colaborador.rolId }],
    },
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      estado: true,
      _count: {
        select: {
          usuarios: true,
          permisos: true,
        },
      },
    },
  });

  const roles = rawRoles.map((role) => ({
    id: role.id,
    nombre: role.nombre,
    descripcion: role.descripcion,
    estado: role.estado,
    permissionCount: role._count.permisos,
    usersCount: role._count.usuarios,
  }));

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Administracion / Colaboradores
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Editar colaborador
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Actualiza la informacion general del colaborador, su perfil, su estado
            operativo y su contrasena temporal.
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
            Reasignar contrasena
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Define una nueva contrasena temporal para este colaborador.
          </p>
        </div>

        <ResetColaboradorPasswordForm colaboradorId={colaborador.id} />
      </section>
    </main>
  );
}
