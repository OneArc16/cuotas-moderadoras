"use server";

import { z } from "zod";

import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { PacienteLookupResult } from "@/features/admisiones/lib/find-paciente-by-documento";

const updatePacienteRapidoSchema = z.object({
  pacienteId: z.coerce.number().int().positive("Paciente inválido."),
  primerNombre: z
    .string()
    .trim()
    .min(2, "El primer nombre debe tener al menos 2 caracteres.")
    .max(80, "El primer nombre es demasiado largo."),
  segundoNombre: z
    .string()
    .trim()
    .max(80, "El segundo nombre es demasiado largo.")
    .optional()
    .or(z.literal("")),
  primerApellido: z
    .string()
    .trim()
    .min(2, "El primer apellido debe tener al menos 2 caracteres.")
    .max(80, "El primer apellido es demasiado largo."),
  segundoApellido: z
    .string()
    .trim()
    .max(80, "El segundo apellido es demasiado largo.")
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .trim()
    .max(30, "El teléfono es demasiado largo.")
    .optional()
    .or(z.literal("")),
});

export type UpdatePacienteRapidoResult =
  | {
      ok: true;
      paciente: PacienteLookupResult;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        pacienteId?: string[];
        primerNombre?: string[];
        segundoNombre?: string[];
        primerApellido?: string[];
        segundoApellido?: string[];
        telefono?: string[];
      };
    };

function toUpperOrNull(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalized.toUpperCase();
}

function buildFullName(paciente: {
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

export async function updatePacienteRapidoAction(
  input: unknown,
): Promise<UpdatePacienteRapidoResult> {
  const currentUser = await getCurrentUsuario();

  if (!currentUser) {
    return {
      ok: false,
      message: "No se pudo validar la sesión actual.",
    };
  }

  const parsed = updatePacienteRapidoSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Corrige los datos del paciente e inténtalo de nuevo.",
      fieldErrors: {
        pacienteId: flattened.fieldErrors.pacienteId,
        primerNombre: flattened.fieldErrors.primerNombre,
        segundoNombre: flattened.fieldErrors.segundoNombre,
        primerApellido: flattened.fieldErrors.primerApellido,
        segundoApellido: flattened.fieldErrors.segundoApellido,
        telefono: flattened.fieldErrors.telefono,
      },
    };
  }

  const existente = await prisma.paciente.findUnique({
    where: { id: parsed.data.pacienteId },
    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
    },
  });

  if (!existente) {
    return {
      ok: false,
      message: "El paciente seleccionado ya no existe.",
      fieldErrors: {
        pacienteId: ["El paciente seleccionado ya no existe."],
      },
    };
  }

  const paciente = await prisma.paciente.update({
    where: {
      id: parsed.data.pacienteId,
    },
    data: {
      primerNombre: parsed.data.primerNombre.trim().toUpperCase(),
      segundoNombre: toUpperOrNull(parsed.data.segundoNombre),
      primerApellido: parsed.data.primerApellido.trim().toUpperCase(),
      segundoApellido: toUpperOrNull(parsed.data.segundoApellido),
      telefono: parsed.data.telefono?.trim() || null,
    },
    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      telefono: true,
      estado: true,
    },
  });

  return {
    ok: true,
    paciente: {
      id: paciente.id,
      tipoDocumento: paciente.tipoDocumento,
      numeroDocumento: paciente.numeroDocumento,
      primerNombre: paciente.primerNombre,
      segundoNombre: paciente.segundoNombre,
      primerApellido: paciente.primerApellido,
      segundoApellido: paciente.segundoApellido,
      nombreCompleto: buildFullName(paciente),
      telefono: paciente.telefono,
      estado: paciente.estado,
    },
  };
}