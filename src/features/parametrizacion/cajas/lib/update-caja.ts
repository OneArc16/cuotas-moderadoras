"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

type UpdateCajaInput = {
  id: number;
  nombre: string;
};

export async function updateCaja(input: UpdateCajaInput) {
  await requirePermission(
    RBAC_PERMISSION.BOX_MANAGE,
    "No tienes permiso para gestionar cajas operativas.",
  );
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.caja.update({
    where: { id: input.id },
    data: {
      nombre,
    },
  });

  revalidatePath("/parametrizacion/cajas");
}