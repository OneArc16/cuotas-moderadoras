type ColaboradorAuditSnapshotInput = {
  id?: number | null;
  authUserId?: string | null;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  telefono?: string | null;
  email?: string | null;
  username: string;
  estado: string;
  rolId: number;
  rolNombre?: string | null;
};

export function getColaboradorDisplayName(input: {
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
}) {
  return [
    input.primerNombre,
    input.segundoNombre ?? null,
    input.primerApellido,
    input.segundoApellido ?? null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildColaboradorAuditSnapshot(
  input: ColaboradorAuditSnapshotInput,
) {
  return {
    id: input.id ?? null,
    authUserId: input.authUserId ?? null,
    tipoDocumento: input.tipoDocumento,
    numeroDocumento: input.numeroDocumento,
    nombreCompleto: getColaboradorDisplayName(input),
    telefono: input.telefono ?? null,
    email: input.email ?? null,
    username: input.username,
    estado: input.estado,
    rolId: input.rolId,
    rolNombre: input.rolNombre ?? null,
  };
}