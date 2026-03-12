import { prisma } from "@/lib/prisma";

export async function getPisos() {
  return prisma.piso.findMany({
    orderBy: {
      id: "asc",
    },
  });
}