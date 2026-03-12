"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreatePisoInput = {
  nombre: string;
};

export async function createPiso(input: CreatePisoInput) {
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.piso.create({
    data: {
      nombre,
    },
  });

  revalidatePath("/parametrizacion/pisos");
}