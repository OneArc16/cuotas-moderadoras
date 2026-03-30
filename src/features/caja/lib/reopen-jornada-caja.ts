"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { RBAC_PERMISSION, requirePermission } from "@/lib/rbac";

type ReopenJornadaCajaInput = {
  jornadaId: number;
  motivoReapertura: string;
};

export async function reopenJornadaCaja(input: ReopenJornadaCajaInput) {
  const motivoReapertura = input.motivoReapertura.trim();

  if (!motivoReapertura) {
    throw new Error("El motivo de reapertura es obligatorio");
  }

  const usuario = await requirePermission(
    RBAC_PERMISSION.CAJA_REOPEN,
    "Solo un usuario autorizado puede reabrir una caja",
  );

  const jornada = await prisma.jornadaCaja.findUnique({
    where: { id: input.jornadaId },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!jornada) {
    throw new Error("La jornada de caja no existe");
  }

  if (jornada.estado !== "CERRADA") {
    throw new Error("Solo se puede reabrir una jornada cerrada");
  }

  await prisma.jornadaCaja.update({
    where: { id: input.jornadaId },
    data: {
      estado: "REABIERTA",
      reabiertaPorUsuarioId: usuario.id,
      reabiertaAt: new Date(),
      motivoReapertura,
    },
  });

  revalidatePath("/caja");
}