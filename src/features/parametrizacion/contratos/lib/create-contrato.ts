"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type CreateContratoInput = {
  nombre: string;
  tipo: "EPS" | "PARTICULAR" | "OTRO";
};

export async function createContrato(input: CreateContratoInput) {
  const nombre = input.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.contrato.create({
    data: {
      nombre,
      tipo: input.tipo,
    },
  });

  revalidatePath("/parametrizacion/contratos");
}