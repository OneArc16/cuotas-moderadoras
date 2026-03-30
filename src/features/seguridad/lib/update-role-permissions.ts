"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAuditEntry } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requirePermission, RBAC_PERMISSION } from "@/lib/rbac";
import { countOtherActiveSecurityManagerRoles } from "@/features/seguridad/lib/security-role-utils";

const updateRolePermissionsSchema = z.object({
  roleId: z.coerce.number().int().positive("Perfil invalido."),
  permissionCodes: z.array(z.string()).default([]),
});

export type UpdateRolePermissionsResult = {
  ok: boolean;
  message: string;
  roleId?: number;
};

export async function updateRolePermissions(
  input: unknown,
): Promise<UpdateRolePermissionsResult> {
  const actor = await requirePermission(
    RBAC_PERMISSION.SECURITY_MANAGE,
    "No tienes permiso para gestionar permisos de seguridad.",
  );

  const parsed = updateRolePermissionsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Permisos invalidos.",
    };
  }

  const role = await prisma.rol.findUnique({
    where: {
      id: parsed.data.roleId,
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

  const previousPermissionCodes = role.permisos
    .map((item) => item.permiso.codigo)
    .sort((a, b) => a.localeCompare(b));

  const uniquePermissionCodes = Array.from(
    new Set(parsed.data.permissionCodes.filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const permissions = await prisma.permiso.findMany({
    where: {
      codigo: {
        in: uniquePermissionCodes,
      },
    },
    select: {
      id: true,
      codigo: true,
    },
  });

  if (permissions.length !== uniquePermissionCodes.length) {
    return {
      ok: false,
      message: "La seleccion de permisos contiene valores invalidos.",
    };
  }

  const nextHasSecurityManage = uniquePermissionCodes.includes(
    RBAC_PERMISSION.SECURITY_MANAGE,
  );

  if (role.estado === "ACTIVO" && !nextHasSecurityManage) {
    const otherSecurityManagers = await countOtherActiveSecurityManagerRoles(
      role.id,
    );

    if (otherSecurityManagers === 0) {
      return {
        ok: false,
        message:
          "Debe quedar al menos un perfil activo con permiso para administrar seguridad.",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolPermiso.deleteMany({
      where: {
        rolId: role.id,
      },
    });

    if (permissions.length > 0) {
      await tx.rolPermiso.createMany({
        data: permissions.map((permission) => ({
          rolId: role.id,
          permisoId: permission.id,
        })),
      });
    }

    await createAuditEntry(tx, {
      usuarioId: actor.id,
      accion: "SEGURIDAD_ACTUALIZAR_PERMISOS",
      entidad: "Rol",
      entidadId: role.id,
      detalle: `Se actualizaron los permisos del perfil ${role.nombre}.`,
      valorAnteriorJson: {
        permissionCodes: previousPermissionCodes,
      },
      valorNuevoJson: {
        permissionCodes: uniquePermissionCodes,
      },
    });
  });

  revalidatePath("/seguridad");
  revalidatePath("/");
  revalidatePath("/caja");
  revalidatePath("/admisiones");
  revalidatePath("/colaboradores");

  return {
    ok: true,
    message: "Permisos actualizados correctamente.",
    roleId: role.id,
  };
}
