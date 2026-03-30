import { prisma } from "@/lib/prisma";
import { RBAC_PERMISSION, RBAC_ROLE_CATALOG } from "@/lib/rbac/definitions";

export const SYSTEM_ROLE_NAMES = new Set(
  RBAC_ROLE_CATALOG.map((role) => role.nombre),
);

export function normalizeRoleName(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

type RolePermissionSource = {
  permisos?: Array<{
    permiso?: {
      codigo: string;
    } | null;
  }>;
} | null | undefined;

export function roleHasSecurityManagePermission(role: RolePermissionSource) {
  return (
    role?.permisos?.some(
      (item) => item.permiso?.codigo === RBAC_PERMISSION.SECURITY_MANAGE,
    ) ?? false
  );
}

export async function countOtherActiveSecurityManagerRoles(roleId: number) {
  return prisma.rol.count({
    where: {
      id: {
        not: roleId,
      },
      estado: "ACTIVO",
      permisos: {
        some: {
          permiso: {
            codigo: RBAC_PERMISSION.SECURITY_MANAGE,
          },
        },
      },
    },
  });
}

export async function countActiveSecurityManagersOutsideRole(roleId: number) {
  return prisma.usuario.count({
    where: {
      estado: "ACTIVO",
      rolId: {
        not: roleId,
      },
      rol: {
        is: {
          estado: "ACTIVO",
          permisos: {
            some: {
              permiso: {
                codigo: RBAC_PERMISSION.SECURITY_MANAGE,
              },
            },
          },
        },
      },
    },
  });
}

export async function countActiveSecurityManagersOutsideUser(userId: number) {
  return prisma.usuario.count({
    where: {
      id: {
        not: userId,
      },
      estado: "ACTIVO",
      rol: {
        is: {
          estado: "ACTIVO",
          permisos: {
            some: {
              permiso: {
                codigo: RBAC_PERMISSION.SECURITY_MANAGE,
              },
            },
          },
        },
      },
    },
  });
}