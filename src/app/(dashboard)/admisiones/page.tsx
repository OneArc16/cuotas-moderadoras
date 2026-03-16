import Link from "next/link";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { AdmisionesFlow } from "@/features/admisiones/components/admisiones-flow";
import { getAdmisionPageContext } from "@/features/admisiones/lib/get-admision-page-context";

function getStatusTone(active: boolean) {
  return active
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default async function AdmisionesPage() {
  const context = await getAdmisionPageContext();

  const hasSesionOperativa = Boolean(context.sesionOperativa);
  const hasJornadaCajaActiva = Boolean(context.jornadaCaja);
  const canStartAdmision = hasSesionOperativa && hasJornadaCajaActiva;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-6">
        <AppPageHeader
          eyebrow="Operación diaria · Admisiones"
          title="Recepción y cobro de pacientes"
          description="Busca o registra pacientes, selecciona contrato y servicio, calcula el cobro y registra la admisión con su movimiento de caja en un flujo guiado."
          statusChips={
            <>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(
                  hasSesionOperativa,
                )}`}
              >
                Sesión {hasSesionOperativa ? "activa" : "pendiente"}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(
                  hasJornadaCajaActiva,
                )}`}
              >
                Caja {hasJornadaCajaActiva ? "lista" : "pendiente"}
              </span>
            </>
          }
          aside={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Usuario
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {context.usuario.nombreCompleto}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{context.usuario.username}
                </p>
              </div>

              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Contexto operativo
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {context.sesionOperativa?.moduloAtencion.nombre ||
                    "Sin módulo activo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {context.sesionOperativa
                    ? `${context.sesionOperativa.piso.nombre} · Caja ${context.sesionOperativa.caja.nombre}`
                    : "Debes iniciar sesión operativa"}
                </p>
              </div>
            </div>
          }
          stats={[
            {
              label: "Módulo operativo",
              value: context.sesionOperativa?.moduloAtencion.codigo || "—",
              helper: context.sesionOperativa?.moduloAtencion.nombre
                ? `${context.sesionOperativa.moduloAtencion.nombre}`
                : "Sin sesión operativa",
            },
            {
              label: "Jornada de caja",
              value: context.jornadaCaja?.estado || "Sin jornada",
              helper: context.jornadaCaja
                ? `Base ${formatMoney(context.jornadaCaja.baseInicial)}`
                : "La caja debe estar abierta o reabierta",
            },
            {
              label: "Contratos visibles",
              value: String(context.contratos.length),
              helper: "Solo contratos con tarifa activa",
            },
            {
              label: "Servicios visibles",
              value: String(context.servicios.length),
              helper: "Solo servicios con tarifa activa",
            },
          ]}
        />

        {!hasSesionOperativa ? (
          <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-destructive">
              Debes seleccionar un módulo antes de admitir pacientes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Primero inicia una sesión operativa desde el dashboard principal.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex rounded-2xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Ir al inicio
              </Link>
            </div>
          </section>
        ) : null}

        {hasSesionOperativa && !hasJornadaCajaActiva ? (
          <section className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400">
              La sesión está activa, pero la caja no está lista
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Para continuar con admisiones, la caja del piso debe tener una
              jornada abierta o reabierta.
            </p>
            <div className="mt-4">
              <Link
                href="/caja"
                className="inline-flex rounded-2xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Ir a caja
              </Link>
            </div>
          </section>
        ) : null}

        <AdmisionesFlow
          canStartAdmision={canStartAdmision}
          contratos={context.contratos}
          servicios={context.servicios}
          tarifaCombos={context.tarifaCombos}
        />
      </div>
    </main>
  );
}