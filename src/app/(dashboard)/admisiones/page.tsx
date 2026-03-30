import Link from "next/link";
import { redirect } from "next/navigation";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { AdmisionesFlow } from "@/features/admisiones/components/admisiones-flow";
import { AdmisionesRecientesCard } from "@/features/admisiones/components/admisiones-recientes-card";
import { getAdmisionPageContext } from "@/features/admisiones/lib/get-admision-page-context";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasAnyPermission, RBAC_PERMISSION } from "@/lib/rbac";

function getStatusTone(active: boolean) {
  return active
    ? "bg-primary/10 text-primary dark:bg-primary/15"
    : "bg-rose-100/90 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
}

export default async function AdmisionesPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  const canAccessAdmisiones = hasAnyPermission(usuario, [
    RBAC_PERMISSION.ADMISION_VIEW,
    RBAC_PERMISSION.ADMISION_CREATE,
    RBAC_PERMISSION.ADMISION_CANCEL,
  ]);

  if (!canAccessAdmisiones) {
    return (
      <main className="min-h-screen bg-transparent">
        <div className="flex flex-col gap-5">
          <AppPageHeader
            eyebrow="Operacion diaria · Admisiones"
            title="Recepcion y cobro de pacientes"
            description="Busca o registra pacientes y prepara el cobro de la atencion en un flujo guiado."
          />

          <AccessDeniedState
            title="No tienes acceso al flujo de admisiones"
            description="Tu perfil actual no tiene permisos para consultar o gestionar admisiones."
          />
        </div>
      </main>
    );
  }

  const context = await getAdmisionPageContext();

  const hasSesionOperativa = Boolean(context.sesionOperativa);
  const hasJornadaCajaActiva = Boolean(context.jornadaCaja);
  const canOperateOnCurrentJornada = hasSesionOperativa && hasJornadaCajaActiva;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-5">
        <AppPageHeader
          eyebrow="Operacion diaria · Admisiones"
          title="Recepcion y cobro de pacientes"
          description="Busca o registra pacientes, selecciona contrato y servicio, calcula el cobro y registra la admision con su movimiento de caja en un flujo guiado."
          statusChips={
            <>
              <span
                className={`rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] ${getStatusTone(
                  hasSesionOperativa,
                )}`}
              >
                Sesion {hasSesionOperativa ? "activa" : "pendiente"}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] ${getStatusTone(
                  hasJornadaCajaActiva,
                )}`}
              >
                Caja {hasJornadaCajaActiva ? "lista" : "pendiente"}
              </span>
            </>
          }
        />

        {!hasSesionOperativa ? (
          <section className="rounded-[24px] border border-destructive/20 bg-destructive/5 p-5 shadow-[0_16px_36px_-30px_color-mix(in_oklab,var(--destructive)_35%,transparent)]">
            <h3 className="text-base font-semibold text-destructive">
              Debes seleccionar una caja antes de operar admisiones
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Primero inicia una sesion operativa desde el dashboard principal.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium transition hover:bg-secondary/60"
              >
                Ir al inicio
              </Link>
            </div>
          </section>
        ) : null}

        {hasSesionOperativa && !hasJornadaCajaActiva ? (
          <section className="rounded-[24px] border border-amber-500/20 bg-amber-500/5 p-5 shadow-[0_16px_36px_-30px_color-mix(in_oklab,oklch(0.75_0.14_85)_35%,transparent)]">
            <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400">
              La sesion esta activa, pero la caja no esta lista
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Para continuar con admisiones, la caja actual debe tener una jornada abierta o reabierta.
            </p>
            <div className="mt-4">
              <Link
                href="/caja"
                className="inline-flex rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium transition hover:bg-secondary/60"
              >
                Ir a caja
              </Link>
            </div>
          </section>
        ) : null}

        {!context.canCreateAdmision ? (
          <section className="rounded-[24px] border border-border/70 bg-card/90 p-5 shadow-[0_16px_36px_-30px_color-mix(in_oklab,var(--foreground)_25%,transparent)]">
            <h3 className="text-base font-semibold text-foreground">
              Tu perfil no registra nuevas admisiones
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Puedes consultar la jornada actual
              {context.canCancelAdmision
                ? " y anular admisiones registradas cuando sea necesario."
                : "."}
              {" "}
              Si tambien necesitas registrar pacientes y cobros, activa el permiso correspondiente en Seguridad.
            </p>
          </section>
        ) : (
          <AdmisionesFlow
            canStartAdmision={canOperateOnCurrentJornada}
            contratos={context.contratos}
            servicios={context.servicios}
          />
        )}

        <AdmisionesRecientesCard
          items={context.recentAdmissions}
          canCancelAdmision={context.canCancelAdmision}
          canOperateOnCurrentJornada={canOperateOnCurrentJornada}
        />
      </div>
    </main>
  );
}