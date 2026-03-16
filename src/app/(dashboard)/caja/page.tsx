import { redirect } from "next/navigation";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { CajaDashboardSummary } from "@/features/caja/components/caja-dashboard-summary";
import { CajasOperativasList } from "@/features/caja/components/cajas-operativas-list";
import { getCajasOperativas } from "@/features/caja/lib/get-cajas-operativas";
import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function normalizeRoleName(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function resolveCanReopen(rolNombre: string | null | undefined) {
  const normalized = normalizeRoleName(rolNombre);

  return (
    normalized.includes("ADMIN") ||
    normalized.includes("SUPER") ||
    normalized.includes("GERENCIA")
  );
}

export default async function CajaPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  const [items, usuarioConRol] = await Promise.all([
    getCajasOperativas(),
    prisma.usuario.findUnique({
      where: {
        id: usuario.id,
      },
      select: {
        id: true,
        username: true,
        rol: {
          select: {
            nombre: true,
          },
        },
      },
    }),
  ]);

  const rolNombre = usuarioConRol?.rol?.nombre ?? null;
  const canReopen = resolveCanReopen(rolNombre);

  const jornadasAbiertas = items.filter(
    (item) =>
      item.jornadaActual?.estado === "ABIERTA" ||
      item.jornadaActual?.estado === "REABIERTA",
  ).length;

  const jornadasCerradas = items.filter(
    (item) => item.jornadaActual?.estado === "CERRADA",
  ).length;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-6">
        <AppPageHeader
          eyebrow="Operación diaria · Caja"
          title="Apertura, cierre y control de recaudo"
          description="Gestiona las jornadas por caja, visualiza el recaudo total del día, separa efectivo de medios electrónicos y controla el cierre operativo."
          statusChips={
            <>
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                Rol detectado: {rolNombre ?? "Sin rol"}
              </span>
              {canReopen ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Puede reabrir caja
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Sin permiso de reapertura
                </span>
              )}
            </>
          }
          aside={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Usuario
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {[
                    usuario.primerNombre,
                    usuario.segundoNombre,
                    usuario.primerApellido,
                    usuario.segundoApellido,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{usuario.username}
                </p>
              </div>

              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rol operativo
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {rolNombre ?? "Sin rol"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Control de apertura, cierre y reapertura
                </p>
              </div>
            </div>
          }
          stats={[
            {
              label: "Cajas visibles",
              value: String(items.length),
              helper: "Cajas activas por piso",
            },
            {
              label: "Jornadas abiertas",
              value: String(jornadasAbiertas),
              helper: "ABIERTA o REABIERTA",
            },
            {
              label: "Jornadas cerradas",
              value: String(jornadasCerradas),
              helper: "Pendientes de reapertura si aplica",
            },
            {
              label: "Permiso de reapertura",
              value: canReopen ? "Sí" : "No",
              helper: "Según rol detectado",
            },
          ]}
        />

        <CajaDashboardSummary items={items} />

        <section className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Operación por piso</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Cajas operativas
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Aquí puedes abrir, cerrar o reabrir jornadas según el estado de
              cada caja, viendo además el recaudo total, el efectivo esperado y
              el desglose por método de pago.
            </p>
          </div>

          <div className="mt-6">
            <CajasOperativasList items={items} canReopen={canReopen} />
          </div>
        </section>
      </div>
    </main>
  );
}