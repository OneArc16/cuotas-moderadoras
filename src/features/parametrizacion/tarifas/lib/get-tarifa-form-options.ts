import { prisma } from "@/lib/prisma";

export async function getTarifaFormOptions() {
  const [servicios, contratos, categorias] = await Promise.all([
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
      },
    }),
    prisma.categoriaAfiliacion.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
      },
    }),
  ]);

  return {
    servicios,
    contratos,
    categorias,
  };
}
