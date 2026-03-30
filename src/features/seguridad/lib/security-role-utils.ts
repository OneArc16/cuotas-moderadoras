import { prisma } from "@/lib/prisma";
import { RBAC_PERMISSION, RBAC_ROLE_CATALOG } from "@/lib/rbac/definitions";

export const SYSTEM_ROLE_NAMES = new Set(
  RBAC_ROLE_CATALOG.map((role) => role.nombre),
);

export function normalizeRoleName(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
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
