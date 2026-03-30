"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleContratoStatus(id: number) {
  await requirePermission(
    RBAC_PERMISSION.CONTRACT_MANAGE,
    "No tienes permiso para gestionar contratos.",
  );
  const contrato = await prisma.contrato.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!contrato) {
    throw new Error("El contrato no existe");
  }

  await prisma.contrato.update({
    where: { id },
    data: {
      estado: contrato.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/contratos");
}