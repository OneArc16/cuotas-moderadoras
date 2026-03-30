type AuditClient = {
  auditoria: {
    create: (args: {
      data: {
        usuarioId: number;
        accion: string;
        entidad: string;
        entidadId: number;
        detalle?: string | null;
        valorAnteriorJson?: unknown;
        valorNuevoJson?: unknown;
      };
    }) => Promise<unknown>;
  };
};

type AuditEntryInput = {
  usuarioId: number;
  accion: string;
  entidad: string;
  entidadId: number;
  detalle?: string | null;
  valorAnteriorJson?: unknown;
  valorNuevoJson?: unknown;
};

function sanitizeAuditPayload(value: unknown) {
  if (value == null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
}

export async function createAuditEntry(
  db: AuditClient,
  input: AuditEntryInput,
) {
  await db.auditoria.create({
    data: {
      usuarioId: input.usuarioId,
      accion: input.accion,
      entidad: input.entidad,
      entidadId: input.entidadId,
      detalle: input.detalle ?? null,
      valorAnteriorJson: sanitizeAuditPayload(input.valorAnteriorJson),
      valorNuevoJson: sanitizeAuditPayload(input.valorNuevoJson),
    },
  });
}
