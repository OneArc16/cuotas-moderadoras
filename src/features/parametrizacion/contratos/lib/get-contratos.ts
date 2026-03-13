import { prisma } from "@/lib/prisma";

export async function getContratos() {
  return prisma.contrato.findMany({
    orderBy: {
      id: "asc",
    },
  });
}