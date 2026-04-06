"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type MetodoSummary = {
  metodoPago: string;
  cantidad: number;
  total: string;
};

type CajaSummary = {
  cajaId: number;
  cajaNombre: string;
  jornadas: number;
  admisiones: number;
  anuladas: number;
  entradas: string;
  salidas: string;
  neto: string;
};

type ServicioSummary = {
  servicioId: number;
  servicioNombre: string;
  codigo: string | null;
  admisiones: number;
  recaudado: string;
};

type ReportesChartsProps = {
  metodoSummaries: MetodoSummary[];
  cajaSummaries: CajaSummary[];
  servicioSummaries: ServicioSummary[];
};

const metodoColorMap: Record<string, string> = {
  EFECTIVO: "var(--color-chart-1)",
  NEQUI: "var(--color-chart-2)",
  DAVIPLATA: "var(--color-chart-3)",
  TRANSFERENCIA: "var(--color-chart-4)",
  TARJETA: "var(--color-chart-5)",
  OTRO: "var(--color-muted-foreground)",
};

const metodoChartConfig = {
  EFECTIVO: { label: "Efectivo", color: "var(--color-chart-1)" },
  NEQUI: { label: "Nequi", color: "var(--color-chart-2)" },
  DAVIPLATA: { label: "Daviplata", color: "var(--color-chart-3)" },
  TRANSFERENCIA: { label: "Transferencia", color: "var(--color-chart-4)" },
  TARJETA: { label: "Tarjeta", color: "var(--color-chart-5)" },
  OTRO: { label: "Otro", color: "var(--color-muted-foreground)" },
} satisfies ChartConfig;

const cajaChartConfig = {
  entradas: { label: "Entradas", color: "var(--color-chart-2)" },
  salidas: { label: "Salidas", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

const servicioChartConfig = {
  recaudado: { label: "Recaudo", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

function toNumber(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMetodoPago(value: string) {
  return metodoChartConfig[value]?.label ?? value;
}

function truncateLabel(value: string, maxLength = 18) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-muted/15 p-5 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ReportesCharts({
  metodoSummaries,
  cajaSummaries,
  servicioSummaries,
}: ReportesChartsProps) {
  const metodoChartData = metodoSummaries
    .filter((item) => toNumber(item.total) > 0)
    .map((item) => ({
      metodoPago: item.metodoPago,
      total: toNumber(item.total),
      cantidad: item.cantidad,
      fill: metodoColorMap[item.metodoPago] ?? "var(--color-chart-5)",
    }));

  const cajaChartData = cajaSummaries.slice(0, 6).map((item) => ({
    cajaNombre: truncateLabel(item.cajaNombre, 14),
    nombreCompleto: item.cajaNombre,
    entradas: toNumber(item.entradas),
    salidas: toNumber(item.salidas),
    neto: toNumber(item.neto),
  }));

  const servicioChartData = servicioSummaries.slice(0, 6).map((item) => ({
    servicioNombre: truncateLabel(item.servicioNombre, 28),
    nombreCompleto: item.servicioNombre,
    recaudado: toNumber(item.recaudado),
    admisiones: item.admisiones,
  }));

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <div className="rounded-[28px] border border-border/80 bg-card/95 p-4 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-5">
        <div className="flex flex-col gap-2 border-b pb-4">
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Visualizacion
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
            Distribucion por metodo de pago
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Muestra como se reparte el recaudo entre efectivo y medios electronicos.
          </p>
        </div>

        {metodoChartData.length === 0 ? (
          <div className="mt-5">
            <EmptyChartState message="Todavia no hay recaudo de entrada para graficar en este corte." />
          </div>
        ) : (
          <div className="mt-5">
            <ChartContainer config={metodoChartConfig} className="mx-auto min-h-[260px] max-w-[360px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex min-w-[12rem] items-center justify-between gap-3">
                          <span className="text-muted-foreground">{formatMetodoPago(String(name))}</span>
                          <span className="font-mono font-medium text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={metodoChartData}
                  dataKey="total"
                  nameKey="metodoPago"
                  innerRadius={64}
                  outerRadius={92}
                  strokeWidth={3}
                >
                  {metodoChartData.map((item) => (
                    <Cell key={item.metodoPago} fill={item.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="metodoPago" className="flex-wrap" />}
                />
              </PieChart>
            </ChartContainer>
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-border/80 bg-card/95 p-4 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-5">
        <div className="flex flex-col gap-2 border-b pb-4">
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Visualizacion
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
            Comparativo por caja
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Compara entradas y salidas de las cajas con mayor movimiento dentro del corte filtrado.
          </p>
        </div>

        {cajaChartData.length === 0 ? (
          <div className="mt-5">
            <EmptyChartState message="No hay cajas con jornadas para graficar en este periodo." />
          </div>
        ) : (
          <div className="mt-5">
            <ChartContainer config={cajaChartConfig} className="min-h-[260px] w-full">
              <BarChart accessibilityLayer data={cajaChartData} margin={{ left: 8, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="cajaNombre"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCompactCurrency(Number(value))}
                  width={64}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value, name) => (
                        <div className="flex min-w-[12rem] items-center justify-between gap-3">
                          <span className="text-muted-foreground">
                            {name === "entradas" ? "Entradas" : "Salidas"}
                          </span>
                          <span className="font-mono font-medium text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="entradas" fill="var(--color-entradas)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="salidas" fill="var(--color-salidas)" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-border/80 bg-card/95 p-4 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] sm:p-5 xl:col-span-2">
        <div className="flex flex-col gap-2 border-b pb-4">
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Visualizacion
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.5rem]">
            Servicios con mayor recaudo
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Prioriza rapidamente los servicios que mas estan aportando al recaudo actual.
          </p>
        </div>

        {servicioChartData.length === 0 ? (
          <div className="mt-5">
            <EmptyChartState message="No hay servicios con recaudo suficiente para construir el grafico." />
          </div>
        ) : (
          <div className="mt-5">
            <ChartContainer config={servicioChartConfig} className="mx-auto min-h-[250px] w-full max-w-[980px]">
              <BarChart
                accessibilityLayer
                data={servicioChartData}
                layout="vertical"
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCompactCurrency(Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="servicioNombre"
                  tickLine={false}
                  axisLine={false}
                  width={136}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => (
                        <div className="flex min-w-[12rem] items-center justify-between gap-3">
                          <span className="text-muted-foreground">Recaudo</span>
                          <span className="font-mono font-medium text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="recaudado" fill="var(--color-recaudado)" radius={8} maxBarSize={28}>
                  {/* Keep labels simple to avoid crowding the left axis. */}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </section>
  );
}