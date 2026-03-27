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

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-5">
        <AppPageHeader
          eyebrow="Operación diaria · Caja"
          title="Apertura, cierre y control de recaudo"
          description="Gestiona las jornadas por caja, visualiza el recaudo total del día, separa efectivo de medios electrónicos y controla el cierre operativo."
          statusChips={
            <>
              <span className="rounded-full bg-foreground px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-background">
                Rol detectado: {rolNombre ?? "Sin rol"}
              </span>
              {canReopen ? (
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-primary dark:bg-primary/15">
                  Puede reabrir caja
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-muted-foreground">
                  Sin permiso de reapertura
                </span>
              )}
            </>
          }
        />

        <CajaDashboardSummary items={items} />

        <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
          <div className="flex flex-col gap-2">
            <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Operación por caja
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.65rem]">
              Cajas operativas
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Aquí puedes abrir, cerrar o reabrir jornadas según el estado de
              cada caja, viendo además el recaudo total, el efectivo esperado y
              el desglose por método de pago.
            </p>
          </div>

          <div className="mt-5">
            <CajasOperativasList items={items} canReopen={canReopen} />
          </div>
        </section>
      </div>
    </main>
  );
}