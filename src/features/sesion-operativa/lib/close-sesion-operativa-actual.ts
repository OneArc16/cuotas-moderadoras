"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

export async function closeSesionOperativaActual() {
  const usuario = await requirePermission(
    RBAC_PERMISSION.SESSION_CLOSE,
    "No tienes permiso para cerrar sesiones operativas.",
  );

  const sesionActiva = await prisma.sesionOperativa.findFirst({
    where: {
      usuarioId: usuario.id,
      estado: "ACTIVA",
    },
    select: {
      id: true,
    },
    orderBy: {
      horaInicio: "desc",
    },
  });

  if (!sesionActiva) {
    throw new Error("No tienes una sesion operativa activa");
  }

  await prisma.sesionOperativa.update({
    where: {
      id: sesionActiva.id,
    },
    data: {
      estado: "CERRADA",
      horaFin: new Date(),
    },
  });

  revalidatePath("/");
}
