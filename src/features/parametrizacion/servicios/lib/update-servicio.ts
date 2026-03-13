"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateServicioInput = {
  id: number;
  codigo?: string;
  nombre: string;
};

export async function updateServicio(input: UpdateServicioInput) {
  const codigo = input.codigo?.trim() || null;
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.servicio.update({
    where: { id: input.id },
    data: {
      codigo,
      nombre,
    },
  });

  revalidatePath("/parametrizacion/servicios");
}
