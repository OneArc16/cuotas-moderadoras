import { prisma } from "@/lib/prisma";

export async function getCajas() {
  return prisma.caja.findMany({
    include: {
      piso: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}