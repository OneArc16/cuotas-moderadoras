"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";
import {
  countActiveSecurityManagersOutsideRole,
  normalizeRoleName,
  roleHasSecurityManagePermission,
  SYSTEM_ROLE_NAMES,
} from "@/features/seguridad/lib/security-role-utils";

const updateRoleSchema = z.object({
  id: z.coerce.number().int().positive("Perfil invalido."),
  nombre: z.string().trim().min(3, "El nombre del perfil es obligatorio."),
  descripcion: z
    .string()
    .trim()
    .max(250, "La descripcion es demasiado larga.")
    .optional()
    .or(z.literal("")),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});

export type UpdateRoleResult = {
  ok: boolean;
  message: string;
  roleId?: number;
};

export async function updateRole(input: unknown): Promise<UpdateRoleResult> {
  const actor = await requirePermission(
    RBAC_PERMISSION.SECURITY_MANAGE,
    "No tienes permiso para gestionar perfiles de seguridad.",
  );

  const parsed = updateRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos de perfil invalidos.",
    };
  }

  const role = await prisma.rol.findUnique({
    where: {
      id: parsed.data.id,
    },
    include: {
      permisos: {
        include: {
          permiso: true,
        },
      },
    },
  });

  if (!role) {
    return {
      ok: false,
      message: "El perfil seleccionado no existe.",
    };
  }

  const nombre = normalizeRoleName(parsed.data.nombre);
  const descripcion = parsed.data.descripcion?.trim() || null;

  if (SYSTEM_ROLE_NAMES.has(role.nombre) && nombre !== role.nombre) {
    return {
      ok: false,
      message: "Los perfiles base del sistema no pueden cambiar de nombre.",
    };
  }

  const duplicateRole = await prisma.rol.findFirst({
    where: {
      nombre,
      id: {
        not: role.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateRole) {
    return {
      ok: false,
      message: "Ya existe otro perfil con ese nombre.",
    };
  }

  const hasSecurityManage = roleHasSecurityManagePermission(role);

  if (
    role.estado === "ACTIVO" &&
    parsed.data.estado === "INACTIVO" &&
    hasSecurityManage
  ) {
    const otherSecurityManagers = await countActiveSecurityManagersOutsideRole(
      role.id,
    );

    if (otherSecurityManagers === 0) {
      return {
        ok: false,
        message:
          actor.rolId === role.id
            ? "No puedes inactivar este perfil porque dejarias tu propio acceso a seguridad sin respaldo activo."
            : "Debe quedar al menos un colaborador activo con permiso para administrar seguridad.",
      };
    }
  }

  const previousSnapshot = {
    nombre: role.nombre,
    descripcion: role.descripcion,
    estado: role.estado,
  };

  const updatedRole = await prisma.$transaction(async (tx) => {
    const nextRole = await tx.rol.update({
      where: {
        id: role.id,
      },
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
      accion: "SEGURIDAD_ACTUALIZAR_PERFIL",
      entidad: "Rol",
      entidadId: nextRole.id,
      detalle: `Se actualizo el perfil ${nextRole.nombre}.`,
      valorAnteriorJson: previousSnapshot,
      valorNuevoJson: nextRole,
    });

    return nextRole;
  });

  revalidatePath("/seguridad");
  revalidatePath("/colaboradores");
  revalidatePath("/colaboradores/nuevo");

  return {
    ok: true,
    message: "Perfil actualizado correctamente.",
    roleId: updatedRole.id,
  };
}