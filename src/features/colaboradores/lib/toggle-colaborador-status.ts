"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const toggleColaboradorStatusSchema = z.object({
  id: z.coerce.number().int().positive("Colaborador inválido."),
});

export async function toggleColaboradorStatus(formData: FormData) {
  const parsed = toggleColaboradorStatusSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    throw new Error("Colaborador inválido.");
  }

  const { id } = parsed.data;

  const colaborador = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!colaborador) {
    throw new Error("El colaborador no existe.");
  }

  const nuevoEstado =
    colaborador.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

  await prisma.usuario.update({
    where: { id },
    data: {
      estado: nuevoEstado,
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}/editar`);
}