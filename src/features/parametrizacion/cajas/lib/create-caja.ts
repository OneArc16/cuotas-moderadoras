"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateCajaInput = {
  nombre: string;
};

export async function createCaja(input: CreateCajaInput) {
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.caja.create({
    data: {
      nombre,
    },
  });

  revalidatePath("/parametrizacion/cajas");
}