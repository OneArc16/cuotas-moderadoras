import Link from "next/link";

import { AdmisionesFlow } from "@/features/admisiones/components/admisiones-flow";
import { getAdmisionPageContext } from "@/features/admisiones/lib/get-admision-page-context";

export default async function AdmisionesPage() {
  const context = await getAdmisionPageContext();

  const hasSesionOperativa = Boolean(context.sesionOperativa);
  const hasJornadaCajaActiva = Boolean(context.jornadaCaja);
  const canStartAdmision = hasSesionOperativa && hasJornadaCajaActiva;

  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-3xl border bg-background p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Paso 4 · Admisiones</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Admisiones
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Esta pantalla valida primero la sesión operativa y la jornada de caja
            activa antes de continuar con el flujo real de admisión.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Usuario actual</p>
            <h2 className="mt-2 text-lg font-semibold">
              {context.usuario.nombreCompleto}
            </h2>
            <p className="text-sm text-muted-foreground">
              @{context.usuario.username}
            </p>
          </article>

          <article className="rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Sesión operativa</p>
            {context.sesionOperativa ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium text-foreground">
                  {context.sesionOperativa.moduloAtencion.nombre}
                </p>
                <p className="text-muted-foreground">
                  Código: {context.sesionOperativa.moduloAtencion.codigo}
                </p>
                <p className="text-muted-foreground">
                  Piso: {context.sesionOperativa.piso.nombre}
                </p>
                <p className="text-muted-foreground">
                  Caja: {context.sesionOperativa.caja.nombre}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-destructive">
                No hay sesión operativa activa.
              </p>
            )}
          </article>

          <article className="rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Jornada de caja</p>
            {context.jornadaCaja ? (
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium text-foreground">
                  Estado: {context.jornadaCaja.estado}
                </p>
                <p className="text-muted-foreground">
                  Base inicial: ${context.jornadaCaja.baseInicial}
                </p>
                <p className="text-muted-foreground">
                  Total cobros: ${context.jornadaCaja.totalCobros}
                </p>
                <p className="text-muted-foreground">
                  Saldo esperado: ${context.jornadaCaja.saldoEsperado}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-destructive">
                No hay jornada de caja abierta o reabierta.
              </p>
            )}
          </article>
        </section>

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
                className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
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
                className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
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

        {canStartAdmision ? (
          <section className="rounded-3xl border bg-background p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Validaciones iniciales correctas
              </p>
              <h3 className="text-xl font-semibold tracking-tight">
                La pantalla ya está lista para montar el flujo operativo
              </h3>
              <p className="text-sm text-muted-foreground">
                Siguiente bloque: guardar admisión y crear movimiento de caja.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Contratos disponibles
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {context.contratos.length}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Servicios disponibles
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {context.servicios.length}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}