"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleContratoCategoriaAfiliacionStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.CONTRACT_MANAGE,
    "No tienes permiso para gestionar categorias por contrato.",
  );
  const relacion = await prisma.contratoCategoriaAfiliacion.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!relacion) {
    throw new Error("La relación contrato-categoría no existe");
  }

  await prisma.contratoCategoriaAfiliacion.update({
    where: { id: relacion.id },
    data: {
      estado: relacion.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/contratos");
}