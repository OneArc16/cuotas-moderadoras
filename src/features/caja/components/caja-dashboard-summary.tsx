import type { CajaOperativaItem } from "@/features/caja/lib/get-cajas-operativas";

type CajaDashboardSummaryProps = {
  items: CajaOperativaItem[];
};

function toNumber(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CajaDashboardSummary({ items }: CajaDashboardSummaryProps) {
  const totalCajas = items.length;

  const jornadasAbiertas = items.filter(
    (item) =>
      item.jornadaActual?.estado === "ABIERTA" ||
      item.jornadaActual?.estado === "REABIERTA",
  ).length;

  const jornadasCerradas = items.filter(
    (item) => item.jornadaActual?.estado === "CERRADA",
  ).length;

  const recaudoTotal = items.reduce((acc, item) => {
    return acc + toNumber(item.jornadaActual?.recaudo.totalEntradas);
  }, 0);

  const recaudoEfectivo = items.reduce((acc, item) => {
    return acc + toNumber(item.jornadaActual?.recaudo.totalEfectivo);
  }, 0);

  const recaudoElectronico = items.reduce((acc, item) => {
    return acc + toNumber(item.jornadaActual?.recaudo.totalElectronico);
  }, 0);

  const saldoEsperado = items.reduce((acc, item) => {
    return acc + toNumber(item.jornadaActual?.saldoEsperado);
  }, 0);

  return (
    <section className="rounded-3xl border bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Caja operativa</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Resumen de recaudo
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Vista general del estado de las cajas, el recaudo total del día y lo
          que realmente debe cuadrar en efectivo al cierre.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Recaudo total
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(recaudoTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Suma de todas las entradas registradas.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Recaudo en efectivo
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(recaudoEfectivo)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo que debe existir físicamente en caja.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Recaudo electrónico
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(recaudoElectronico)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nequi, Daviplata, tarjeta, transferencias y otros.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Saldo esperado
          </p>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(saldoEsperado)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Referencia para el cierre de efectivo.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Jornadas abiertas
          </p>
          <p className="mt-2 text-2xl font-semibold">{jornadasAbiertas}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ABIERTA o REABIERTA.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Cajas / jornadas cerradas
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {totalCajas} / {jornadasCerradas}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Total de cajas visibles y jornadas cerradas.
          </p>
        </div>
      </div>
    </section>
  );
}