import { prisma } from "@/lib/prisma";

export async function getModulosAtencion() {
  return prisma.moduloAtencion.findMany({
    include: {
      piso: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}