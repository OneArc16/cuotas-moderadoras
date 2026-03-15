import { prisma } from "@/lib/prisma";

export async function getCajasOperativas() {
  return prisma.caja.findMany({
    include: {
      piso: true,
      jornadas: {
        orderBy: {
          fechaOperativa: "desc",
        },
        take: 1,
        select: {
          id: true,
          fechaOperativa: true,
          estado: true,
          baseInicial: true,
          abiertaAt: true,
          cerradaAt: true,
          saldoEsperado: true,
          efectivoContado: true,
          diferenciaCierre: true,
        },
      },
    },
    orderBy: [
      {
        piso: {
          nombre: "asc",
        },
      },
      {
        nombre: "asc",
      },
    ],
  });
}