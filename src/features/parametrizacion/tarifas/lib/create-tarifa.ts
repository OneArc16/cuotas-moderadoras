"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateTarifaInput = {
  servicioId: number;
  contratoId: number;
  categoriaAfiliacionId?: number;
  tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia?: string;
};

export async function createTarifa(input: CreateTarifaInput) {
  const valorNumero = Number(input.valor);

  if (Number.isNaN(valorNumero) || valorNumero < 0) {
    throw new Error("Debes ingresar un valor válido");
  }

  if (!input.fechaInicioVigencia) {
    throw new Error("La fecha inicial es obligatoria");
  }

  await prisma.tarifaServicio.create({
    data: {
      servicioId: input.servicioId,
      contratoId: input.contratoId,
      categoriaAfiliacionId: input.categoriaAfiliacionId || null,
      tipoCobro: input.tipoCobro,
      valor: valorNumero,
      fechaInicioVigencia: new Date(input.fechaInicioVigencia),
      fechaFinVigencia: input.fechaFinVigencia
        ? new Date(input.fechaFinVigencia)
        : null,
    },
  });

  revalidatePath("/parametrizacion/tarifas");
}
