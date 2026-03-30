"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function togglePisoStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.BOX_MANAGE,
    "No tienes permiso para gestionar estructuras fisicas legadas.",
  );
  const piso = await prisma.piso.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!piso) {
    throw new Error("El piso no existe");
  }

  await prisma.piso.update({
    where: { id },
    data: {
      estado: piso.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/pisos");
}