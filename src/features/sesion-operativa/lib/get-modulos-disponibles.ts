import { prisma } from "@/lib/prisma";

export async function getModulosDisponibles() {
  return prisma.moduloAtencion.findMany({
    where: {
      estado: "ACTIVO",
      piso: {
        is: {
          estado: "ACTIVO",
        },
      },
    },
    include: {
      piso: {
        include: {
          cajas: {
            where: {
              estado: "ACTIVO",
            },
            orderBy: {
              nombre: "asc",
            },
            select: {
              id: true,
              nombre: true,
              estado: true,
            },
          },
        },
      },
    },
    orderBy: [{ nombre: "asc" }],
  });
}