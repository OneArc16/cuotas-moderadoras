import { prisma } from "@/lib/prisma";

type GetJornadaRecaudoSummaryInput = {
  jornadaCajaId: number;
};

export type JornadaRecaudoSummary = {
  totalEntradas: string;
  totalEfectivo: string;
  totalElectronico: string;
  totalSalidas: string;
  totalDevoluciones: string;
  netoRecaudado: string;
  cantidadMovimientos: number;
};

function toMoneyString(value: number) {
  return value.toFixed(2);
}

export async function getJornadaRecaudoSummary({
  jornadaCajaId,
}: GetJornadaRecaudoSummaryInput): Promise<JornadaRecaudoSummary> {
  const movimientos = await prisma.movimiento.findMany({
    where: {
      jornadaCajaId,
    },
    select: {
      naturaleza: true,
      tipoMovimiento: true,
      valor: true,
      metodoPago: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let totalEntradas = 0;
  let totalEfectivo = 0;
  let totalElectronico = 0;
  let totalSalidas = 0;
  let totalDevoluciones = 0;

  for (const movimiento of movimientos) {
    const valor = Number(movimiento.valor);

    if (Number.isNaN(valor)) continue;

    if (movimiento.naturaleza === "ENTRADA") {
      totalEntradas += valor;

      if (movimiento.metodoPago === "EFECTIVO") {
        totalEfectivo += valor;
      } else {
        totalElectronico += valor;
      }
    }

    if (movimiento.naturaleza === "SALIDA") {
      totalSalidas += valor;
    }

    if (movimiento.tipoMovimiento === "DEVOLUCION") {
      totalDevoluciones += valor;
    }
  }

  const netoRecaudado = totalEntradas - totalSalidas;

  return {
    totalEntradas: toMoneyString(totalEntradas),
    totalEfectivo: toMoneyString(totalEfectivo),
    totalElectronico: toMoneyString(totalElectronico),
    totalSalidas: toMoneyString(totalSalidas),
    totalDevoluciones: toMoneyString(totalDevoluciones),
    netoRecaudado: toMoneyString(netoRecaudado),
    cantidadMovimientos: movimientos.length,
  };
}