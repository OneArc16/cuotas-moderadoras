"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleTarifaStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.TARIFF_MANAGE,
    "No tienes permiso para gestionar tarifas.",
  );
  const tarifa = await prisma.tarifaServicio.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!tarifa) {
    throw new Error("La tarifa no existe");
  }

  await prisma.tarifaServicio.update({
    where: { id },
    data: {
      estado: tarifa.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/tarifas");
}
