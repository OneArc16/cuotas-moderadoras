"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";
import { normalizeRoleName } from "@/features/seguridad/lib/security-role-utils";

const createRoleSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre del perfil es obligatorio."),
  descripcion: z
    .string()
    .trim()
    .max(250, "La descripcion es demasiado larga.")
    .optional()
    .or(z.literal("")),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});

export type CreateRoleResult = {
  ok: boolean;
  message: string;
  roleId?: number;
};

export async function createRole(input: unknown): Promise<CreateRoleResult> {
  const actor = await requirePermission(
    RBAC_PERMISSION.SECURITY_MANAGE,
    "No tienes permiso para gestionar perfiles de seguridad.",
  );

  const parsed = createRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos de perfil invalidos.",
    };
  }

  const nombre = normalizeRoleName(parsed.data.nombre);
  const descripcion = parsed.data.descripcion?.trim() || null;

  const roleExists = await prisma.rol.findUnique({
    where: {
      nombre,
    },
    select: {
      id: true,
    },
  });

  if (roleExists) {
    return {
      ok: false,
      message: "Ya existe un perfil con ese nombre.",
    };
  }

  const role = await prisma.$transaction(async (tx) => {
    const createdRole = await tx.rol.create({
      data: {
        nombre,
        descripcion,
        estado: parsed.data.estado,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
      },
    });

    await createAuditEntry(tx, {
      usuarioId: actor.id,
      accion: "SEGURIDAD_CREAR_PERFIL",
      entidad: "Rol",
      entidadId: createdRole.id,
      detalle: `Se creo el perfil ${createdRole.nombre}.`,
      valorNuevoJson: createdRole,
    });

    return createdRole;
  });

  revalidatePath("/seguridad");
  revalidatePath("/colaboradores");
  revalidatePath("/colaboradores/nuevo");

  return {
    ok: true,
    message: "Perfil creado correctamente.",
    roleId: role.id,
  };
}
