"use server";

import { z } from "zod";

import { getCurrentUsuario } from "@/lib/current-user";
import { getBogotaOperationalDayRange } from "@/lib/fecha-operativa-bogota";
import { prisma } from "@/lib/prisma";

const openJornadaCajaSchema = z.object({
  cajaId: z.coerce.number().int().positive("Caja inválida."),
  baseInicial: z.coerce
    .number()
    .min(0, "La base inicial no puede ser negativa."),
  observacionApertura: z
    .string()
    .trim()
    .max(500, "La observación es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type OpenJornadaCajaResult =
  | {
      ok: true;
      jornada: {
        id: number;
        estado: "ABIERTA";
        fechaOperativa: string;
      };
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        cajaId?: string[];
        baseInicial?: string[];
        observacionApertura?: string[];
      };
    };

export async function openJornadaCaja(
  input: unknown,
): Promise<OpenJornadaCajaResult> {
  const parsed = openJornadaCajaSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Corrige los datos de apertura e inténtalo de nuevo.",
      fieldErrors: {
        cajaId: flattened.fieldErrors.cajaId,
        baseInicial: flattened.fieldErrors.baseInicial,
        observacionApertura: flattened.fieldErrors.observacionApertura,
      },
    };
  }

  const usuario = await getCurrentUsuario();

  if (!usuario) {
    return {
      ok: false,
      message: "No se pudo validar la sesión actual.",
    };
  }

  const { cajaId, baseInicial, observacionApertura } = parsed.data;
  const { start, end, fechaOperativa } = getBogotaOperationalDayRange();

  const caja = await prisma.caja.findUnique({
    where: { id: cajaId },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!caja || caja.estado !== "ACTIVO") {
    return {
      ok: false,
      message: "La caja seleccionada no está disponible.",
      fieldErrors: {
        cajaId: ["La caja seleccionada no está disponible."],
      },
    };
  }

  const jornadaDelDia = await prisma.jornadaCaja.findFirst({
    where: {
      cajaId,
      fechaOperativa: {
        gte: start,
        lte: end,
      },
    },
    orderBy: [{ fechaOperativa: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      estado: true,
    },
  });

  if (jornadaDelDia) {
    if (jornadaDelDia.estado === "ABIERTA" || jornadaDelDia.estado === "REABIERTA") {
      return {
        ok: false,
        message: "Esta caja ya tiene una jornada activa hoy.",
      };
    }

    return {
      ok: false,
      message:
        "Esta caja ya tuvo jornada hoy. La acción correcta es reabrir la jornada, no volver a abrir una nueva.",
    };
  }

  const jornada = await prisma.jornadaCaja.create({
    data: {
      cajaId,
      fechaOperativa,
      estado: "ABIERTA",
      baseInicial,
      abiertaPorUsuarioId: usuario.id,
      abiertaAt: new Date(),
      totalCobros: 0,
      totalDevoluciones: 0,
      saldoEsperado: baseInicial,
      observacionApertura: observacionApertura?.trim() || null,
    },
    select: {
      id: true,
      estado: true,
      fechaOperativa: true,
    },
  });

  return {
    ok: true,
    jornada: {
      id: jornada.id,
      estado: jornada.estado,
      fechaOperativa: jornada.fechaOperativa.toISOString(),
    },
  };
}