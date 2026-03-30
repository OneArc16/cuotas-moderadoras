import { getCurrentUsuario } from "@/lib/current-user";
import {
  RBAC_ALL_PERMISSION_CODES,
  RBAC_PERMISSION,
  RBAC_ROLE_PERMISSION_MATRIX,
  type PermissionCode,
  type RoleName,
} from "@/lib/rbac/definitions";

type PermissionSource = {
  rol?: {
    nombre?: string | null;
    estado?: string | null;
    permisos?: Array<{
      permiso?: {
        codigo: string;
      } | null;
    }>;
  } | null;
} | null | undefined;

const knownPermissionCodes = new Set<string>(RBAC_ALL_PERMISSION_CODES);

function normalizeRoleName(value: string | null | undefined): RoleName | null {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (normalized in RBAC_ROLE_PERMISSION_MATRIX) {
    return normalized as RoleName;
  }

  return null;
}

function isRoleActive(value: string | null | undefined) {
  if (value == null) {
    return true;
  }

  return value === "ACTIVO";
}

export function getFallbackPermissionCodes(
  roleName: string | null | undefined,
): PermissionCode[] {
  const normalizedRoleName = normalizeRoleName(roleName);

  if (!normalizedRoleName) {
    return [];
  }

  return RBAC_ROLE_PERMISSION_MATRIX[normalizedRoleName];
}

export function resolvePermissionCodes(source: PermissionSource): string[] {
  if (source?.rol && !isRoleActive(source.rol.estado)) {
    return [];
  }

  const explicitPermissionCodes =
    source?.rol?.permisos
      ?.map((item) => item.permiso?.codigo)
      .filter(
        (code): code is string => Boolean(code) && knownPermissionCodes.has(code),
      ) ?? [];

  if (explicitPermissionCodes.length > 0) {
    return [...new Set(explicitPermissionCodes)];
  }

  return getFallbackPermissionCodes(source?.rol?.nombre);
}

export function hasPermission(
  source: PermissionSource,
  permission: PermissionCode,
): boolean {
  return resolvePermissionCodes(source).includes(permission);
}

export function hasAnyPermission(
  source: PermissionSource,
  permissions: PermissionCode[],
): boolean {
  const resolvedPermissions = new Set(resolvePermissionCodes(source));
  return permissions.some((permission) => resolvedPermissions.has(permission));
}

export async function requirePermission(
  permission: PermissionCode,
  errorMessage = "No tienes permiso para realizar esta accion.",
) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    throw new Error("No se pudo validar la sesion actual.");
  }

  if (!hasPermission(usuario, permission)) {
    throw new Error(errorMessage);
  }

  return usuario;
}

export { RBAC_PERMISSION };
export type { PermissionCode, RoleName };
