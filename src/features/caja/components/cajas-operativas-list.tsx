import { CloseJornadaCajaDialog } from "@/features/caja/components/close-jornada-caja-dialog";
import { JornadaRecaudoKpis } from "@/features/caja/components/jornada-recaudo-kpis";
import { OpenJornadaCajaDialog } from "@/features/caja/components/open-jornada-caja-dialog";
import { ReopenJornadaCajaDialog } from "@/features/caja/components/reopen-jornada-caja-dialog";
import type { CajaOperativaItem } from "@/features/caja/lib/get-cajas-operativas";

type CajasOperativasListProps = {
  items: CajaOperativaItem[];
  canReopen?: boolean;
};

function formatMoney(value: string | null) {
  if (!value) return "—";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value;
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("es-CO");
}

function getEstadoBadgeClasses(
  estado: "ABIERTA" | "REABIERTA" | "CERRADA" | "SIN_JORNADA",
) {
  switch (estado) {
    case "ABIERTA":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "REABIERTA":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "CERRADA":
      return "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function CajasOperativasList({
  items,
  canReopen = false,
}: CajasOperativasListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-3xl border bg-background p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">Caja operativa</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          No hay cajas disponibles
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Primero asegúrate de tener pisos y cajas activas en parametrización.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const jornada = item.jornadaActual;
        const estado = jornada?.estado ?? "SIN_JORNADA";
        const isOpenLike =
          jornada?.estado === "ABIERTA" || jornada?.estado === "REABIERTA";
        const canOpen = !jornada;
        const canClose = Boolean(jornada && isOpenLike);
        const canShowReopen = Boolean(jornada && jornada.estado === "CERRADA");

        return (
          <section
            key={item.caja.id}
            className="rounded-3xl border bg-background p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Piso · {item.piso.nombre}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getEstadoBadgeClasses(
                      estado,
                    )}`}
                  >
                    {estado === "SIN_JORNADA" ? "SIN JORNADA" : estado}
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {item.caja.nombre}
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Resumen operativo de la caja por piso, con recaudo total y
                  desglose por método de pago.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {canOpen ? (
                  <OpenJornadaCajaDialog
                    cajaId={item.caja.id}
                    cajaNombre={item.caja.nombre}
                    pisoNombre={item.piso.nombre}
                  />
                ) : null}

                {canClose && jornada ? (
                  <CloseJornadaCajaDialog
                    jornadaId={jornada.id}
                    cajaNombre={item.caja.nombre}
                    pisoNombre={item.piso.nombre}
                    saldoEsperado={jornada.saldoEsperado}
                  />
                ) : null}

                {canShowReopen && jornada && canReopen ? (
                  <ReopenJornadaCajaDialog
                    jornadaId={jornada.id}
                    cajaNombre={item.caja.nombre}
                    pisoNombre={item.piso.nombre}
                  />
                ) : null}
              </div>
            </div>

            {jornada ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Fecha operativa
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatDate(jornada.fechaOperativa)}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Base inicial
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(jornada.baseInicial)}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Saldo esperado
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(jornada.saldoEsperado)}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total cobros modelo
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(jornada.totalCobros)}
                    </p>
                  </div>
                </div>

                <JornadaRecaudoKpis recaudo={jornada.recaudo} />

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Devoluciones acumuladas
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(jornada.totalDevoluciones)}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Efectivo contado
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(jornada.efectivoContado)}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Diferencia de cierre
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(jornada.diferenciaCierre)}
                    </p>
                  </div>
                </div>

                {jornada.estado === "CERRADA" ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Jornada cerrada
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Si necesitas continuar operando esta caja, la acción
                      correcta es reabrir la jornada, no volver a abrir una
                      nueva.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">
                  Sin jornada operativa
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Esta caja aún no tiene jornada registrada. Puedes abrirla con
                  base inicial para empezar a operar.
                </p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}


