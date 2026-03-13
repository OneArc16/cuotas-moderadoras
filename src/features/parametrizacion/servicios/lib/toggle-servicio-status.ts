"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleServicioStatus(id: number) {
  const servicio = await prisma.servicio.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe");
  }

  await prisma.servicio.update({
    where: { id },
    data: {
      estado: servicio.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
    },
  });

  revalidatePath("/parametrizacion/servicios");
}
