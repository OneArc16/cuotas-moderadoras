"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUsuario } from "@/lib/current-user";

type OpenJornadaCajaInput = {
  cajaId: number;
  baseInicial: string;
  observacionApertura?: string;
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

export async function openJornadaCaja(input: OpenJornadaCajaInput) {
  const baseInicial = Number(input.baseInicial);

  if (Number.isNaN(baseInicial) || baseInicial < 0) {
    throw new Error("La base inicial debe ser un valor válido");
  }

  const usuario = await getCurrentUsuario();

  const caja = await prisma.caja.findUnique({
    where: { id: input.cajaId },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!caja) {
    throw new Error("La caja no existe");
  }

  if (caja.estado !== "ACTIVO") {
    throw new Error("La caja no está activa");
  }

  const fechaOperativa = getFechaOperativaBogota();

  const jornadaAbierta = await prisma.jornadaCaja.findFirst({
    where: {
      cajaId: input.cajaId,
      fechaOperativa,
      estado: {
        in: ["ABIERTA", "REABIERTA"],
      },
    },
    select: { id: true },
  });

  if (jornadaAbierta) {
    throw new Error("Esa caja ya tiene una jornada abierta para hoy");
  }

  await prisma.jornadaCaja.create({
    data: {
      cajaId: input.cajaId,
      fechaOperativa,
      baseInicial,
      abiertaPorUsuarioId: usuario.id,
      abiertaAt: new Date(),
      observacionApertura: input.observacionApertura?.trim() || null,
      saldoEsperado: baseInicial,
    },
  });

  revalidatePath("/caja");
}