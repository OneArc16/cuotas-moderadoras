import { redirect } from "next/navigation";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { CloseSesionOperativaButton } from "@/features/sesion-operativa/components/close-sesion-operativa-button";
import { ModuloSelector } from "@/features/sesion-operativa/components/modulo-selector";
import { getModulosDisponibles } from "@/features/sesion-operativa/lib/get-modulos-disponibles";
import { getSesionOperativaActual } from "@/features/sesion-operativa/lib/get-sesion-operativa-actual";
import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function buildFullName(usuario: {
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  const [modulosDisponibles, sesionOperativa, metrics] = await Promise.all([
    getModulosDisponibles(),
    getSesionOperativaActual(),
    prisma.$transaction([
      prisma.moduloAtencion.count({
        where: {
          estado: "ACTIVO",
        },
      }),
      prisma.caja.count({
        where: {
          estado: "ACTIVO",
        },
      }),
      prisma.piso.count({
        where: {
          estado: "ACTIVO",
        },
      }),
    ]),
  ]);

  const [modulosCount, cajasCount, pisosCount] = metrics;

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
      <div className="flex flex-col gap-6">
        <AppPageHeader
          eyebrow="Inicio operativo · Dashboard"
          title="Selección de módulo y control de sesión"
          description="Desde aquí eliges el módulo físico de trabajo, validas la caja del piso y controlas la sesión operativa del día antes de entrar a admisiones."
          statusChips={
            <>
              {sesionOperativa ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Sesión operativa activa
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Sesión pendiente
                </span>
              )}
              {jornadaCaja ? (
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Caja {jornadaCaja.estado.toLowerCase()}
                </span>
              ) : null}
            </>
          }
          aside={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Usuario
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {buildFullName(usuario)}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{usuario.username}
                </p>
              </div>

              <div className="rounded-2xl border bg-background px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Contexto actual
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {sesionOperativa?.moduloAtencion.nombre || "Sin módulo activo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sesionOperativa
                    ? `${sesionOperativa.piso.nombre} · Caja ${sesionOperativa.caja.nombre}`
                    : "Selecciona módulo para iniciar"}
                </p>
              </div>
            </div>
          }
          stats={[
            {
              label: "Módulos disponibles",
              value: String(modulosCount),
              helper: "Listos para selección",
            },
            {
              label: "Cajas activas",
              value: String(cajasCount),
              helper: "Cajas configuradas y activas",
            },
            {
              label: "Pisos activos",
              value: String(pisosCount),
              helper: "Estructura física disponible",
            },
            {
              label: "Estado de caja",
              value: jornadaCaja?.estado || "Sin jornada",
              helper: jornadaCaja
                ? `Saldo esperado ${formatMoney(Number(jornadaCaja.saldoEsperado))}`
                : "Debe abrirse o reabrirse para operar",
            },
          ]}
        />

        {!sesionOperativa ? (
          <section className="rounded-[32px] border bg-background p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Inicio de operación
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Selecciona tu módulo físico
              </h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                El sistema usará el módulo para resolver el piso y la caja de
                trabajo. Solo podrás continuar si existe una jornada de caja
                abierta o reabierta para ese piso.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border bg-muted/20 p-5">
                <ModuloSelector modulos={modulosDisponibles} />
              </div>

              <div className="rounded-3xl border bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">
                  Reglas operativas
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-sm font-medium">1. Selección de módulo</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      El módulo define el piso donde vas a operar.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-sm font-medium">2. Resolución de caja</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      El piso determina automáticamente la caja que usarás.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-sm font-medium">3. Validación de jornada</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Debe existir una jornada ABIERTA o REABIERTA para poder
                      iniciar sesión operativa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[32px] border bg-background p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Sesión operativa actual
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Ya tienes una sesión activa
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  Desde aquí puedes validar el contexto actual de trabajo y cerrar
                  la sesión operativa cuando termines.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <CloseSesionOperativaButton sesionId={sesionOperativa.id} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border bg-muted/20 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-background p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Módulo actual
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {sesionOperativa.moduloAtencion.nombre}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Código {sesionOperativa.moduloAtencion.codigo}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Piso
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {sesionOperativa.piso.nombre}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Caja
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {sesionOperativa.caja.nombre}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Fecha operativa
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {new Date(
                        sesionOperativa.fechaOperativa,
                      ).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">
                  Estado de caja del piso
                </p>

                {jornadaCaja ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Jornada
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {jornadaCaja.estado}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(jornadaCaja.fechaOperativa).toLocaleDateString(
                          "es-CO",
                        )}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Base inicial
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {formatMoney(Number(jornadaCaja.baseInicial))}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Saldo esperado
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {formatMoney(Number(jornadaCaja.saldoEsperado))}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Todo listo para operar
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Puedes continuar a Admisiones y registrar pacientes con
                        esta sesión.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      No hay jornada de caja activa
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Debes abrir o reabrir la caja del piso antes de operar
                      admisiones.
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