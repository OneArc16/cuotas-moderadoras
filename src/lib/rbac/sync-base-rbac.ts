import {
  RBAC_PERMISSION_CATALOG,
  RBAC_ROLE_CATALOG,
  RBAC_ROLE_PERMISSION_MATRIX,
} from "@/lib/rbac/definitions";

type RoleRow = {
  id: number;
  nombre: string;
};

type PermissionRow = {
  id: number;
  codigo: string;
};

type RbacSyncClient = {
  rol: {
    upsert(args: any): Promise<unknown>;
    findMany(args: any): Promise<RoleRow[]>;
  };
  permiso: {
    upsert(args: any): Promise<unknown>;
    findMany(args: any): Promise<PermissionRow[]>;
    count(args?: any): Promise<number>;
  };
  rolPermiso: {
    findMany(args: any): Promise<Array<{ id: number; permiso: { codigo: string } }>>;
    deleteMany(args: any): Promise<unknown>;
    upsert(args: any): Promise<unknown>;
    count(args?: any): Promise<number>;
  };
};

export async function syncBaseRoles(
  db: RbacSyncClient,
  options?: {
    reactivateExistingRoles?: boolean;
  },
) {
  const reactivateExistingRoles = options?.reactivateExistingRoles ?? false;

  for (const role of RBAC_ROLE_CATALOG) {
    await db.rol.upsert({
      where: {
        nombre: role.nombre,
      },
      update: {
        descripcion: role.descripcion,
        ...(reactivateExistingRoles ? { estado: "ACTIVO" } : {}),
      },
      create: {
        ...role,
        estado: "ACTIVO",
      },
    });
  }

  const roles = await db.rol.findMany({
    where: {
      nombre: {
        in: RBAC_ROLE_CATALOG.map((role) => role.nombre),
      },
    },
    select: {
      id: true,
      nombre: true,
    },
  });

  return new Map(roles.map((role) => [role.nombre, role]));
}

export async function syncBasePermissions(db: RbacSyncClient) {
  for (const permission of RBAC_PERMISSION_CATALOG) {
    await db.permiso.upsert({
      where: {
        codigo: permission.codigo,
      },
      update: {
        nombre: permission.nombre,
        moduloSistema: permission.moduloSistema,
        descripcion: permission.descripcion,
      },
      create: permission,
    });
  }

  const permissions = await db.permiso.findMany({
    where: {
      codigo: {
        in: RBAC_PERMISSION_CATALOG.map((permission) => permission.codigo),
      },
    },
    select: {
      id: true,
      codigo: true,
    },
  });

  return new Map(permissions.map((permission) => [permission.codigo, permission]));
}

export async function syncBaseRolePermissions(
  db: RbacSyncClient,
  rolesByName: Map<string, RoleRow>,
  permissionsByCode: Map<string, PermissionRow>,
  options?: {
    resetToMatrix?: boolean;
  },
) {
  const resetToMatrix = options?.resetToMatrix ?? false;

  for (const role of RBAC_ROLE_CATALOG) {
    const persistedRole = rolesByName.get(role.nombre);

    if (!persistedRole) {
      throw new Error(`No se encontro el rol ${role.nombre}`);
    }

    const desiredCodes = new Set(RBAC_ROLE_PERMISSION_MATRIX[role.nombre]);
    const existingAssignments = await db.rolPermiso.findMany({
      where: {
        rolId: persistedRole.id,
      },
      select: {
        id: true,
        permiso: {
          select: {
            codigo: true,
          },
        },
      },
    });

    if (resetToMatrix) {
      const staleAssignmentIds = existingAssignments
        .filter((assignment) => !desiredCodes.has(assignment.permiso.codigo))
        .map((assignment) => assignment.id);

      if (staleAssignmentIds.length > 0) {
        await db.rolPermiso.deleteMany({
          where: {
            id: {
              in: staleAssignmentIds,
            },
          },
        });
      }
    }

    for (const code of desiredCodes) {
      const persistedPermission = permissionsByCode.get(code);

      if (!persistedPermission) {
        throw new Error(`No se encontro el permiso ${code}`);
      }

      await db.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId: persistedRole.id,
            permisoId: persistedPermission.id,
          },
        },
        update: {},
        create: {
          rolId: persistedRole.id,
          permisoId: persistedPermission.id,
        },
      });
    }
  }
}

export async function ensureBaseRbacInitialized(db: RbacSyncClient) {
  const rolesByName = await syncBaseRoles(db);
  const permissionsByCode = await syncBasePermissions(db);
  const assignmentCount = await db.rolPermiso.count();

  if (assignmentCount === 0) {
    await syncBaseRolePermissions(db, rolesByName, permissionsByCode, {
      resetToMatrix: false,
    });
  }

  return {
    rolesByName,
    permissionsByCode,
  };
}