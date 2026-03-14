import { prisma } from "@/lib/prisma";

export async function getContratos() {
  return prisma.contrato.findMany({
    include: {
      categorias: {
        include: {
          categoriaAfiliacion: true,
        },
        orderBy: {
          categoriaAfiliacion: {
            nombre: "asc",
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}