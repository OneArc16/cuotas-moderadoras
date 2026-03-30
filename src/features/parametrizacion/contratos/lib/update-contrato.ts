"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type UpdateContratoInput = {
  id: number;
  nombre: string;
  tipo: "EPS" | "PARTICULAR" | "OTRO";
};

export async function updateContrato(input: UpdateContratoInput) {
  await requirePermission(
    RBAC_PERMISSION.CONTRACT_MANAGE,
    "No tienes permiso para gestionar contratos.",
  );
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.contrato.update({
    where: { id: input.id },
    data: {
      nombre,
      tipo: input.tipo,
    },
  });

  revalidatePath("/parametrizacion/contratos");
}