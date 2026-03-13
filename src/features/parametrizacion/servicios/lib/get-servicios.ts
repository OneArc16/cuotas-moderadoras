import { prisma } from "@/lib/prisma";

export async function getServicios() {
  return prisma.servicio.findMany({
    orderBy: {
      id: "asc",
    },
  });
}
