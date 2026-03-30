"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

type CloseJornadaCajaInput = {
  jornadaId: number;
  efectivoContado: string;
  observacionCierre?: string;
};

export async function closeJornadaCaja(input: CloseJornadaCajaInput) {
  const efectivoContado = Number(input.efectivoContado);

  if (Number.isNaN(efectivoContado) || efectivoContado < 0) {
    throw new Error("El efectivo contado debe ser un valor valido");
  }

  const usuario = await requirePermission(
    RBAC_PERMISSION.CAJA_CLOSE,
    "No tienes permiso para cerrar jornadas de caja.",
  );

  const jornada = await prisma.jornadaCaja.findUnique({
    where: { id: input.jornadaId },
    select: {
      id: true,
      estado: true,
      baseInicial: true,
      totalCobros: true,
      totalDevoluciones: true,
    },
  });

  if (!jornada) {
    throw new Error("La jornada de caja no existe");
  }

  if (jornada.estado !== "ABIERTA" && jornada.estado !== "REABIERTA") {
    throw new Error("Solo se puede cerrar una jornada abierta");
  }

  const saldoEsperado =
    Number(jornada.baseInicial) +
    Number(jornada.totalCobros) -
    Number(jornada.totalDevoluciones);

  const diferenciaCierre = efectivoContado - saldoEsperado;

  await prisma.jornadaCaja.update({
    where: { id: input.jornadaId },
    data: {
      estado: "CERRADA",
      cerradaPorUsuarioId: usuario.id,
      cerradaAt: new Date(),
      efectivoContado,
      saldoEsperado,
      diferenciaCierre,
      observacionCierre: input.observacionCierre?.trim() || null,
    },
  });

  revalidatePath("/caja");
}
