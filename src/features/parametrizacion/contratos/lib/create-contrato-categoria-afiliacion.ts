"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateContratoCategoriaAfiliacionInput = {
  contratoId: number;
  categoriaAfiliacionId: number;
};

export async function createContratoCategoriaAfiliacion(
  input: CreateContratoCategoriaAfiliacionInput
) {
  const contrato = await prisma.contrato.findUnique({
    where: { id: input.contratoId },
    select: { id: true },
  });

  if (!contrato) {
    throw new Error("El contrato no existe");
  }

  const categoria = await prisma.categoriaAfiliacion.findUnique({
    where: { id: input.categoriaAfiliacionId },
    select: { id: true },
  });

  if (!categoria) {
    throw new Error("La categoría de afiliación no existe");
  }

  const relacionExistente =
    await prisma.contratoCategoriaAfiliacion.findUnique({
      where: {
        contratoId_categoriaAfiliacionId: {
          contratoId: input.contratoId,
          categoriaAfiliacionId: input.categoriaAfiliacionId,
        },
      },
    });

  if (relacionExistente) {
    if (relacionExistente.estado === "ACTIVO") {
      throw new Error("Esa categoría ya está asignada a este contrato");
    }

    await prisma.contratoCategoriaAfiliacion.update({
      where: { id: relacionExistente.id },
      data: { estado: "ACTIVO" },
    });

    revalidatePath("/parametrizacion/contratos");
    return;
  }

  await prisma.contratoCategoriaAfiliacion.create({
    data: {
      contratoId: input.contratoId,
      categoriaAfiliacionId: input.categoriaAfiliacionId,
    },
  });

  revalidatePath("/parametrizacion/contratos");
}