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
  servicio: null | {
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

const tarifaSelect = {
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
} as const;

export async function getTarifaVigente({
  contratoId,
  servicioId,
  categoriaAfiliacionId,
  at = new Date(),
}: GetTarifaVigenteInput): Promise<TarifaVigenteResult | null> {
  const contrato = await prisma.contrato.findUnique({
    where: { id: contratoId },
    select: {
      id: true,
      tipo: true,
      estado: true,
    },
  });

  if (!contrato || contrato.estado !== "ACTIVO") {
    return null;
  }

  const commonWhere = {
    contratoId,
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

  const orderBy = [{ fechaInicioVigencia: "desc" as const }, { createdAt: "desc" as const }];

  let tarifa = null;

  if (contrato.tipo === "PARTICULAR") {
    tarifa = await prisma.tarifaServicio.findFirst({
      where: {
        ...commonWhere,
        tipoCobro: "PARTICULAR",
        servicioId,
      },
      orderBy,
      select: tarifaSelect,
    });
  } else if (categoriaAfiliacionId) {
    tarifa = await prisma.tarifaServicio.findFirst({
      where: {
        ...commonWhere,
        tipoCobro: "CUOTA_MODERADORA",
        categoriaAfiliacionId,
        servicioId: null,
      },
      orderBy,
      select: tarifaSelect,
    });


  }

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