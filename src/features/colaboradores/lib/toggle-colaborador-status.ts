"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";

import {
  buildColaboradorAuditSnapshot,
  getColaboradorDisplayName,
} from "./colaborador-audit";

const toggleColaboradorStatusSchema = z.object({
  id: z.coerce.number().int().positive("Colaborador invalido."),
});

export async function toggleColaboradorStatus(formData: FormData) {
  const actor = await requirePermission(
    RBAC_PERMISSION.COLLABORATOR_MANAGE,
    "No tienes permiso para gestionar colaboradores.",
  );

  const parsed = toggleColaboradorStatusSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    throw new Error("Colaborador invalido.");
  }

  const { id } = parsed.data;
  const colaborador = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      authUserId: true,
      tipoDocumento: true,
      numeroDocumento: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      telefono: true,
      email: true,
      username: true,
      estado: true,
      rolId: true,
      rol: {
        select: {
          nombre: true,
        },
      },
    },
  });

  if (!colaborador) {
    throw new Error("El colaborador no existe.");
  }

  const nuevoEstado = colaborador.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
  const nombreCompleto = getColaboradorDisplayName(colaborador);

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id },
      data: {
        estado: nuevoEstado,
      },
    });

    await createAuditEntry(tx, {
      usuarioId: actor.id,
      accion: "COLABORADORES_CAMBIAR_ESTADO",
      entidad: "Colaborador",
      entidadId: id,
      detalle: `Se cambio el estado del colaborador ${nombreCompleto} a ${nuevoEstado}.`,
      valorAnteriorJson: buildColaboradorAuditSnapshot({
        ...colaborador,
        rolNombre: colaborador.rol.nombre,
      }),
      valorNuevoJson: buildColaboradorAuditSnapshot({
        ...colaborador,
        estado: nuevoEstado,
        rolNombre: colaborador.rol.nombre,
      }),
    });
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}/editar`);
}