"use server";

import { z } from "zod";

import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";
import {
  findPacienteByDocumento,
  TIPO_DOCUMENTO_VALUES,
  type PacienteLookupResult,
} from "@/features/admisiones/lib/find-paciente-by-documento";

const searchPacienteByDocumentoSchema = z.object({
  tipoDocumento: z.enum(TIPO_DOCUMENTO_VALUES, {
    message: "Selecciona un tipo de documento valido.",
  }),
  numeroDocumento: z
    .string()
    .trim()
    .min(4, "El numero de documento debe tener al menos 4 caracteres.")
    .max(30, "El numero de documento es demasiado largo."),
});

export type SearchPacienteByDocumentoResult =
  | {
      ok: true;
      paciente: PacienteLookupResult | null;
      notFound: boolean;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        tipoDocumento?: string[];
        numeroDocumento?: string[];
      };
    };

export async function searchPacienteByDocumentoAction(
  input: unknown,
): Promise<SearchPacienteByDocumentoResult> {
  const currentUser = await getCurrentUsuario();

  if (!currentUser) {
    return {
      ok: false,
      message: "No se pudo validar la sesion actual.",
    };
  }

  if (!hasPermission(currentUser, RBAC_PERMISSION.ADMISION_CREATE)) {
    return {
      ok: false,
      message: "No tienes permiso para preparar una admision.",
    };
  }

  const parsed = searchPacienteByDocumentoSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Corrige los datos de busqueda e intentalo de nuevo.",
      fieldErrors: {
        tipoDocumento: flattened.fieldErrors.tipoDocumento,
        numeroDocumento: flattened.fieldErrors.numeroDocumento,
      },
    };
  }

  const paciente = await findPacienteByDocumento({
    tipoDocumento: parsed.data.tipoDocumento,
    numeroDocumento: parsed.data.numeroDocumento,
  });

  return {
    ok: true,
    paciente,
    notFound: !paciente,
  };
}
