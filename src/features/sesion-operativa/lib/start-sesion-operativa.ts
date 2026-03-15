"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUsuario } from "@/lib/current-user";

type StartSesionOperativaInput = {
  moduloAtencionId: number;
};

function getFechaOperativaBogota() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const fecha = formatter.format(new Date());
  return new Date(`${fecha}T00:00:00-05:00`);
}

export async function startSesionOperativa(
  input: StartSesionOperativaInput
) {
  const usuario = await getCurrentUsuario();

  const modulo = await prisma.moduloAtencion.findUnique({
    where: { id: input.moduloAtencionId },
    include: {
      piso: {
        include: {
          cajas: {
            where: { estado: "ACTIVO" },
            orderBy: { nombre: "asc" },
            select: {
              id: true,
              nombre: true,
              estado: true,
            },
          },
        },
      },
    },
  });

  if (!modulo) {
    throw new Error("El módulo de atención no existe");
  }

  if (modulo.estado !== "ACTIVO") {
    throw new Error("El módulo de atención no está activo");
  }

  if (modulo.piso.estado !== "ACTIVO") {
    throw new Error("El piso del módulo no está activo");
  }

  const caja = modulo.piso.cajas[0] ?? null;

  if (!caja) {
    throw new Error("El piso seleccionado no tiene una caja activa");
  }

  const fechaOperativa = getFechaOperativaBogota();

  const jornadaCaja = await prisma.jornadaCaja.findFirst({
    where: {
      cajaId: caja.id,
      fechaOperativa,
      estado: {
        in: ["ABIERTA", "REABIERTA"],
      },
    },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!jornadaCaja) {
    throw new Error(
      "La caja del piso no tiene una jornada abierta para hoy"
    );
  }

  await prisma.sesionOperativa.updateMany({
    where: {
      usuarioId: usuario.id,
      estado: "ACTIVA",
    },
    data: {
      estado: "CERRADA",
      horaFin: new Date(),
    },
  });

  await prisma.sesionOperativa.create({
    data: {
      usuarioId: usuario.id,
      moduloAtencionId: modulo.id,
      pisoId: modulo.pisoId,
      cajaId: caja.id,
      fechaOperativa,
      horaInicio: new Date(),
    },
  });

  revalidatePath("/");
}