import { prisma } from "@/lib/prisma";

type GetTarifaVigenteInput = {
  contratoId: number;
  servicioId: number;
  categoriaAfiliacionId?: number | null;
  at?: Date;
};

export type TarifaVigenteResult = {
  id: number;
  tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
  valor: string;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date | null;
  contrato: {
    id: number;
    nombre: string;
    tipo: string;
  };
  servicio: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
  categoriaAfiliacion: null | {
    id: number;
    codigo: string;
    nombre: string;
  };
};

export async function getTarifaVigente({
  contratoId,
  servicioId,
  categoriaAfiliacionId,
  at = new Date(),
}: GetTarifaVigenteInput): Promise<TarifaVigenteResult | null> {
  const commonWhere = {
    contratoId,
    servicioId,
    estado: "ACTIVO" as const,
    fechaInicioVigencia: {
      lte: at,
    },
    OR: [
      { fechaFinVigencia: null },
      {
        fechaFinVigencia: {
          gte: at,
        },
      },
    ],
  };

  const tarifa = categoriaAfiliacionId
    ? await prisma.tarifaServicio.findFirst({
        where: {
          ...commonWhere,
          categoriaAfiliacionId,
        },
        orderBy: [
          { fechaInicioVigencia: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          tipoCobro: true,
          valor: true,
          fechaInicioVigencia: true,
          fechaFinVigencia: true,
          contrato: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
            },
          },
          servicio: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          categoriaAfiliacion: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
        },
      })
    : await prisma.tarifaServicio.findFirst({
        where: {
          ...commonWhere,
          categoriaAfiliacionId: null,
        },
        orderBy: [
          { fechaInicioVigencia: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          tipoCobro: true,
          valor: true,
          fechaInicioVigencia: true,
          fechaFinVigencia: true,
          contrato: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
            },
          },
          servicio: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          categoriaAfiliacion: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
        },
      });

  if (!tarifa) {
    return null;
  }

  return {
    id: tarifa.id,
    tipoCobro: tarifa.tipoCobro,
    valor: tarifa.valor.toString(),
    fechaInicioVigencia: tarifa.fechaInicioVigencia,
    fechaFinVigencia: tarifa.fechaFinVigencia,
    contrato: tarifa.contrato,
    servicio: tarifa.servicio,
    categoriaAfiliacion: tarifa.categoriaAfiliacion,
  };
}