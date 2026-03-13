"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdatePisoInput = {
  id: number;
  nombre: string;
};

export async function updatePiso(input: UpdatePisoInput) {
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.piso.update({
    where: { id: input.id },
    data: { nombre },
  });

  revalidatePath("/parametrizacion/pisos");
}