import Link from "next/link";

import { MovimientosFilters } from "@/features/movimientos/components/movimientos-filters";
import { prisma } from "@/lib/prisma";

const METODOS_PAGO = [
  "EFECTIVO",
  "NEQUI",
  "DAVIPLATA",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getNaturalezaClasses(naturaleza: string) {
  switch (naturaleza) {
    case "ENTRADA":
      return "bg-primary/10 text-primary ring-1 ring-primary/20";
    case "SALIDA":
      return "bg-secondary text-secondary-foreground ring-1 ring-border";
    default:
      return "bg-muted text-muted-foreground ring-1 ring-border";
  }
}

function buildDateRange(desde?: string, hasta?: string) {
  const createdAt: {
    gte?: Date;
    lt?: Date;
  } = {};

  if (desde) {
    createdAt.gte = new Date(`${desde}T00:00:00.000`);
  }

  if (hasta) {
    const nextDay = new Date(`${hasta}T00:00:00.000`);
    nextDay.setDate(nextDay.getDate() + 1);
    createdAt.lt = nextDay;
  }

  return Object.keys(createdAt).length > 0 ? createdAt : undefined;
}

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams?: Promise<{
    desde?: string;
    hasta?: string;
    metodo?: string;
    q?: string;
    cajaId?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const desde = resolvedSearchParams?.desde?.trim() ?? "";
  const hasta = resolvedSearchParams?.hasta?.trim() ?? "";
  const metodoParam = resolvedSearchParams?.metodo?.trim() ?? "";
  const q = resolvedSearchParams?.q?.trim() ?? "";
  const cajaIdParam = resolvedSearchParams?.cajaId?.trim() ?? "";

  const metodoPago = METODOS_PAGO.includes(
    metodoParam as (typeof METODOS_PAGO)[number],
  )
    ? metodoParam
    : "";

  const cajaId = /^\d+$/.test(cajaIdParam) ? Number(cajaIdParam) : null;
  const createdAt = buildDateRange(desde, hasta);

  const cajas = await prisma.caja.findMany({
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
    },
  });

  const where = {
    ...(createdAt ? { createdAt } : {}),
    ...(metodoPago ? { metodoPago } : {}),
    ...(cajaId ? { cajaId } : {}),
    ...(q
      ? {
          OR: [
            {
              referenciaPago: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              admision: {
                is: {
                  pacienteNombreSnapshot: {
                    contains: q,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              admision: {
                is: {
                  contratoNombreSnapshot: {
                    contains: q,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              admision: {
                is: {
                  servicioNombreSnapshot: {
                    contains: q,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [movimientos, totalMovimientos, entradasAgg, salidasAgg] =
    await Promise.all([
      prisma.movimiento.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        include: {
          caja: {
            select: {
              nombre: true,
            },
          },
          usuario: {
            select: {
              primerNombre: true,
              primerApellido: true,
            },
          },
          admision: {
            select: {
              id: true,
              pacienteNombreSnapshot: true,
              contratoNombreSnapshot: true,
              servicioNombreSnapshot: true,
            },
          },
        },
      }),
      prisma.movimiento.count({ where }),
      prisma.movimiento.aggregate({
        where: {
          ...where,
          naturaleza: "ENTRADA",
        },
        _sum: {
          valor: true,
        },
      }),
      prisma.movimiento.aggregate({
        where: {
          ...where,
          naturaleza: "SALIDA",
        },
        _sum: {
          valor: true,
        },
      }),
    ]);

  const totalEntradas = Number(entradasAgg._sum.valor ?? 0);
  const totalSalidas = Number(salidasAgg._sum.valor ?? 0);
  const recaudoNeto = totalEntradas - totalSalidas;

  const filtrosActivos = Boolean(desde || hasta || metodoPago || q || cajaId);

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Operación</p>
            <h1 className="text-2xl font-semibold tracking-tight">Movimientos</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Consulta los ingresos y salidas generados por la operación diaria de caja y admisiones.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admisiones"
              className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Ir a admisiones
            </Link>

            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground opacity-60"
            >
              Exportar próximamente
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total movimientos</p>
          <p className="mt-2 text-3xl font-semibold">{totalMovimientos}</p>
        </div>

        <div className="rounded-[24px] border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Entradas</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalEntradas)}</p>
        </div>

        <div className="rounded-[24px] border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Salidas</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalSalidas)}</p>
        </div>

        <div className="rounded-[24px] border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Recaudo neto</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(recaudoNeto)}</p>
        </div>
      </section>

      <section className="rounded-[28px] border bg-card p-6 shadow-sm">
        <div className="border-b pb-5">
          <div>
            <h2 className="text-lg font-semibold">Listado de movimientos</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Filtra por fechas, método, caja y búsqueda por referencia o paciente.
            </p>

            {filtrosActivos ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {desde ? (
                  <span className="rounded-full bg-muted px-3 py-1">
                    Desde: <span className="font-medium text-foreground">{desde}</span>
                  </span>
                ) : null}

                {hasta ? (
                  <span className="rounded-full bg-muted px-3 py-1">
                    Hasta: <span className="font-medium text-foreground">{hasta}</span>
                  </span>
                ) : null}

                {metodoPago ? (
                  <span className="rounded-full bg-muted px-3 py-1">
                    Método: <span className="font-medium text-foreground">{metodoPago}</span>
                  </span>
                ) : null}

                {cajaId ? (
                  <span className="rounded-full bg-muted px-3 py-1">
                    Caja: <span className="font-medium text-foreground">{cajas.find((caja) => caja.id === cajaId)?.nombre ?? cajaId}</span>
                  </span>
                ) : null}

                {q ? (
                  <span className="rounded-full bg-muted px-3 py-1">
                    Búsqueda: <span className="font-medium text-foreground">{q}</span>
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <MovimientosFilters
              desde={desde}
              hasta={hasta}
              metodo={metodoPago}
              q={q}
              cajaId={cajaId ? String(cajaId) : ""}
              cajas={cajas}
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border">
          <div className="grid grid-cols-12 bg-secondary/70 px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-secondary-foreground">
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2">Caja</div>
            <div className="col-span-3">Paciente</div>
            <div className="col-span-2">Método</div>
            <div className="col-span-1">Naturaleza</div>
            <div className="col-span-2 text-right">Valor</div>
          </div>

          {movimientos.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No encontramos movimientos con los filtros aplicados.
            </div>
          ) : (
            <div className="divide-y">
              {movimientos.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-5 text-sm"
                >
                  <div className="col-span-2 min-w-0">
                    <p className="font-medium">{formatDateTime(movimiento.createdAt)}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">#{movimiento.id}</p>
                  </div>

                  <div className="col-span-2 min-w-0">
                    <p className="truncate font-medium">{movimiento.caja.nombre}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {movimiento.admision.contratoNombreSnapshot}
                    </p>
                  </div>

                  <div className="col-span-3 min-w-0">
                    <p className="truncate font-medium">
                      {movimiento.admision.pacienteNombreSnapshot}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {movimiento.admision.servicioNombreSnapshot}
                    </p>
                  </div>

                  <div className="col-span-2 min-w-0">
                    <p className="truncate font-medium">{movimiento.metodoPago}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {movimiento.referenciaPago || "Sin referencia"}
                    </p>
                  </div>

                  <div className="col-span-1 min-w-0">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getNaturalezaClasses(
                        movimiento.naturaleza,
                      )}`}
                    >
                      {movimiento.naturaleza}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <p className="text-base font-semibold">
                      {formatCurrency(Number(movimiento.valor))}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {movimiento.usuario.primerNombre} {movimiento.usuario.primerApellido}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}