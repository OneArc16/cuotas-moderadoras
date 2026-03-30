import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUsuario() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const authUserId = session?.user?.id;

  if (!authUserId) {
    return null;
  }

  return prisma.usuario.findUnique({
    where: {
      authUserId,
    },
    include: {
      rol: {
        include: {
          permisos: {
            include: {
              permiso: true,
            },
          },
        },
      },
    },
  });
}