"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleCategoriaAfiliacionStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.CATEGORY_MANAGE,
    "No tienes permiso para gestionar categorias de afiliacion.",
  );
  const categoria = await prisma.categoriaAfiliacion.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!categoria) {
    throw new Error("La categoría no existe");
  }

  await prisma.categoriaAfiliacion.update({
    where: { id },
    data: {
      estado: categoria.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/categorias-afiliacion");
}
