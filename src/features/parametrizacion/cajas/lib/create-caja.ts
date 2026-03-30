"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

type CreateCajaInput = {
  nombre: string;
};

export async function createCaja(input: CreateCajaInput) {
  await requirePermission(
    RBAC_PERMISSION.BOX_MANAGE,
    "No tienes permiso para gestionar cajas operativas.",
  );
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.caja.create({
    data: {
      nombre,
    },
  });

  revalidatePath("/parametrizacion/cajas");
}