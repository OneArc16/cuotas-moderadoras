"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleCajaStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.BOX_MANAGE,
    "No tienes permiso para gestionar cajas operativas.",
  );
  const caja = await prisma.caja.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!caja) {
    throw new Error("La caja no existe");
  }

  await prisma.caja.update({
    where: { id },
    data: {
      estado: caja.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/cajas");
}