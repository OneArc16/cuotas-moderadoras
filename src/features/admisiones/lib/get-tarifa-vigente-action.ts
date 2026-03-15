"use server";

import { z } from "zod";

import { getCurrentUsuario } from "@/lib/current-user";
import { getTarifaVigente, type TarifaVigenteResult } from "@/features/admisiones/lib/get-tarifa-vigente";

const getTarifaVigenteSchema = z.object({
  contratoId: z.coerce.number().int().positive("Contrato inválido."),
  servicioId: z.coerce.number().int().positive("Servicio inválido."),
  categoriaAfiliacionId: z.coerce.number().int().positive().nullable().optional(),
});

export type GetTarifaVigenteActionResult =
  | {
      ok: true;
      tarifa: TarifaVigenteResult | null;
      notFound: boolean;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: {
        contratoId?: string[];
        servicioId?: string[];
        categoriaAfiliacionId?: string[];
      };
    };

export async function getTarifaVigenteAction(
  input: unknown,
): Promise<GetTarifaVigenteActionResult> {
  const currentUser = await getCurrentUsuario();

  if (!currentUser) {
    return {
      ok: false,
      message: "No se pudo validar la sesión actual.",
    };
  }

  const parsed = getTarifaVigenteSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return {
      ok: false,
      message: "Selecciona contrato, servicio y categoría válidos.",
      fieldErrors: {
        contratoId: flattened.fieldErrors.contratoId,
        servicioId: flattened.fieldErrors.servicioId,
        categoriaAfiliacionId: flattened.fieldErrors.categoriaAfiliacionId,
      },
    };
  }

  const tarifa = await getTarifaVigente({
    contratoId: parsed.data.contratoId,
    servicioId: parsed.data.servicioId,
    categoriaAfiliacionId: parsed.data.categoriaAfiliacionId ?? null,
  });

  return {
    ok: true,
    tarifa,
    notFound: !tarifa,
  };
}