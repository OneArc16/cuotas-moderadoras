"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

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
    select: { id: true },
  });

  if (!colaborador) {
    return {
      success: false,
      message: "El colaborador no existe.",
    };
  }

  const passwordHash = await hash(password, 10);

  await prisma.usuario.update({
    where: { id },
    data: {
      passwordHash,
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}/editar`);

  return {
    success: true,
    message: "Contraseña actualizada correctamente.",
  };
}