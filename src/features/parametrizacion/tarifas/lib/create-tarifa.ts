"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeTarifaInput } from "@/features/parametrizacion/tarifas/lib/normalize-tarifa-input";

type CreateTarifaInput = {
  contratoId: number;
  servicioId?: number | null;
  categoriaAfiliacionId?: number | null;
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia?: string | null;
};

export async function createTarifa(input: CreateTarifaInput) {
  const data = await normalizeTarifaInput(input);

  await prisma.tarifaServicio.create({
    data,
  });

  revalidatePath("/parametrizacion/tarifas");
}