"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleModuloAtencionStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.BOX_MANAGE,
    "No tienes permiso para gestionar estructuras fisicas legadas.",
  );
  const modulo = await prisma.moduloAtencion.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!modulo) {
    throw new Error("El módulo no existe");
  }

  await prisma.moduloAtencion.update({
    where: { id },
    data: {
      estado: modulo.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/modulos-atencion");
}