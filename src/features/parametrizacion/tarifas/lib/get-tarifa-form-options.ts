import { prisma } from "@/lib/prisma";

export async function getTarifaFormOptions() {
  const [servicios, contratos] = await Promise.all([
    prisma.servicio.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
      },
    }),
    prisma.contrato.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        categorias: {
          where: { estado: "ACTIVO" },
          orderBy: {
            categoriaAfiliacion: {
              nombre: "asc",
            },
          },
          select: {
            id: true,
            categoriaAfiliacionId: true,
            categoriaAfiliacion: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    servicios,
    contratos,
  };
}