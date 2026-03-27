"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateCajaInput = {
  id: number;
  nombre: string;
};

export async function updateCaja(input: UpdateCajaInput) {
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.caja.update({
    where: { id: input.id },
    data: {
      nombre,
    },
  });

  revalidatePath("/parametrizacion/cajas");
}