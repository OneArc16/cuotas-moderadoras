import { prisma } from "@/lib/prisma";

type NormalizeTarifaInput = {
  contratoId: number;
  servicioId?: number | null;
  categoriaAfiliacionId?: number | null;
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia?: string | null;
};

type NormalizedTarifaPayload = {
  contratoId: number;
  servicioId: number | null;
  categoriaAfiliacionId: number | null;
  tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
  valor: number;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date | null;
};

export async function normalizeTarifaInput(
  input: NormalizeTarifaInput,
): Promise<NormalizedTarifaPayload> {
  const valorNumero = Number(input.valor);

  if (Number.isNaN(valorNumero) || valorNumero < 0) {
    throw new Error("Debes ingresar un valor válido");
  }

  if (!input.fechaInicioVigencia) {
    throw new Error("La fecha inicial es obligatoria");
  }

  const fechaInicioVigencia = new Date(`${input.fechaInicioVigencia}T00:00:00`);

  if (Number.isNaN(fechaInicioVigencia.getTime())) {
    throw new Error("La fecha inicial no es válida");
  }

  const fechaFinVigencia = input.fechaFinVigencia
    ? new Date(`${input.fechaFinVigencia}T00:00:00`)
    : null;

  if (fechaFinVigencia && Number.isNaN(fechaFinVigencia.getTime())) {
    throw new Error("La fecha final no es válida");
  }

  if (fechaFinVigencia && fechaFinVigencia < fechaInicioVigencia) {
    throw new Error("La fecha final no puede ser menor que la fecha inicial");
  }

  const contrato = await prisma.contrato.findUnique({
    where: { id: input.contratoId },
    select: {
      id: true,
      tipo: true,
      estado: true,
    },
  });

  if (!contrato || contrato.estado !== "ACTIVO") {
    throw new Error("El contrato seleccionado no está disponible");
  }

  if (contrato.tipo === "PARTICULAR") {
    if (!input.servicioId) {
      throw new Error("Debes seleccionar un servicio para contratos particulares");
    }

    if (input.categoriaAfiliacionId) {
      throw new Error(
        "Los contratos particulares no usan categoría de afiliación en la tarifa",
      );
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: input.servicioId },
      select: {
        id: true,
        estado: true,
      },
    });

    if (!servicio || servicio.estado !== "ACTIVO") {
      throw new Error("El servicio seleccionado no está disponible");
    }

    return {
      contratoId: contrato.id,
      servicioId: servicio.id,
      categoriaAfiliacionId: null,
      tipoCobro: "PARTICULAR",
      valor: valorNumero,
      fechaInicioVigencia,
      fechaFinVigencia,
    };
  }

  if (!input.categoriaAfiliacionId) {
    throw new Error(
      "Debes seleccionar una categoría de afiliación para este contrato",
    );
  }

  const categoriaHabilitada = await prisma.contratoCategoriaAfiliacion.findFirst({
    where: {
      contratoId: contrato.id,
      categoriaAfiliacionId: input.categoriaAfiliacionId,
      estado: "ACTIVO",
    },
    select: { id: true },
  });

  if (!categoriaHabilitada) {
    throw new Error(
      "La categoría seleccionada no está habilitada para ese contrato",
    );
  }

  return {
    contratoId: contrato.id,
    servicioId: null,
    categoriaAfiliacionId: input.categoriaAfiliacionId,
    tipoCobro: "CUOTA_MODERADORA",
    valor: valorNumero,
    fechaInicioVigencia,
    fechaFinVigencia,
  };
}