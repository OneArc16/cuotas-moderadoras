"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateModuloAtencionInput = {
  id: number;
  codigo: string;
  nombre: string;
  pisoId: number;
};

export async function updateModuloAtencion(
  input: UpdateModuloAtencionInput
) {
  const codigo = input.codigo.trim();
  const nombre = input.nombre.trim();

  if (!codigo) {
    throw new Error("El código es obligatorio");
  }

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.moduloAtencion.update({
    where: { id: input.id },
    data: {
      codigo,
      nombre,
      pisoId: input.pisoId,
    },
  });

  revalidatePath("/parametrizacion/modulos-atencion");
}