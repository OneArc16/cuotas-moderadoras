"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";
import { getFechaOperativaBogota } from "@/features/sesion-operativa/lib/fecha-operativa";

type StartSesionOperativaInput = {
  cajaId: number;
};

export async function startSesionOperativa(
  input: StartSesionOperativaInput,
) {
  const usuario = await requirePermission(
    RBAC_PERMISSION.SESSION_START,
    "No tienes permiso para iniciar sesiones operativas.",
  );

  const caja = await prisma.caja.findUnique({
    where: { id: input.cajaId },
    select: {
      id: true,
      nombre: true,
      estado: true,
    },
  });

  if (!caja) {
    throw new Error("La caja seleccionada no existe");
  }

  if (caja.estado !== "ACTIVO") {
    throw new Error("La caja seleccionada no esta activa");
  }

  const fechaOperativa = getFechaOperativaBogota();

  const jornadaCaja = await prisma.jornadaCaja.findFirst({
    where: {
      cajaId: caja.id,
      fechaOperativa,
      estado: {
        in: ["ABIERTA", "REABIERTA"],
      },
    },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!jornadaCaja) {
    throw new Error(
      "La caja seleccionada no tiene una jornada abierta para hoy",
    );
  }

  await prisma.sesionOperativa.updateMany({
    where: {
      usuarioId: usuario.id,
      estado: "ACTIVA",
    },
    data: {
      estado: "CERRADA",
      horaFin: new Date(),
    },
  });

  await prisma.sesionOperativa.create({
    data: {
      usuarioId: usuario.id,
      cajaId: caja.id,
      fechaOperativa,
      horaInicio: new Date(),
    },
  });

  revalidatePath("/");
}
