import { getBogotaOperationalDayParts } from "@/lib/fecha-operativa-bogota";
import { prisma } from "@/lib/prisma";

const METODOS_PAGO = [
  "EFECTIVO",
  "NEQUI",
  "DAVIPLATA",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
] as const;

type ReportesSearchParams = {
  desde?: string;
  hasta?: string;
  cajaId?: string;
};

type MoneyAggregate = {
  _sum: {
    valor: unknown;
  };
};

function buildDateRange(desde?: string, hasta?: string) {
  const fechaOperativa: {
    gte?: Date;
    lt?: Date;
  } = {};

  if (desde) {
    fechaOperativa.gte = new Date(`${desde}T00:00:00.000`);
  }

  if (hasta) {
    const nextDay = new Date(`${hasta}T00:00:00.000`);
    nextDay.setDate(nextDay.getDate() + 1);
    fechaOperativa.lt = nextDay;
  }

  return Object.keys(fechaOperativa).length > 0 ? fechaOperativa : undefined;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toMoneyString(value: number) {
  return value.toFixed(2);
}

function getSumValue(result: MoneyAggregate) {
  return toNumber(result._sum.valor);
}

export type ReportesPageData = {
  filters: {
    desde: string;
    hasta: string;
    cajaId: string;
    hasExplicitDateFilter: boolean;
    filtersActive: boolean;
  };
  cajas: Array<{
    id: number;
    nombre: string;
  }>;
  stats: {
    admisionesTotales: number;
    admisionesRegistradas: number;
    admisionesAnuladas: number;
    movimientos: number;
    cajasConMovimiento: number;
    recaudoBruto: string;
    recaudoSalidas: string;
    recaudoNeto: string;
    recaudoEfectivo: string;
    recaudoElectronico: string;
    devoluciones: string;
    reversosAnulacion: string;
    promedioAdmision: string;
    jornadasIncluidas: number;
  };
  metodoSummaries: Array<{
    metodoPago: string;
    cantidad: number;
    total: string;
  }>;
  cajaSummaries: Array<{
    cajaId: number;
    cajaNombre: string;
    jornadas: number;
    admisiones: number;
    anuladas: number;
    entradas: string;
    salidas: string;
    neto: string;
  }>;
  contratoSummaries: Array<{
    contratoId: number;
    contratoNombre: string;
    tipo: string;
    admisiones: number;
    anuladas: number;
    recaudado: string;
    anulado: string;
    neto: string;
  }>;
  servicioSummaries: Array<{
    servicioId: number;
    servicioNombre: string;
    codigo: string | null;
    admisiones: number;
    recaudado: string;
  }>;
};

export async function getReportesPageData(
  searchParams?: ReportesSearchParams,
): Promise<ReportesPageData> {
  const rawDesde = searchParams?.desde?.trim() ?? "";
  const rawHasta = searchParams?.hasta?.trim() ?? "";
  const rawCajaId = searchParams?.cajaId?.trim() ?? "";
  const hasExplicitDateFilter = Boolean(rawDesde || rawHasta);
  const { year, month, day } = getBogotaOperationalDayParts();
  const today = `${year}-${month}-${day}`;
  const desde = hasExplicitDateFilter ? rawDesde : today;
  const hasta = hasExplicitDateFilter ? rawHasta : today;
  const cajaId = /^\d+$/.test(rawCajaId) ? Number(rawCajaId) : null;
  const fechaOperativa = buildDateRange(desde, hasta);

  const [cajas, jornadas] = await Promise.all([
    prisma.caja.findMany({
      orderBy: {
        nombre: "asc",
      },
      select: {
        id: true,
        nombre: true,
      },
    }),
    prisma.jornadaCaja.findMany({
      where: {
        ...(fechaOperativa ? { fechaOperativa } : {}),
        ...(cajaId ? { cajaId } : {}),
      },
      select: {
        id: true,
        cajaId: true,
        caja: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [
        {
          fechaOperativa: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    }),
  ]);

  const jornadaIds = jornadas.map((jornada) => jornada.id);
  const uniqueCajaIds = Array.from(new Set(jornadas.map((jornada) => jornada.cajaId)));
  const filtersActive = Boolean(rawDesde || rawHasta || rawCajaId);

  if (jornadaIds.length === 0) {
    return {
      filters: {
        desde,
        hasta,
        cajaId: cajaId ? String(cajaId) : "",
        hasExplicitDateFilter,
        filtersActive,
      },
      cajas,
      stats: {
        admisionesTotales: 0,
        admisionesRegistradas: 0,
        admisionesAnuladas: 0,
        movimientos: 0,
        cajasConMovimiento: 0,
        recaudoBruto: toMoneyString(0),
        recaudoSalidas: toMoneyString(0),
        recaudoNeto: toMoneyString(0),
        recaudoEfectivo: toMoneyString(0),
        recaudoElectronico: toMoneyString(0),
        devoluciones: toMoneyString(0),
        reversosAnulacion: toMoneyString(0),
        promedioAdmision: toMoneyString(0),
        jornadasIncluidas: 0,
      },
      metodoSummaries: METODOS_PAGO.map((metodoPago) => ({
        metodoPago,
        cantidad: 0,
        total: toMoneyString(0),
      })),
      cajaSummaries: [],
      contratoSummaries: [],
      servicioSummaries: [],
    };
  }

  const movimientoWhere = {
    jornadaCajaId: {
      in: jornadaIds,
    },
  } as const;

  const admisionWhere = {
    jornadaCajaId: {
      in: jornadaIds,
    },
  } as const;

  const registeredAdmissionsWhere = {
    ...admisionWhere,
    estado: "REGISTRADA" as const,
  };

  const annulledAdmissionsWhere = {
    ...admisionWhere,
    estado: "ANULADA" as const,
  };

  const [
    totalAdmisiones,
    admisionesRegistradas,
    admisionesAnuladas,
    promedioAdmision,
    totalMovimientos,
    totalEntradasAgg,
    totalSalidasAgg,
    totalEfectivoAgg,
    totalElectronicoAgg,
    totalDevolucionesAgg,
    totalReversosAgg,
    metodoGroups,
    entradasPorCaja,
    salidasPorCaja,
    admisionesPorCaja,
    anuladasPorCaja,
    contratosRegistrados,
    contratosAnulados,
    serviciosRegistrados,
  ] = await Promise.all([
    prisma.admision.count({ where: admisionWhere }),
    prisma.admision.count({ where: registeredAdmissionsWhere }),
    prisma.admision.count({ where: annulledAdmissionsWhere }),
    prisma.admision.aggregate({
      where: registeredAdmissionsWhere,
      _avg: {
        valorFinalCobrado: true,
      },
    }),
    prisma.movimiento.count({ where: movimientoWhere }),
    prisma.movimiento.aggregate({
      where: {
        ...movimientoWhere,
        naturaleza: "ENTRADA",
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.aggregate({
      where: {
        ...movimientoWhere,
        naturaleza: "SALIDA",
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.aggregate({
      where: {
        ...movimientoWhere,
        naturaleza: "ENTRADA",
        metodoPago: "EFECTIVO",
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.aggregate({
      where: {
        ...movimientoWhere,
        naturaleza: "ENTRADA",
        metodoPago: {
          not: "EFECTIVO",
        },
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.aggregate({
      where: {
        ...movimientoWhere,
        tipoMovimiento: "DEVOLUCION",
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.aggregate({
      where: {
        ...movimientoWhere,
        tipoMovimiento: "REVERSO_ANULACION",
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.groupBy({
      by: ["metodoPago"],
      where: {
        ...movimientoWhere,
        naturaleza: "ENTRADA",
      },
      _count: {
        _all: true,
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.groupBy({
      by: ["cajaId"],
      where: {
        ...movimientoWhere,
        naturaleza: "ENTRADA",
      },
      _count: {
        _all: true,
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.movimiento.groupBy({
      by: ["cajaId"],
      where: {
        ...movimientoWhere,
        naturaleza: "SALIDA",
      },
      _count: {
        _all: true,
      },
      _sum: {
        valor: true,
      },
    }),
    prisma.admision.groupBy({
      by: ["cajaId"],
      where: registeredAdmissionsWhere,
      _count: {
        _all: true,
      },
    }),
    prisma.admision.groupBy({
      by: ["cajaId"],
      where: annulledAdmissionsWhere,
      _count: {
        _all: true,
      },
    }),
    prisma.admision.groupBy({
      by: ["contratoId"],
      where: registeredAdmissionsWhere,
      _count: {
        _all: true,
      },
      _sum: {
        valorFinalCobrado: true,
      },
    }),
    prisma.admision.groupBy({
      by: ["contratoId"],
      where: annulledAdmissionsWhere,
      _count: {
        _all: true,
      },
      _sum: {
        valorFinalCobrado: true,
      },
    }),
    prisma.admision.groupBy({
      by: ["servicioId"],
      where: registeredAdmissionsWhere,
      _count: {
        _all: true,
      },
      _sum: {
        valorFinalCobrado: true,
      },
    }),
  ]);

  const contratoIds = Array.from(
    new Set([
      ...contratosRegistrados.map((item) => item.contratoId),
      ...contratosAnulados.map((item) => item.contratoId),
    ]),
  );

  const servicioIds = Array.from(
    new Set(serviciosRegistrados.map((item) => item.servicioId)),
  );

  const [contratos, servicios] = await Promise.all([
    contratoIds.length > 0
      ? prisma.contrato.findMany({
          where: {
            id: {
              in: contratoIds,
            },
          },
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        })
      : Promise.resolve([]),
    servicioIds.length > 0
      ? prisma.servicio.findMany({
          where: {
            id: {
              in: servicioIds,
            },
          },
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const totalEntradas = getSumValue(totalEntradasAgg);
  const totalSalidas = getSumValue(totalSalidasAgg);
  const totalEfectivo = getSumValue(totalEfectivoAgg);
  const totalElectronico = getSumValue(totalElectronicoAgg);
  const totalDevoluciones = getSumValue(totalDevolucionesAgg);
  const totalReversos = getSumValue(totalReversosAgg);
  const neto = totalEntradas - totalSalidas;

  const metodoSummaryMap = new Map(
    metodoGroups.map((item) => [
      item.metodoPago,
      {
        cantidad: item._count._all,
        total: toNumber(item._sum.valor),
      },
    ]),
  );

  const jornadasPorCajaMap = new Map<number, number>();

  for (const jornada of jornadas) {
    jornadasPorCajaMap.set(
      jornada.cajaId,
      (jornadasPorCajaMap.get(jornada.cajaId) ?? 0) + 1,
    );
  }

  const entradasPorCajaMap = new Map(
    entradasPorCaja.map((item) => [item.cajaId, toNumber(item._sum.valor)]),
  );
  const salidasPorCajaMap = new Map(
    salidasPorCaja.map((item) => [item.cajaId, toNumber(item._sum.valor)]),
  );
  const admisionesPorCajaMap = new Map(
    admisionesPorCaja.map((item) => [item.cajaId, item._count._all]),
  );
  const anuladasPorCajaMap = new Map(
    anuladasPorCaja.map((item) => [item.cajaId, item._count._all]),
  );
  const cajaNombreMap = new Map(cajas.map((caja) => [caja.id, caja.nombre]));
  const contratoMap = new Map(contratos.map((contrato) => [contrato.id, contrato]));
  const servicioMap = new Map(servicios.map((servicio) => [servicio.id, servicio]));

  const contratoRegistradoMap = new Map(
    contratosRegistrados.map((item) => [
      item.contratoId,
      {
        admisiones: item._count._all,
        recaudado: toNumber(item._sum.valorFinalCobrado),
      },
    ]),
  );
  const contratoAnuladoMap = new Map(
    contratosAnulados.map((item) => [
      item.contratoId,
      {
        anuladas: item._count._all,
        anulado: toNumber(item._sum.valorFinalCobrado),
      },
    ]),
  );

  const metodoSummaries = METODOS_PAGO.map((metodoPago) => {
    const summary = metodoSummaryMap.get(metodoPago);

    return {
      metodoPago,
      cantidad: summary?.cantidad ?? 0,
      total: toMoneyString(summary?.total ?? 0),
    };
  });

  const cajaSummaries = uniqueCajaIds
    .map((currentCajaId) => {
      const entradas = entradasPorCajaMap.get(currentCajaId) ?? 0;
      const salidas = salidasPorCajaMap.get(currentCajaId) ?? 0;

      return {
        cajaId: currentCajaId,
        cajaNombre: cajaNombreMap.get(currentCajaId) ?? `Caja ${currentCajaId}`,
        jornadas: jornadasPorCajaMap.get(currentCajaId) ?? 0,
        admisiones: admisionesPorCajaMap.get(currentCajaId) ?? 0,
        anuladas: anuladasPorCajaMap.get(currentCajaId) ?? 0,
        entradas: toMoneyString(entradas),
        salidas: toMoneyString(salidas),
        neto: toMoneyString(entradas - salidas),
      };
    })
    .sort((a, b) => Number(b.neto) - Number(a.neto));

  const contratoSummaries = contratoIds
    .map((contratoId) => {
      const contrato = contratoMap.get(contratoId);
      const registrado = contratoRegistradoMap.get(contratoId);
      const anulado = contratoAnuladoMap.get(contratoId);
      const recaudado = registrado?.recaudado ?? 0;
      const valorAnulado = anulado?.anulado ?? 0;

      return {
        contratoId,
        contratoNombre: contrato?.nombre ?? `Contrato ${contratoId}`,
        tipo: contrato?.tipo ?? "SIN_TIPO",
        admisiones: registrado?.admisiones ?? 0,
        anuladas: anulado?.anuladas ?? 0,
        recaudado: toMoneyString(recaudado),
        anulado: toMoneyString(valorAnulado),
        neto: toMoneyString(recaudado - valorAnulado),
      };
    })
    .sort((a, b) => Number(b.neto) - Number(a.neto))
    .slice(0, 8);

  const servicioSummaries = serviciosRegistrados
    .map((item) => {
      const servicio = servicioMap.get(item.servicioId);

      return {
        servicioId: item.servicioId,
        servicioNombre: servicio?.nombre ?? `Servicio ${item.servicioId}`,
        codigo: servicio?.codigo ?? null,
        admisiones: item._count._all,
        recaudado: toMoneyString(toNumber(item._sum.valorFinalCobrado)),
      };
    })
    .sort((a, b) => Number(b.recaudado) - Number(a.recaudado))
    .slice(0, 8);

  return {
    filters: {
      desde,
      hasta,
      cajaId: cajaId ? String(cajaId) : "",
      hasExplicitDateFilter,
      filtersActive,
    },
    cajas,
    stats: {
      admisionesTotales: totalAdmisiones,
      admisionesRegistradas,
      admisionesAnuladas,
      movimientos: totalMovimientos,
      cajasConMovimiento: uniqueCajaIds.length,
      recaudoBruto: toMoneyString(totalEntradas),
      recaudoSalidas: toMoneyString(totalSalidas),
      recaudoNeto: toMoneyString(neto),
      recaudoEfectivo: toMoneyString(totalEfectivo),
      recaudoElectronico: toMoneyString(totalElectronico),
      devoluciones: toMoneyString(totalDevoluciones),
      reversosAnulacion: toMoneyString(totalReversos),
      promedioAdmision: toMoneyString(toNumber(promedioAdmision._avg.valorFinalCobrado)),
      jornadasIncluidas: jornadas.length,
    },
    metodoSummaries,
    cajaSummaries,
    contratoSummaries,
    servicioSummaries,
  };
}