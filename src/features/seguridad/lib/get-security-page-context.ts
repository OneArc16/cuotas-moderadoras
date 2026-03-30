import { prisma } from "@/lib/prisma";
import {
  getSecurityAuditActionLabel,
  getSecurityAuditSummary,
} from "@/features/seguridad/lib/security-audit-utils";
import { RBAC_ROLE_CATALOG } from "@/lib/rbac/definitions";
import { ensureBaseRbacInitialized } from "@/lib/rbac/sync-base-rbac";

const systemRoleNames = new Set(RBAC_ROLE_CATALOG.map((role) => role.nombre));

export type SecurityPageContext = {
  stats: {
    totalRoles: number;
    activeRoles: number;
    customRoles: number;
    totalPermissions: number;
    auditEventsLast7Days: number;
  };
  roles: Array<{
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: "ACTIVO" | "INACTIVO";
    usuariosCount: number;
    permissionCount: number;
    permissionCodes: string[];
    isSystem: boolean;
  }>;
  permissionGroups: Array<{
    moduloSistema: string;
    permisos: Array<{
      id: number;
      codigo: string;
      nombre: string;
      descripcion: string | null;
    }>;
  }>;
  auditEntries: Array<{
    id: number;
    accion: string;
    accionLabel: string;
    detalle: string | null;
    summary: string;
    createdAt: string;
    actorName: string;
    actorUsername: string;
    roleId: number | null;
    roleName: string | null;
  }>;
};

export async function getSecurityPageContext(): Promise<SecurityPageContext> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [roles, permisos, auditEntries, auditEventsLast7Days] = await Promise.all([
    prisma.rol.findMany({
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    }),
    prisma.permiso.findMany({
      orderBy: [{ moduloSistema: "asc" }, { nombre: "asc" }],
    }),
    prisma.auditoria.findMany({
      where: {
        accion: {
          startsWith: "SEGURIDAD_",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 40,
      include: {
        usuario: {
          select: {
            username: true,
            primerNombre: true,
            primerApellido: true,
          },
        },
      },
    }),
    prisma.auditoria.count({
      where: {
        accion: {
          startsWith: "SEGURIDAD_",
        },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
  ]);

  const permissionGroupsMap = new Map<
    string,
    Array<{
      id: number;
      codigo: string;
      nombre: string;
      descripcion: string | null;
    }>
  >();

  for (const permiso of permisos) {
    const currentGroup = permissionGroupsMap.get(permiso.moduloSistema) ?? [];

    currentGroup.push({
      id: permiso.id,
      codigo: permiso.codigo,
      nombre: permiso.nombre,
      descripcion: permiso.descripcion,
    });

    permissionGroupsMap.set(permiso.moduloSistema, currentGroup);
  }

  const permissionGroups = Array.from(permissionGroupsMap.entries()).map(
    ([moduloSistema, permisosDelModulo]) => ({
      moduloSistema,
      permisos: permisosDelModulo,
    }),
  );

  const normalizedRoles = roles
    .map((role) => {
      const permissionCodes = role.permisos
        .map((item) => item.permiso.codigo)
        .sort((a, b) => a.localeCompare(b));

      return {
        id: role.id,
        nombre: role.nombre,
        descripcion: role.descripcion,
        estado: role.estado,
        usuariosCount: role._count.usuarios,
        permissionCount: permissionCodes.length,
        permissionCodes,
        isSystem: systemRoleNames.has(role.nombre),
      };
    })
    .sort((a, b) => {
      if (a.estado !== b.estado) {
        return a.estado === "ACTIVO" ? -1 : 1;
      }

      if (a.isSystem !== b.isSystem) {
        return a.isSystem ? -1 : 1;
      }

      return a.nombre.localeCompare(b.nombre);
    });

  const roleNameById = new Map(
    normalizedRoles.map((role) => [role.id, role.nombre] as const),
  );

  const normalizedAuditEntries = auditEntries.map((entry) => {
    const actorName = [entry.usuario.primerNombre, entry.usuario.primerApellido]
      .filter(Boolean)
      .join(" ")
      .trim();
    const isRoleEntity = entry.entidad === "Rol";

    return {
      id: entry.id,
      accion: entry.accion,
      accionLabel: getSecurityAuditActionLabel(entry.accion),
      detalle: entry.detalle,
      summary: getSecurityAuditSummary(entry),
      createdAt: entry.createdAt.toISOString(),
      actorName: actorName || entry.usuario.username,
      actorUsername: entry.usuario.username,
      roleId: isRoleEntity ? entry.entidadId : null,
      roleName: isRoleEntity ? roleNameById.get(entry.entidadId) ?? null : null,
    };
  });

  return {
    stats: {
      totalRoles: normalizedRoles.length,
      activeRoles: normalizedRoles.filter((role) => role.estado === "ACTIVO")
        .length,
      customRoles: normalizedRoles.filter((role) => !role.isSystem).length,
      totalPermissions: permisos.length,
      auditEventsLast7Days,
    },
    roles: normalizedRoles,
    permissionGroups,
    auditEntries: normalizedAuditEntries,
  };
}