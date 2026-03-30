"use server";

import { isAPIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

import { getColaboradorDisplayName } from "./colaborador-audit";

const resetColaboradorPasswordSchema = z
  .object({
    id: z.coerce.number().int().positive("Colaborador invalido."),
    password: z
      .string()
      .min(6, "La nueva contrasena debe tener al menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "La confirmacion debe tener al menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export type ResetColaboradorPasswordActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function resetColaboradorPassword(
  _prevState: ResetColaboradorPasswordActionState,
  formData: FormData,
): Promise<ResetColaboradorPasswordActionState> {
  const actor = await requirePermission(
    RBAC_PERMISSION.COLLABORATOR_MANAGE,
    "No tienes permiso para gestionar colaboradores.",
  );

  const parsed = resetColaboradorPasswordSchema.safeParse({
    id: formData.get("id"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos de la nueva contrasena.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, password } = parsed.data;
  const colaborador = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      authUserId: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      email: true,
      username: true,
    },
  });

  if (!colaborador) {
    return {
      success: false,
      message: "El colaborador no existe.",
    };
  }

  if (!colaborador.authUserId) {
    return {
      success: false,
      message:
        "Este colaborador no esta vinculado a Better Auth. Primero hay que vincularlo.",
    };
  }

  const nombreCompleto = getColaboradorDisplayName(colaborador);

  try {
    await auth.api.setUserPassword({
      body: {
        userId: colaborador.authUserId,
        newPassword: password,
      },
      headers: await headers(),
    });

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id },
        data: {
          passwordHash: "AUTH_MANAGED",
        },
      });

      await createAuditEntry(tx, {
        usuarioId: actor.id,
        accion: "COLABORADORES_RESETEAR_CONTRASENA",
        entidad: "Colaborador",
        entidadId: id,
        detalle: `Se restablecio la contrasena del colaborador ${nombreCompleto}.`,
        valorAnteriorJson: {
          username: colaborador.username,
          email: colaborador.email,
          passwordManaged: true,
        },
        valorNuevoJson: {
          username: colaborador.username,
          email: colaborador.email,
          passwordManaged: true,
          passwordResetAt: new Date().toISOString(),
        },
      });
    });

    revalidatePath("/colaboradores");
    revalidatePath(`/colaboradores/${id}/editar`);

    return {
      success: true,
      message: "Contrasena actualizada correctamente.",
    };
  } catch (error) {
    if (isAPIError(error)) {
      return {
        success: false,
        message: error.message || "No se pudo actualizar la contrasena.",
      };
    }

    console.error("Error al resetear contrasena del colaborador:", error);

    return {
      success: false,
      message: "No se pudo actualizar la contrasena.",
    };
  }
}