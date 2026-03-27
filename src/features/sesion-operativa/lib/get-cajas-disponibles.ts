import { prisma } from "@/lib/prisma";
import { getFechaOperativaBogota } from "@/features/sesion-operativa/lib/fecha-operativa";

export async function getCajasDisponibles() {
  const fechaOperativa = getFechaOperativaBogota();

  const cajas = await prisma.caja.findMany({
    where: {
      estado: "ACTIVO",
    },
    select: {
      id: true,
      nombre: true,
      jornadas: {
        where: {
          fechaOperativa,
          estado: {
            in: ["ABIERTA", "REABIERTA"],
          },
        },
        orderBy: [{ fechaOperativa: "desc" }, { createdAt: "desc" }],
        take: 1,
        select: {
          id: true,
          estado: true,
          fechaOperativa: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return cajas.map((caja) => ({
    id: caja.id,
    nombre: caja.nombre,
    jornadaActiva: caja.jornadas[0] ?? null,
  }));
}