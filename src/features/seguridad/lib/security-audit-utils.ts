type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getJsonString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getJsonStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function getSecurityAuditActionLabel(action: string) {
  switch (action) {
    case "SEGURIDAD_CREAR_PERFIL":
      return "Perfil creado";
    case "SEGURIDAD_ACTUALIZAR_PERFIL":
      return "Perfil actualizado";
    case "SEGURIDAD_ACTUALIZAR_PERMISOS":
      return "Permisos actualizados";
    default:
      return "Cambio de seguridad";
  }
}

export function getSecurityAuditSummary(entry: {
  accion: string;
  detalle: string | null;
  valorAnteriorJson: unknown;
  valorNuevoJson: unknown;
}) {
  const previousValue = isJsonRecord(entry.valorAnteriorJson)
    ? entry.valorAnteriorJson
    : null;
  const nextValue = isJsonRecord(entry.valorNuevoJson)
    ? entry.valorNuevoJson
    : null;

  switch (entry.accion) {
    case "SEGURIDAD_CREAR_PERFIL": {
      const estado = getJsonString(nextValue?.estado);
      return estado
        ? `Perfil creado en estado ${estado}.`
        : entry.detalle ?? "Se registro un nuevo perfil operativo.";
    }

    case "SEGURIDAD_ACTUALIZAR_PERFIL": {
      const changedFields: string[] = [];

      if (getJsonString(previousValue?.nombre) !== getJsonString(nextValue?.nombre)) {
        changedFields.push("nombre");
      }

      if (
        (getJsonString(previousValue?.descripcion) ?? null) !==
        (getJsonString(nextValue?.descripcion) ?? null)
      ) {
        changedFields.push("descripcion");
      }

      if (getJsonString(previousValue?.estado) !== getJsonString(nextValue?.estado)) {
        changedFields.push("estado");
      }

      return changedFields.length > 0
        ? `Campos modificados: ${changedFields.join(", ")}.`
        : entry.detalle ?? "Se guardaron cambios sobre el perfil.";
    }

    case "SEGURIDAD_ACTUALIZAR_PERMISOS": {
      const previousPermissionCodes = getJsonStringArray(
        previousValue?.permissionCodes,
      );
      const nextPermissionCodes = getJsonStringArray(nextValue?.permissionCodes);
      const addedPermissions = nextPermissionCodes.filter(
        (code) => !previousPermissionCodes.includes(code),
      ).length;
      const removedPermissions = previousPermissionCodes.filter(
        (code) => !nextPermissionCodes.includes(code),
      ).length;

      if (addedPermissions > 0 && removedPermissions > 0) {
        return `Se agregaron ${addedPermissions} permisos y se retiraron ${removedPermissions}.`;
      }

      if (addedPermissions > 0) {
        return `Se agregaron ${addedPermissions} permisos al perfil.`;
      }

      if (removedPermissions > 0) {
        return `Se retiraron ${removedPermissions} permisos del perfil.`;
      }

      return "La matriz de permisos se guardo sin cambios efectivos.";
    }

    default:
      return entry.detalle ?? "Evento registrado en auditoria.";
  }
}