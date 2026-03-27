"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeTarifaInput } from "@/features/parametrizacion/tarifas/lib/normalize-tarifa-input";

type UpdateTarifaInput = {
  id: number;
  contratoId: number;
  servicioId?: number | null;
  categoriaAfiliacionId?: number | null;
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia?: string | null;
};

export async function updateTarifa(input: UpdateTarifaInput) {
  const { id, ...rawData } = input;
  const data = await normalizeTarifaInput(rawData);

  await prisma.tarifaServicio.update({
    where: { id },
    data,
  });

  revalidatePath("/parametrizacion/tarifas");
}