import { Download } from "lucide-react";
import { redirect } from "next/navigation";

import { AppPageHeader } from "@/components/shared/layout/app-page-header";
import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { ReportesCharts } from "@/features/reportes/components/reportes-charts";
import { ReportesFilters } from "@/features/reportes/components/reportes-filters";
import { getReportesPageData } from "@/features/reportes/lib/get-reportes-page-data";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

function formatCurrency(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatMetodoPago(value: string) {
  switch (value) {
    case "EFECTIVO":
      return "Efectivo";
    case "NEQUI":
      return "Nequi";
    case "DAVIPLATA":
      return "Daviplata";
    case "TRANSFERENCIA":
      return "Transferencia";
    case "TARJETA":
      return "Tarjeta";
    case "OTRO":
      return "Otro";
    default:
      return value;
  }
}

function buildExportHref(params: {
  desde: string;
  hasta: string;
  cajaId: string;
}) {
  const searchParams = new URLSearchParams({
    desde: params.desde,
    hasta: params.hasta,
  });

  if (params.cajaId) {
    searchParams.set("cajaId", params.cajaId);
  }

  return `/api/reportes/export?${searchParams.toString()}`;
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    desde?: string;
    hasta?: string;
    cajaId?: string;
  }>;
}) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.REPORT_VIEW)) {
    return (
      <main className="min-h-screen bg-transparent">
        <div className="flex flex-col gap-5">
          <AppPageHeader
            eyebrow="Operacion diaria - Reportes"
            title="Reportes operativos"
            description="Consulta el comportamiento diario de caja, admisiones y recaudo con filtros por fecha operativa y caja."
          />

          <AccessDeniedState
            title="No tienes acceso al modulo de reportes"
            description="Tu perfil actual no tiene permisos para consultar indicadores y reportes del sistema."
          />
        </div>
      </main>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = await getReportesPageData(resolvedSearchParams);
  const selectedCaja = data.filters.cajaId
    ? data.cajas.find((caja) => String(caja.id) === data.filters.cajaId)
    : null;
  const exportHref = buildExportHref({
    desde: data.filters.desde,
    hasta: data.filters.hasta,
    cajaId: data.filters.cajaId,
  });

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex flex-col gap-5">
        <AppPageHeader
          eyebrow="Operacion diaria - Reportes"
          title="Reportes operativos"
          description="Consulta el comportamiento diario de caja, admisiones y recaudo con filtros por fecha operativa y caja."
          statusChips={
            <>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-primary dark:bg-primary/15">
                Periodo: {data.filters.desde} a {data.filters.hasta}
              </span>
              <span className="rounded-full bg-muted px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.04em] text-muted-foreground">
                {selectedCaja ? `Caja: ${selectedCaja.nombre}` : "Todas las cajas"}
              </span>
            </>
          }
        />

        <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Filtros del reporte
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.65rem]">
                Corte por fecha operativa y caja
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Usa estos filtros para revisar el comportamiento del recaudo, las admisiones y las anulaciones sobre la operacion real.
              </p>
            </div>

            <a
              href={exportHref}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </a>
          </div>

          <div className="mt-5">
            <ReportesFilters
              desde={data.filters.desde}
              hasta={data.filters.hasta}
              cajaId={data.filters.cajaId}
              cajas={data.cajas}
            />
          </div>

          {data.filters.filtersActive ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1">
                Desde: <span className="font-medium text-foreground">{data.filters.desde}</span>
              </span>
              <span className="rounded-full bg-muted px-3 py-1">
                Hasta: <span className="font-medium text-foreground">{data.filters.hasta}</span>
              </span>
              {selectedCaja ? (
                <span className="rounded-full bg-muted px-3 py-1">
                  Caja: <span className="font-medium text-foreground">{selectedCaja.nombre}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Recaudo bruto</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(data.stats.recaudoBruto)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Total de entradas registradas.</p>
          </div>

          <div className="rounded-[24px] border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Salidas operativas</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(data.stats.recaudoSalidas)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Incluye devoluciones y reversos.</p>
          </div>

          <div className="rounded-[24px] border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Recaudo en efectivo</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(data.stats.recaudoEfectivo)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Base para control de cierre de caja.</p>
          </div>

          <div className="rounded-[24px] border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Recaudo electronico</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(data.stats.recaudoElectronico)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Nequi, Daviplata, transferencias y tarjetas.</p>
          </div>
        </section>

        <ReportesCharts
          metodoSummaries={data.metodoSummaries}
          cajaSummaries={data.cajaSummaries}
          servicioSummaries={data.servicioSummaries}
        />

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
            <div className="flex flex-col gap-2 border-b pb-5">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Recaudo por metodo
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
                Distribucion de ingresos
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Resume como se esta recibiendo el recaudo del periodo filtrado.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.metodoSummaries.map((item) => (
                <div
                  key={item.metodoPago}
                  className="rounded-[24px] border border-border/70 bg-background/85 p-4 shadow-[0_10px_24px_-20px_color-mix(in_oklab,var(--foreground)_30%,transparent)]"
                >
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {formatMetodoPago(item.metodoPago)}
                  </p>
                  <p className="mt-2 text-2xl font-semibold leading-none tracking-[-0.03em] text-foreground">
                    {formatCurrency(item.total)}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    {item.cantidad} movimiento{item.cantidad === 1 ? "" : "s"} de entrada.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
            <div className="flex flex-col gap-2 border-b pb-5">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Indicadores adicionales
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
                Control del periodo
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border bg-background/85 p-4">
                <p className="text-sm text-muted-foreground">Promedio por admision vigente</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(data.stats.promedioAdmision)}</p>
              </div>
              <div className="rounded-[24px] border bg-background/85 p-4">
                <p className="text-sm text-muted-foreground">Devoluciones</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(data.stats.devoluciones)}</p>
              </div>
              <div className="rounded-[24px] border bg-background/85 p-4">
                <p className="text-sm text-muted-foreground">Reversos por anulacion</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(data.stats.reversosAnulacion)}</p>
              </div>
              <div className="rounded-[24px] border bg-background/85 p-4">
                <p className="text-sm text-muted-foreground">Jornadas incluidas</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{data.stats.jornadasIncluidas}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
          <div className="flex flex-col gap-2 border-b pb-5">
            <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Resumen por caja
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
              Desempeno de cajas operativas
            </h2>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border">
            <div className="grid grid-cols-12 bg-secondary/70 px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-secondary-foreground">
              <div className="col-span-3">Caja</div>
              <div className="col-span-1 text-center">Jornadas</div>
              <div className="col-span-1 text-center">Adm.</div>
              <div className="col-span-1 text-center">Anul.</div>
              <div className="col-span-2 text-right">Entradas</div>
              <div className="col-span-2 text-right">Salidas</div>
              <div className="col-span-2 text-right">Neto</div>
            </div>

            {data.cajaSummaries.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No hay jornadas en el periodo seleccionado.
              </div>
            ) : (
              <div className="divide-y">
                {data.cajaSummaries.map((item) => (
                  <div key={item.cajaId} className="grid grid-cols-12 items-center gap-3 px-5 py-5 text-sm">
                    <div className="col-span-3 min-w-0">
                      <p className="truncate font-medium text-foreground">{item.cajaNombre}</p>
                    </div>
                    <div className="col-span-1 text-center font-medium">{item.jornadas}</div>
                    <div className="col-span-1 text-center font-medium">{item.admisiones}</div>
                    <div className="col-span-1 text-center font-medium">{item.anuladas}</div>
                    <div className="col-span-2 text-right font-medium">{formatCurrency(item.entradas)}</div>
                    <div className="col-span-2 text-right font-medium">{formatCurrency(item.salidas)}</div>
                    <div className="col-span-2 text-right font-semibold">{formatCurrency(item.neto)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
            <div className="flex flex-col gap-2 border-b pb-5">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Contratos
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
                Comportamiento por contrato
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {data.contratoSummaries.length === 0 ? (
                <div className="rounded-[24px] border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                  No hay admisiones para resumir por contrato en este corte.
                </div>
              ) : (
                data.contratoSummaries.map((item) => (
                  <div key={item.contratoId} className="rounded-[24px] border bg-background/85 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.contratoNombre}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{item.tipo}</p>
                      </div>
                      <p className="text-base font-semibold text-foreground">{formatCurrency(item.neto)}</p>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                      <p>Admisiones: <span className="font-medium text-foreground">{item.admisiones}</span></p>
                      <p>Anuladas: <span className="font-medium text-foreground">{item.anuladas}</span></p>
                      <p>Recaudado: <span className="font-medium text-foreground">{formatCurrency(item.recaudado)}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-6">
            <div className="flex flex-col gap-2 border-b pb-5">
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Servicios
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
                Servicios con mayor recaudo
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {data.servicioSummaries.length === 0 ? (
                <div className="rounded-[24px] border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                  No hay servicios con recaudo en el periodo seleccionado.
                </div>
              ) : (
                data.servicioSummaries.map((item) => (
                  <div key={item.servicioId} className="rounded-[24px] border bg-background/85 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.servicioNombre}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {item.codigo ?? "Sin codigo"}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-foreground">{formatCurrency(item.recaudado)}</p>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Admisiones registradas: <span className="font-medium text-foreground">{item.admisiones}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}