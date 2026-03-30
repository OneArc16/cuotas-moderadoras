"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateCategoriaAfiliacionInput = {
  codigo: string;
  nombre: string;
};

export async function createCategoriaAfiliacion(
  input: CreateCategoriaAfiliacionInput
) {
  await requirePermission(
    RBAC_PERMISSION.CATEGORY_MANAGE,
    "No tienes permiso para gestionar categorias de afiliacion.",
  );
  const codigo = input.codigo.trim();
  const nombre = input.nombre.trim();

  if (!codigo) {
    throw new Error("El código es obligatorio");
  }

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.categoriaAfiliacion.create({
    data: {
      codigo,
      nombre,
    },
  });

  revalidatePath("/parametrizacion/categorias-afiliacion");
}
