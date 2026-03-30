import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { ColaboradoresEstadoFilter } from "@/features/colaboradores/components/colaboradores-estado-filter";
import { ColaboradoresSearchInput } from "@/features/colaboradores/components/colaboradores-search-input";
import { ToggleColaboradorStatusButton } from "@/features/colaboradores/components/toggle-colaborador-status-button";
import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

function getNombreCompleto(usuario: {
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

function getEstadoClasses(estado: string) {
  switch (estado) {
    case "ACTIVO":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "INACTIVO":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "BLOQUEADO":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-muted text-foreground ring-1 ring-border";
  }
}

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; estado?: string }>;
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
              Administracion
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Colaboradores
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Administra el personal interno del sistema, sus roles y su estado
              operativo.
            </p>
          </div>
        </section>

        <AccessDeniedState
          title="No tienes acceso a colaboradores"
          description="Tu perfil actual no tiene permisos para administrar usuarios internos."
        />
      </main>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = resolvedSearchParams?.q?.trim() ?? "";
  const estadoParam = resolvedSearchParams?.estado?.trim() ?? "";

  const estado =
    estadoParam === "ACTIVO" ||
    estadoParam === "INACTIVO" ||
    estadoParam === "BLOQUEADO"
      ? estadoParam
      : "";

  const where = {
    ...(estado ? { estado } : {}),
    ...(q
      ? {
          OR: [
            { primerNombre: { contains: q, mode: "insensitive" as const } },
            { segundoNombre: { contains: q, mode: "insensitive" as const } },
            { primerApellido: { contains: q, mode: "insensitive" as const } },
            { segundoApellido: { contains: q, mode: "insensitive" as const } },
            { numeroDocumento: { contains: q, mode: "insensitive" as const } },
            { username: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [colaboradores, total, activos, inactivos] = await Promise.all([
    prisma.usuario.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        rol: {
          select: {
            nombre: true,
          },
        },
      },
    }),
    prisma.usuario.count(),
    prisma.usuario.count({
      where: {
        estado: "ACTIVO",
      },
    }),
    prisma.usuario.count({
      where: {
        estado: "INACTIVO",
      },
    }),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Administracion
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Colaboradores
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Administra el personal interno del sistema, sus roles y su estado
              operativo.
            </p>
          </div>

          <Link
            href="/colaboradores/nuevo"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Nuevo colaborador
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total registrados</p>
          <p className="mt-2 text-3xl font-semibold">{total}</p>
        </div>

        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="mt-2 text-3xl font-semibold">{activos}</p>
        </div>

        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Inactivos</p>
          <p className="mt-2 text-3xl font-semibold">{inactivos}</p>
        </div>
      </section>

      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Listado de colaboradores</h2>
              <p className="text-sm text-muted-foreground">
                Personal interno registrado con su rol y estado actual.
              </p>

              {q || estado ? (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {q ? (
                    <span>
                      Busqueda: <span className="font-medium text-foreground">{q}</span>
                    </span>
                  ) : null}

                  {estado ? (
                    <span>
                      Estado: <span className="font-medium text-foreground">{estado}</span>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 md:flex-row">
              <ColaboradoresSearchInput />
              <ColaboradoresEstadoFilter />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border">
          <div className="grid grid-cols-12 bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <div className="col-span-4">Colaborador</div>
            <div className="col-span-2">Usuario</div>
            <div className="col-span-2">Rol</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          {colaboradores.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No encontramos colaboradores con los filtros aplicados.
            </div>
          ) : (
            <div className="divide-y">
              {colaboradores.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className="grid grid-cols-12 items-center px-4 py-4 text-sm"
                >
                  <div className="col-span-4 min-w-0">
                    <p className="truncate font-medium">
                      {getNombreCompleto(colaborador)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {colaborador.numeroDocumento}
                    </p>
                  </div>

                  <div className="col-span-2 min-w-0">
                    <p className="truncate">@{colaborador.username}</p>
                  </div>

                  <div className="col-span-2 min-w-0">
                    <p className="truncate">{colaborador.rol.nombre}</p>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoClasses(
                        colaborador.estado,
                      )}`}
                    >
                      {colaborador.estado}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <ToggleColaboradorStatusButton
                      id={colaborador.id}
                      estado={colaborador.estado}
                    />

                    <Link
                      href={`/colaboradores/${colaborador.id}/editar`}
                      className="inline-flex rounded-xl border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
