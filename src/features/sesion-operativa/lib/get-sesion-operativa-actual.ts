import { prisma } from "@/lib/prisma";
import { getCurrentUsuario } from "@/lib/current-user";

export async function getSesionOperativaActual() {
  const usuario = await getCurrentUsuario();

  return prisma.sesionOperativa.findFirst({
    where: {
      usuarioId: usuario.id,
      estado: "ACTIVA",
    },
    include: {
      caja: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: {
      horaInicio: "desc",
    },
  });
}