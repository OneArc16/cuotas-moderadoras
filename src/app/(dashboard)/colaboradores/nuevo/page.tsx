import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { NuevoColaboradorForm } from "@/features/colaboradores/components/nuevo-colaborador-form";
import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function NuevoColaboradorPage() {
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
              Nuevo colaborador
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Registra un nuevo colaborador interno, asignale su rol y define su
              estado inicial dentro del sistema.
            </p>
          </div>
        </section>

        <AccessDeniedState
          title="No tienes acceso a crear colaboradores"
          description="Tu perfil actual no tiene permisos para registrar usuarios internos."
        />
      </main>
    );
  }

  const rawRoles = await prisma.rol.findMany({
    where: {
      estado: "ACTIVO",
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
            Nuevo colaborador
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Registra un nuevo colaborador interno, asignale su perfil y define su
            estado inicial dentro del sistema.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <NuevoColaboradorForm roles={roles} />
      </section>
    </main>
  );
}
