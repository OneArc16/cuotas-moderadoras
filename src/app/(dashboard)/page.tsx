import { redirect } from "next/navigation";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { CloseSesionOperativaButton } from "@/features/sesion-operativa/components/close-sesion-operativa-button";
import { CajaSelector } from "@/features/sesion-operativa/components/caja-selector";
import { getCajasDisponibles } from "@/features/sesion-operativa/lib/get-cajas-disponibles";
import { getSesionOperativaActual } from "@/features/sesion-operativa/lib/get-sesion-operativa-actual";
import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  if (!(await getCurrentUsuario())) {
    redirect("/login");
  }

  const [cajasDisponibles, sesionOperativa] = await Promise.all([
    getCajasDisponibles(),
    getSesionOperativaActual(),
  ]);

  const jornadaCaja = sesionOperativa?.cajaId
    ? await prisma.jornadaCaja.findFirst({
        where: {
          cajaId: sesionOperativa.cajaId,
          estado: {
            in: ["ABIERTA", "REABIERTA"],
          },
        },
        orderBy: [{ fechaOperativa: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          estado: true,
          baseInicial: true,
          saldoEsperado: true,
          fechaOperativa: true,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-5">
        <AppPageHeader
          eyebrow="Inicio operativo · Dashboard"
          title="Selección de caja y control de sesión"
          description="Desde aquí eliges la caja de trabajo y validas que tenga jornada activa antes de entrar a admisiones."
          statusChips={
            <>
              {sesionOperativa ? (
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-primary dark:bg-primary/15">
                  Sesión operativa activa
                </span>
              ) : (
                <span className="rounded-full bg-amber-100/90 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Sesión pendiente
                </span>
              )}
              {jornadaCaja ? (
                <span className="rounded-full bg-foreground px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-background">
                  Caja {jornadaCaja.estado.toLowerCase()}
                </span>
              ) : null}
            </>
          }
        />

        {!sesionOperativa ? (
          <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Inicio de operación
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.65rem]">
                Selecciona tu caja operativa
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Solo podrás continuar si la caja tiene una jornada abierta o
                reabierta para la fecha operativa.
              </p>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
              <div className="rounded-[24px] border border-border/70 bg-secondary/35 p-4 sm:p-5">
                <CajaSelector cajas={cajasDisponibles} />
              </div>

              <div className="rounded-[24px] border border-border/70 bg-secondary/35 p-4 sm:p-5">
                <p className="text-sm font-semibold tracking-[0.02em] text-foreground">
                  Reglas operativas
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[20px] border border-border/60 bg-background/85 p-4">
                    <p className="text-sm font-medium text-foreground">
                      1. Selección de caja
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      La sesión operativa queda ligada directamente a la caja.
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-border/60 bg-background/85 p-4">
                    <p className="text-sm font-medium text-foreground">
                      2. Validación de jornada
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Solo podrás entrar a cajas con jornada ABIERTA o REABIERTA.
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-border/60 bg-background/85 p-4">
                    <p className="text-sm font-medium text-foreground">
                      3. Continuidad operativa
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Cada usuario conserva una sola sesión activa a la vez.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Sesión operativa actual
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.65rem]">
                  Ya tienes una sesión activa
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Desde aquí puedes validar el contexto actual de trabajo y
                  cerrar la sesión operativa cuando termines.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <CloseSesionOperativaButton sesionId={sesionOperativa.id} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
              <div className="rounded-[24px] border border-border/70 bg-secondary/35 p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-border/60 bg-background/85 p-4 md:col-span-2">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Caja actual
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">
                      {sesionOperativa.caja.nombre}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Contexto operativo activo
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-border/60 bg-background/85 p-4 md:col-span-2">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Fecha operativa
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {new Date(
                        sesionOperativa.fechaOperativa,
                      ).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/70 bg-secondary/35 p-4 sm:p-5">
                <p className="text-sm font-semibold tracking-[0.02em] text-foreground">
                  Estado de la caja actual
                </p>

                {jornadaCaja ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[20px] border border-border/60 bg-background/85 p-4">
                      <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Jornada
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {jornadaCaja.estado}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(jornadaCaja.fechaOperativa).toLocaleDateString(
                          "es-CO",
                        )}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-border/60 bg-background/85 p-4">
                        <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Base inicial
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {formatMoney(Number(jornadaCaja.baseInicial))}
                        </p>
                      </div>

                      <div className="rounded-[20px] border border-border/60 bg-background/85 p-4">
                        <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Saldo esperado
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {formatMoney(Number(jornadaCaja.saldoEsperado))}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-emerald-200/80 bg-emerald-50/90 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Todo listo para operar
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        Puedes continuar a Admisiones y registrar pacientes con
                        esta sesión.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[20px] border border-amber-200/80 bg-amber-50/90 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      No hay jornada de caja activa
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Debes abrir o reabrir esta caja antes de operar admisiones.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}