"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateCategoriaAfiliacionInput = {
  id: number;
  codigo: string;
  nombre: string;
};

export async function updateCategoriaAfiliacion(
  input: UpdateCategoriaAfiliacionInput
) {
  const codigo = input.codigo.trim();
  const nombre = input.nombre.trim();

  if (!codigo) {
    throw new Error("El código es obligatorio");
  }

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.categoriaAfiliacion.update({
    where: { id: input.id },
    data: {
      codigo,
      nombre,
    },
  });

  revalidatePath("/parametrizacion/categorias-afiliacion");
}
