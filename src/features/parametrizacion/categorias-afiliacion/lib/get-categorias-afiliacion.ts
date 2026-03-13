import { prisma } from "@/lib/prisma";

export async function getCategoriasAfiliacion() {
  return prisma.categoriaAfiliacion.findMany({
    orderBy: {
      id: "asc",
    },
  });
}
