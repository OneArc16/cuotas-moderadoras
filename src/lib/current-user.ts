import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function getCurrentUsuario() {
  const session = await getServerSession();

  const authUserId = session?.user?.id;

  if (!authUserId) {
    throw new Error("No hay sesión activa");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { authUserId },
    select: {
      id: true,
      username: true,
      estado: true,
      rolId: true,
      rol: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  if (!usuario) {
    throw new Error("No existe un usuario de dominio vinculado a esta sesión");
  }

  if (usuario.estado !== "ACTIVO") {
    throw new Error("El usuario actual no está activo");
  }

  return usuario;
}