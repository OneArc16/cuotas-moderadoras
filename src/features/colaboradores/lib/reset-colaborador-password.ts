"use server";

import { isAPIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

const resetColaboradorPasswordSchema = z
  .object({
    id: z.coerce.number().int().positive("Colaborador inválido."),
    password: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "La confirmación debe tener al menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
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
  await requirePermission(
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
      message: "Revisa los datos de la nueva contraseña.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, password } = parsed.data;

  const colaborador = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      authUserId: true,
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
        "Este colaborador no está vinculado a Better Auth. Primero hay que vincularlo.",
    };
  }

  try {
    await auth.api.setUserPassword({
      body: {
        userId: colaborador.authUserId,
        newPassword: password,
      },
      headers: await headers(),
    });

    await prisma.usuario.update({
      where: { id },
      data: {
        passwordHash: "AUTH_MANAGED",
      },
    });

    revalidatePath("/colaboradores");
    revalidatePath(`/colaboradores/${id}/editar`);

    return {
      success: true,
      message: "Contraseña actualizada correctamente.",
    };
  } catch (error) {
    if (isAPIError(error)) {
      return {
        success: false,
        message: error.message || "No se pudo actualizar la contraseña.",
      };
    }

    console.error("Error al resetear contraseña del colaborador:", error);

    return {
      success: false,
      message: "No se pudo actualizar la contraseña.",
    };
  }
}