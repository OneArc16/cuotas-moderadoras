"use server";

import { z } from "zod";

import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  findPacienteByDocumento,
  TIPO_DOCUMENTO_VALUES,
  type PacienteLookupResult,
} from "@/features/admisiones/lib/find-paciente-by-documento";

const createPacienteRapidoSchema = z.object({
  tipoDocumento: z.enum(TIPO_DOCUMENTO_VALUES, {
    message: "Selecciona un tipo de documento válido.",
  }),
  numeroDocumento: z
    .string()
    .trim()
    .min(4, "El número de documento debe tener al menos 4 caracteres.")
    .max(30, "El número de documento es demasiado largo."),
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

export type CreatePacienteRapidoResult =
  | {
      ok: true;
      paciente: PacienteLookupResult;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        tipoDocumento?: string[];
        numeroDocumento?: string[];
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

export async function createPacienteRapidoAction(
  input: unknown,
): Promise<CreatePacienteRapidoResult> {
  const currentUser = await getCurrentUsuario();

  if (!currentUser) {
    return {
      ok: false,
      message: "No se pudo validar la sesión actual.",
    };
  }

  const parsed = createPacienteRapidoSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Corrige los datos del paciente e inténtalo de nuevo.",
      fieldErrors: {
        tipoDocumento: flattened.fieldErrors.tipoDocumento,
        numeroDocumento: flattened.fieldErrors.numeroDocumento,
        primerNombre: flattened.fieldErrors.primerNombre,
        segundoNombre: flattened.fieldErrors.segundoNombre,
        primerApellido: flattened.fieldErrors.primerApellido,
        segundoApellido: flattened.fieldErrors.segundoApellido,
        telefono: flattened.fieldErrors.telefono,
      },
    };
  }

  const data = {
    tipoDocumento: parsed.data.tipoDocumento,
    numeroDocumento: parsed.data.numeroDocumento.replace(/\s+/g, "").trim(),
    primerNombre: parsed.data.primerNombre.trim().toUpperCase(),
    segundoNombre: toUpperOrNull(parsed.data.segundoNombre),
    primerApellido: parsed.data.primerApellido.trim().toUpperCase(),
    segundoApellido: toUpperOrNull(parsed.data.segundoApellido),
    telefono: parsed.data.telefono?.trim() || null,
  };

  const existente = await findPacienteByDocumento({
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
  });

  if (existente) {
    return {
      ok: false,
      message: "Ya existe un paciente con ese documento.",
      fieldErrors: {
        numeroDocumento: ["Ya existe un paciente con ese documento."],
      },
    };
  }

  const paciente = await prisma.paciente.create({
    data: {
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      primerNombre: data.primerNombre,
      segundoNombre: data.segundoNombre,
      primerApellido: data.primerApellido,
      segundoApellido: data.segundoApellido,
      telefono: data.telefono,
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
      nombreCompleto: [
        paciente.primerNombre,
        paciente.segundoNombre,
        paciente.primerApellido,
        paciente.segundoApellido,
      ]
        .filter(Boolean)
        .join(" "),
      telefono: paciente.telefono,
      estado: paciente.estado,
    },
  };
}