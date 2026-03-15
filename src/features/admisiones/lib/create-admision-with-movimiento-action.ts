"use server";

import { z } from "zod";

import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getTarifaVigente } from "@/features/admisiones/lib/get-tarifa-vigente";

const createAdmisionSchema = z.object({
  pacienteId: z.coerce.number().int().positive("Paciente inválido."),
  contratoId: z.coerce.number().int().positive("Contrato inválido."),
  servicioId: z.coerce.number().int().positive("Servicio inválido."),
  categoriaAfiliacionId: z.coerce.number().int().positive().nullable().optional(),
  descuentoValor: z.coerce.number().min(0, "El descuento no puede ser negativo.").default(0),
  valorRecibido: z.coerce.number().min(0, "El valor recibido no puede ser negativo."),
  observacion: z.string().trim().max(500, "La observación es demasiado larga.").optional().or(z.literal("")),
  razonDescuento: z.string().trim().max(250, "La razón del descuento es demasiado larga.").optional().or(z.literal("")),
});

export type CreateAdmisionWithMovimientoResult =
  | {
      ok: true;
      admision: {
        id: number;
        movimientoId: number;
        valorBase: string;
        descuentoAplicado: string;
        valorFinalCobrado: string;
        valorRecibido: string;
        valorDevuelto: string;
        tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
      };
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        pacienteId?: string[];
        contratoId?: string[];
        servicioId?: string[];
        categoriaAfiliacionId?: string[];
        descuentoValor?: string[];
        valorRecibido?: string[];
        observacion?: string[];
        razonDescuento?: string[];
      };
    };

function toMoneyString(value: number) {
  return value.toFixed(2);
}

function buildPacienteNombreSnapshot(paciente: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [
    paciente.primerNombre,
    paciente.segundoNombre,
    paciente.primerApellido,
    paciente.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function createAdmisionWithMovimientoAction(
  input: unknown,
): Promise<CreateAdmisionWithMovimientoResult> {
  const currentUser = await getCurrentUsuario();

  if (!currentUser) {
    return {
      ok: false,
      message: "No se pudo validar la sesión actual.",
    };
  }

  const parsed = createAdmisionSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Corrige los datos de la admisión e inténtalo de nuevo.",
      fieldErrors: {
        pacienteId: flattened.fieldErrors.pacienteId,
        contratoId: flattened.fieldErrors.contratoId,
        servicioId: flattened.fieldErrors.servicioId,
        categoriaAfiliacionId: flattened.fieldErrors.categoriaAfiliacionId,
        descuentoValor: flattened.fieldErrors.descuentoValor,
        valorRecibido: flattened.fieldErrors.valorRecibido,
        observacion: flattened.fieldErrors.observacion,
        razonDescuento: flattened.fieldErrors.razonDescuento,
      },
    };
  }

  const data = parsed.data;

  const sesionOperativa = await prisma.sesionOperativa.findFirst({
    where: {
      usuarioId: currentUser.id,
      estado: "ACTIVA",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fechaOperativa: true,
      pisoId: true,
      cajaId: true,
      moduloAtencionId: true,
    },
  });

  if (!sesionOperativa) {
    return {
      ok: false,
      message: "No hay una sesión operativa activa para registrar la admisión.",
    };
  }

  const jornadaCaja = await prisma.jornadaCaja.findFirst({
    where: {
      cajaId: sesionOperativa.cajaId,
      estado: {
        in: ["ABIERTA", "REABIERTA"],
      },
    },
    orderBy: [{ fechaOperativa: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
    },
  });

  if (!jornadaCaja) {
    return {
      ok: false,
      message: "La caja no tiene una jornada abierta o reabierta.",
    };
  }

  const [paciente, contrato, servicio, categoriaAfiliacion] = await Promise.all([
    prisma.paciente.findUnique({
      where: { id: data.pacienteId },
      select: {
        id: true,
        tipoDocumento: true,
        numeroDocumento: true,
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,
        estado: true,
      },
    }),
    prisma.contrato.findUnique({
      where: { id: data.contratoId },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        estado: true,
      },
    }),
    prisma.servicio.findUnique({
      where: { id: data.servicioId },
      select: {
        id: true,
        nombre: true,
        estado: true,
      },
    }),
    data.categoriaAfiliacionId
      ? prisma.categoriaAfiliacion.findUnique({
          where: { id: data.categoriaAfiliacionId },
          select: {
            id: true,
            codigo: true,
            nombre: true,
            estado: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!paciente) {
    return {
      ok: false,
      message: "El paciente seleccionado ya no existe.",
      fieldErrors: {
        pacienteId: ["El paciente seleccionado ya no existe."],
      },
    };
  }

  if (!contrato || contrato.estado !== "ACTIVO") {
    return {
      ok: false,
      message: "El contrato seleccionado no está disponible.",
      fieldErrors: {
        contratoId: ["El contrato seleccionado no está disponible."],
      },
    };
  }

  if (!servicio || servicio.estado !== "ACTIVO") {
    return {
      ok: false,
      message: "El servicio seleccionado no está disponible.",
      fieldErrors: {
        servicioId: ["El servicio seleccionado no está disponible."],
      },
    };
  }

  if (data.categoriaAfiliacionId) {
    if (!categoriaAfiliacion || categoriaAfiliacion.estado !== "ACTIVO") {
      return {
        ok: false,
        message: "La categoría seleccionada no está disponible.",
        fieldErrors: {
          categoriaAfiliacionId: ["La categoría seleccionada no está disponible."],
        },
      };
    }

    const categoriaHabilitada = await prisma.contratoCategoriaAfiliacion.findFirst({
      where: {
        contratoId: contrato.id,
        categoriaAfiliacionId: categoriaAfiliacion.id,
        estado: "ACTIVO",
      },
      select: { id: true },
    });

    if (!categoriaHabilitada) {
      return {
        ok: false,
        message: "La categoría no está habilitada para este contrato.",
        fieldErrors: {
          categoriaAfiliacionId: ["La categoría no está habilitada para este contrato."],
        },
      };
    }
  }

  const tarifa = await getTarifaVigente({
    contratoId: contrato.id,
    servicioId: servicio.id,
    categoriaAfiliacionId: data.categoriaAfiliacionId ?? null,
  });

  if (!tarifa) {
    return {
      ok: false,
      message: "No existe una tarifa vigente para la combinación seleccionada.",
    };
  }

  const valorBase = Number(tarifa.valor);
  const descuentoSolicitado = Math.max(data.descuentoValor ?? 0, 0);
  const descuentoAplicado =
    contrato.tipo === "PARTICULAR"
      ? Math.min(descuentoSolicitado, valorBase)
      : 0;

  const valorFinalCobrado = Math.max(valorBase - descuentoAplicado, 0);
  const valorRecibido = data.valorRecibido;
  const valorDevuelto = Math.max(valorRecibido - valorFinalCobrado, 0);

  if (valorRecibido < valorFinalCobrado) {
    return {
      ok: false,
      message: "El valor recibido no cubre el total a pagar.",
      fieldErrors: {
        valorRecibido: ["El valor recibido no cubre el total a pagar."],
      },
    };
  }

  const descuentoTipo =
    descuentoAplicado > 0 ? "VALOR_FIJO" : "NINGUNO";

  const pacienteNombreSnapshot = buildPacienteNombreSnapshot(paciente);
  const pacienteDocumentoSnapshot = `${paciente.tipoDocumento} ${paciente.numeroDocumento}`;
  const categoriaNombreSnapshot = categoriaAfiliacion
    ? `${categoriaAfiliacion.codigo} · ${categoriaAfiliacion.nombre}`
    : null;

  const result = await prisma.$transaction(async (tx) => {
    const admision = await tx.admision.create({
      data: {
        pacienteId: paciente.id,
        servicioId: servicio.id,
        contratoId: contrato.id,
        categoriaAfiliacionId: categoriaAfiliacion?.id ?? null,
        tipoCobro: tarifa.tipoCobro,
        pisoId: sesionOperativa.pisoId,
        moduloAtencionId: sesionOperativa.moduloAtencionId,
        cajaId: sesionOperativa.cajaId,
        jornadaCajaId: jornadaCaja.id,
        sesionOperativaId: sesionOperativa.id,
        registradaPorUsuarioId: currentUser.id,
        pacienteNombreSnapshot,
        pacienteDocumentoSnapshot,
        servicioNombreSnapshot: servicio.nombre,
        contratoNombreSnapshot: contrato.nombre,
        categoriaAfiliacionNombreSnapshot: categoriaNombreSnapshot,
        tipoCobroSnapshot: tarifa.tipoCobro,
        tarifaIdAplicada: tarifa.id,
        valorBase: toMoneyString(valorBase),
        descuentoTipo,
        descuentoValor: toMoneyString(descuentoSolicitado),
        descuentoCalculado: toMoneyString(descuentoAplicado),
        razonDescuento:
          descuentoAplicado > 0 ? data.razonDescuento?.trim() || null : null,
        valorFinalCobrado: toMoneyString(valorFinalCobrado),
        valorRecibido: toMoneyString(valorRecibido),
        valorDevuelto: toMoneyString(valorDevuelto),
        observacion: data.observacion?.trim() || null,
      },
      select: {
        id: true,
      },
    });

    const movimiento = await tx.movimiento.create({
      data: {
        admisionId: admision.id,
        jornadaCajaId: jornadaCaja.id,
        cajaId: sesionOperativa.cajaId,
        pisoId: sesionOperativa.pisoId,
        moduloAtencionId: sesionOperativa.moduloAtencionId,
        usuarioId: currentUser.id,
        tipoMovimiento: "COBRO",
        naturaleza: "ENTRADA",
        valor: toMoneyString(valorFinalCobrado),
        descripcion: `Cobro admisión ${servicio.nombre}`,
        referencia: `ADM-${admision.id}`,
      },
      select: {
        id: true,
      },
    });

    await tx.jornadaCaja.update({
      where: {
        id: jornadaCaja.id,
      },
      data: {
        totalCobros: {
          increment: valorFinalCobrado,
        },
        saldoEsperado: {
          increment: valorFinalCobrado,
        },
      },
    });

    return {
      admisionId: admision.id,
      movimientoId: movimiento.id,
    };
  });

  return {
    ok: true,
    admision: {
      id: result.admisionId,
      movimientoId: result.movimientoId,
      valorBase: toMoneyString(valorBase),
      descuentoAplicado: toMoneyString(descuentoAplicado),
      valorFinalCobrado: toMoneyString(valorFinalCobrado),
      valorRecibido: toMoneyString(valorRecibido),
      valorDevuelto: toMoneyString(valorDevuelto),
      tipoCobro: tarifa.tipoCobro,
    },
  };
}