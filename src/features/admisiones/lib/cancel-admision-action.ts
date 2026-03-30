"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { RBAC_PERMISSION, requirePermission } from "@/lib/rbac";

import { buildAdmisionAuditSnapshot } from "./admision-audit";

const cancelAdmisionSchema = z.object({
  admisionId: z.coerce.number().int().positive("La admision es invalida."),
  motivoAnulacion: z
    .string()
    .trim()
    .min(5, "Describe brevemente el motivo de anulacion.")
    .max(500, "El motivo de anulacion es demasiado largo."),
});

export type CancelAdmisionActionResult =
  | {
      ok: true;
      message: string;
      admision: {
        id: number;
        estado: "ANULADA";
        movimientoId: number;
      };
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        admisionId?: string[];
        motivoAnulacion?: string[];
      };
    };

function buildFullName(usuario: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [
    usuario.primerNombre,
    usuario.segundoNombre,
    usuario.primerApellido,
    usuario.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function cancelAdmisionAction(
  input: unknown,
): Promise<CancelAdmisionActionResult> {
  const actor = await requirePermission(
    RBAC_PERMISSION.ADMISION_CANCEL,
    "No tienes permiso para anular admisiones.",
  );

  const parsed = cancelAdmisionSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Debes indicar un motivo valido para anular la admision.",
      fieldErrors: {
        admisionId: flattened.fieldErrors.admisionId,
        motivoAnulacion: flattened.fieldErrors.motivoAnulacion,
      },
    };
  }

  const data = parsed.data;
  const motivoAnulacion = data.motivoAnulacion.trim();
  const actorNombre = buildFullName(actor);

  const sesionOperativa = await prisma.sesionOperativa.findFirst({
    where: {
      usuarioId: actor.id,
      estado: "ACTIVA",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      cajaId: true,
    },
  });

  if (!sesionOperativa) {
    return {
      ok: false,
      message:
        "Debes tener una sesion operativa activa para anular admisiones.",
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
      message:
        "La caja actual debe tener una jornada abierta o reabierta para anular admisiones.",
    };
  }

  const admision = await prisma.admision.findUnique({
    where: {
      id: data.admisionId,
    },
    select: {
      id: true,
      estado: true,
      cajaId: true,
      jornadaCajaId: true,
      sesionOperativaId: true,
      pacienteNombreSnapshot: true,
      pacienteDocumentoSnapshot: true,
      servicioNombreSnapshot: true,
      contratoNombreSnapshot: true,
      categoriaAfiliacionNombreSnapshot: true,
      tipoCobroSnapshot: true,
      valorFinalCobrado: true,
      metodoPagoSnapshot: true,
      referenciaPagoSnapshot: true,
      observacion: true,
      motivoEstado: true,
      motivoAnulacion: true,
      anuladaAt: true,
      anuladaPorUsuarioId: true,
    },
  });

  if (!admision) {
    return {
      ok: false,
      message: "La admision seleccionada ya no existe.",
      fieldErrors: {
        admisionId: ["La admision seleccionada ya no existe."],
      },
    };
  }

  if (admision.estado === "ANULADA") {
    return {
      ok: false,
      message: "La admision seleccionada ya fue anulada.",
    };
  }

  if (
    admision.cajaId !== sesionOperativa.cajaId ||
    admision.jornadaCajaId !== jornadaCaja.id
  ) {
    return {
      ok: false,
      message:
        "Solo puedes anular admisiones de la caja y jornada operativa que tienes activas.",
    };
  }

  const valorFinalCobrado = Number(admision.valorFinalCobrado);
  const saldoEsperadoDecrement =
    admision.metodoPagoSnapshot === "EFECTIVO" ? valorFinalCobrado : 0;

  const previousSnapshot = buildAdmisionAuditSnapshot({
    id: admision.id,
    estado: admision.estado,
    pacienteNombreSnapshot: admision.pacienteNombreSnapshot,
    pacienteDocumentoSnapshot: admision.pacienteDocumentoSnapshot,
    servicioNombreSnapshot: admision.servicioNombreSnapshot,
    contratoNombreSnapshot: admision.contratoNombreSnapshot,
    categoriaAfiliacionNombreSnapshot:
      admision.categoriaAfiliacionNombreSnapshot,
    tipoCobroSnapshot: admision.tipoCobroSnapshot,
    cajaId: admision.cajaId,
    jornadaCajaId: admision.jornadaCajaId,
    sesionOperativaId: admision.sesionOperativaId,
    valorFinalCobrado: admision.valorFinalCobrado,
    metodoPagoSnapshot: admision.metodoPagoSnapshot,
    referenciaPagoSnapshot: admision.referenciaPagoSnapshot,
    observacion: admision.observacion,
    motivoEstado: admision.motivoEstado,
    motivoAnulacion: admision.motivoAnulacion,
    anuladaAt: admision.anuladaAt,
    anuladaPorUsuarioId: admision.anuladaPorUsuarioId,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const freshAdmision = await tx.admision.findUnique({
        where: {
          id: admision.id,
        },
        select: {
          id: true,
          estado: true,
        },
      });

      if (!freshAdmision) {
        throw new Error("La admision seleccionada ya no existe.");
      }

      if (freshAdmision.estado !== "REGISTRADA") {
        throw new Error("La admision ya no esta disponible para anular.");
      }

      const updatedAdmission = await tx.admision.updateMany({
        where: {
          id: admision.id,
          estado: "REGISTRADA",
        },
        data: {
          estado: "ANULADA",
          motivoEstado: motivoAnulacion,
          motivoAnulacion,
          anuladaAt: new Date(),
          anuladaPorUsuarioId: actor.id,
        },
      });

      if (updatedAdmission.count !== 1) {
        throw new Error("La admision ya no esta disponible para anular.");
      }

      const movimiento = await tx.movimiento.create({
        data: {
          admisionId: admision.id,
          jornadaCajaId: admision.jornadaCajaId,
          cajaId: admision.cajaId,
          pisoId: null,
          moduloAtencionId: null,
          usuarioId: actor.id,
          tipoMovimiento: "REVERSO_ANULACION",
          naturaleza: "SALIDA",
          valor: admision.valorFinalCobrado,
          metodoPago: admision.metodoPagoSnapshot ?? "OTRO",
          referenciaPago: admision.referenciaPagoSnapshot,
          descripcion: `Anulacion admision ${admision.servicioNombreSnapshot}`,
          referencia: `ADM-ANUL-${admision.id}`,
        },
        select: {
          id: true,
        },
      });

      await tx.jornadaCaja.update({
        where: {
          id: admision.jornadaCajaId,
        },
        data: {
          totalCobros: {
            decrement: valorFinalCobrado,
          },
          saldoEsperado: {
            decrement: saldoEsperadoDecrement,
          },
        },
      });

      await createAuditEntry(tx, {
        usuarioId: actor.id,
        accion: "ADMISIONES_ANULAR",
        entidad: "Admision",
        entidadId: admision.id,
        detalle: `Se anulo la admision de ${admision.pacienteNombreSnapshot}.`,
        valorAnteriorJson: previousSnapshot,
        valorNuevoJson: buildAdmisionAuditSnapshot({
          id: admision.id,
          estado: "ANULADA",
          pacienteNombreSnapshot: admision.pacienteNombreSnapshot,
          pacienteDocumentoSnapshot: admision.pacienteDocumentoSnapshot,
          servicioNombreSnapshot: admision.servicioNombreSnapshot,
          contratoNombreSnapshot: admision.contratoNombreSnapshot,
          categoriaAfiliacionNombreSnapshot:
            admision.categoriaAfiliacionNombreSnapshot,
          tipoCobroSnapshot: admision.tipoCobroSnapshot,
          cajaId: admision.cajaId,
          jornadaCajaId: admision.jornadaCajaId,
          sesionOperativaId: admision.sesionOperativaId,
          valorFinalCobrado: admision.valorFinalCobrado,
          metodoPagoSnapshot: admision.metodoPagoSnapshot,
          referenciaPagoSnapshot: admision.referenciaPagoSnapshot,
          observacion: admision.observacion,
          motivoEstado: motivoAnulacion,
          motivoAnulacion,
          anuladaAt: new Date(),
          anuladaPorUsuarioId: actor.id,
          anuladaPorUsuarioNombre: actorNombre,
          movimientoReversoId: movimiento.id,
        }),
      });

      return movimiento;
    });

    revalidatePath("/admisiones");
    revalidatePath("/caja");
    revalidatePath("/movimientos");

    return {
      ok: true,
      message: "Admision anulada correctamente.",
      admision: {
        id: admision.id,
        estado: "ANULADA",
        movimientoId: result.id,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo anular la admision.",
    };
  }
}