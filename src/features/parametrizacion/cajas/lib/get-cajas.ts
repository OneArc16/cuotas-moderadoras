import { prisma } from "@/lib/prisma";

export async function getCajas() {
  return prisma.caja.findMany({
    select: {
      id: true,
      nombre: true,
      estado: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
}