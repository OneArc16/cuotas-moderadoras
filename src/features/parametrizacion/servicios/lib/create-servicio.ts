"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateServicioInput = {
  codigo?: string;
  nombre: string;
};

export async function createServicio(input: CreateServicioInput) {
  await requirePermission(
    RBAC_PERMISSION.SERVICE_MANAGE,
    "No tienes permiso para gestionar servicios.",
  );
  const codigo = input.codigo?.trim() || null;
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.servicio.create({
    data: {
      codigo,
      nombre,
    },
  });

  revalidatePath("/parametrizacion/servicios");
}
