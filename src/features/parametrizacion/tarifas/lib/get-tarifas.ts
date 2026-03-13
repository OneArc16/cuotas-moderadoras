import { prisma } from "@/lib/prisma";

export async function getTarifas() {
  return prisma.tarifaServicio.findMany({
    include: {
      servicio: true,
      contrato: true,
      categoriaAfiliacion: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}
