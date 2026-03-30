"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateModuloAtencionInput = {
  codigo: string;
  nombre: string;
  pisoId: number;
};

export async function createModuloAtencion(
  input: CreateModuloAtencionInput
) {
  await requirePermission(
    RBAC_PERMISSION.BOX_MANAGE,
    "No tienes permiso para gestionar estructuras fisicas legadas.",
  );
  const codigo = input.codigo.trim();
  const nombre = input.nombre.trim();

  if (!codigo) {
    throw new Error("El código es obligatorio");
  }

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.moduloAtencion.create({
    data: {
      codigo,
      nombre,
      pisoId: input.pisoId,
    },
  });

  revalidatePath("/parametrizacion/modulos-atencion");
}