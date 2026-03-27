import { prisma } from "@/lib/prisma";
import { getJornadaRecaudoSummary } from "@/features/caja/lib/get-jornada-recaudo-summary";
import { getBogotaOperationalDayRange } from "@/lib/fecha-operativa-bogota";

export type CajaOperativaItem = {
  caja: {
    id: number;
    nombre: string;
  };
  jornadaActual: null | {
    id: number;
    fechaOperativa: Date;
    estado: "ABIERTA" | "REABIERTA" | "CERRADA";
    baseInicial: string;
    totalCobros: string;
    totalDevoluciones: string;
    saldoEsperado: string;
    efectivoContado: string | null;
    diferenciaCierre: string | null;
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
};

export async function getCajasOperativas(): Promise<CajaOperativaItem[]> {
  const { start, end } = getBogotaOperationalDayRange();

  const cajas = await prisma.caja.findMany({
    where: {
      estado: "ACTIVO",
    },
    orderBy: [{ nombre: "asc" }],
    select: {
      id: true,
      nombre: true,
      jornadas: {
        where: {
          fechaOperativa: {
            gte: start,
            lte: end,
          },
        },
        orderBy: [{ fechaOperativa: "desc" }, { createdAt: "desc" }],
        take: 1,
        select: {
          id: true,
          fechaOperativa: true,
          estado: true,
          baseInicial: true,
          totalCobros: true,
          totalDevoluciones: true,
          saldoEsperado: true,
          efectivoContado: true,
          diferenciaCierre: true,
        },
      },
    },
  });

  const result = await Promise.all(
    cajas.map(async (caja) => {
      const jornada = caja.jornadas[0] ?? null;

      if (!jornada) {
        return {
          caja: {
            id: caja.id,
            nombre: caja.nombre,
          },
          jornadaActual: null,
        };
      }

      const recaudo = await getJornadaRecaudoSummary({
        jornadaCajaId: jornada.id,
      });

      return {
        caja: {
          id: caja.id,
          nombre: caja.nombre,
        },
        jornadaActual: {
          id: jornada.id,
          fechaOperativa: jornada.fechaOperativa,
          estado: jornada.estado,
          baseInicial: jornada.baseInicial.toString(),
          totalCobros: jornada.totalCobros.toString(),
          totalDevoluciones: jornada.totalDevoluciones.toString(),
          saldoEsperado: jornada.saldoEsperado.toString(),
          efectivoContado: jornada.efectivoContado
            ? jornada.efectivoContado.toString()
            : null,
          diferenciaCierre: jornada.diferenciaCierre
            ? jornada.diferenciaCierre.toString()
            : null,
          recaudo,
        },
      };
    }),
  );

  return result;
}