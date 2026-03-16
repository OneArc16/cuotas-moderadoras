type JornadaRecaudoKpisProps = {
  recaudo: {
    totalEntradas: string;
    totalEfectivo: string;
    totalElectronico: string;
    totalSalidas: string;
    totalDevoluciones: string;
    netoRecaudado: string;
    cantidadMovimientos: number;
  };
};

function formatMoney(value: string) {
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

export function JornadaRecaudoKpis({
  recaudo,
}: JornadaRecaudoKpisProps) {
  return (
    <section className="space-y-4 rounded-3xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Resumen de recaudo</p>
        <h3 className="text-lg font-semibold tracking-tight">
          Movimiento de la jornada
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Recaudo total
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(recaudo.totalEntradas)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Suma de todas las entradas.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Recaudo en efectivo
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(recaudo.totalEfectivo)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo que sí debe cuadrar en caja.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Recaudo electrónico
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(recaudo.totalElectronico)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nequi, tarjeta, transferencia y otros.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Salidas
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(recaudo.totalSalidas)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Todo movimiento con naturaleza salida.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Devoluciones
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(recaudo.totalDevoluciones)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Subconjunto de salidas por devolución.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Neto recaudado
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(recaudo.netoRecaudado)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Entradas menos salidas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">
          Cantidad de movimientos
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {recaudo.cantidadMovimientos} movimientos registrados en la jornada.
        </p>
      </div>
    </section>
  );
}