"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUsuario } from "@/lib/current-user";

export async function closeSesionOperativaActual() {
  const usuario = await getCurrentUsuario();

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
    throw new Error("No tienes una sesión operativa activa");
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