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
      moduloAtencion: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
        },
      },
      piso: {
        select: {
          id: true,
          nombre: true,
        },
      },
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