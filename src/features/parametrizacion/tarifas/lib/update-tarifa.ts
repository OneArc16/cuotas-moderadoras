"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateTarifaInput = {
  id: number;
  servicioId: number;
  contratoId: number;
  categoriaAfiliacionId?: number;
  tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia?: string;
};

export async function updateTarifa(input: UpdateTarifaInput) {
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

  if (input.categoriaAfiliacionId) {
    const relacionActiva = await prisma.contratoCategoriaAfiliacion.findFirst({
      where: {
        contratoId: input.contratoId,
        categoriaAfiliacionId: input.categoriaAfiliacionId,
        estado: "ACTIVO",
      },
      select: { id: true },
    });

    if (!relacionActiva) {
      throw new Error(
        "La categoría seleccionada no está habilitada para ese contrato"
      );
    }
  }

  await prisma.tarifaServicio.update({
    where: { id: input.id },
    data: {
      servicioId: input.servicioId,
      contratoId: input.contratoId,
      categoriaAfiliacionId: input.categoriaAfiliacionId || null,
      tipoCobro: input.tipoCobro,
      valor: valorNumero,
      fechaInicioVigencia,
      fechaFinVigencia,
    },
  });

  revalidatePath("/parametrizacion/tarifas");
}