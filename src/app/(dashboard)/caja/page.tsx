import Link from "next/link";
import { redirect } from "next/navigation";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { CajasOperativasList } from "@/features/caja/components/cajas-operativas-list";
import { getCajasOperativas } from "@/features/caja/lib/get-cajas-operativas";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function CajaPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.CAJA_VIEW)) {
    return (
      <main className="min-h-screen bg-transparent">
        <div className="flex flex-col gap-5">
          <AppPageHeader
            eyebrow="Operacion diaria · Caja"
            title="Apertura, cierre y control de recaudo"
            description="Gestiona las jornadas por caja y controla el recaudo operativo del dia."
          />

          <section className="rounded-[24px] border border-destructive/20 bg-destructive/5 p-5 shadow-[0_16px_36px_-30px_color-mix(in_oklab,var(--destructive)_35%,transparent)]">
            <h3 className="text-base font-semibold text-destructive">
              No tienes acceso al modulo de caja
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Tu perfil actual no tiene permisos para consultar ni operar cajas.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium transition hover:bg-secondary/60"
              >
                Volver al inicio
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const items = await getCajasOperativas();
  const rolNombre = usuario.rol?.nombre ?? null;
  const canReopen = hasPermission(usuario, RBAC_PERMISSION.CAJA_REOPEN);

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-5">
        <AppPageHeader
          eyebrow="Operacion diaria · Caja"
          title="Apertura, cierre y control de recaudo"
          description="Gestiona las jornadas por caja, visualiza el recaudo total del dia, separa efectivo de medios electronicos y controla el cierre operativo."
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

        <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
          <div className="flex flex-col gap-2">
            <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Operacion por caja
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.65rem]">
              Cajas operativas
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Aqui puedes abrir, cerrar o reabrir jornadas segun el estado de
              cada caja, viendo ademas el recaudo total, el efectivo esperado y
              el desglose por metodo de pago.
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
