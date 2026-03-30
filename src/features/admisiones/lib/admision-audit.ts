type AdmisionAuditSnapshotInput = {
  id: number;
  estado: string;
  pacienteNombreSnapshot: string;
  pacienteDocumentoSnapshot: string;
  servicioNombreSnapshot: string;
  contratoNombreSnapshot: string;
  categoriaAfiliacionNombreSnapshot: string | null;
  tipoCobroSnapshot: string;
  cajaId: number;
  jornadaCajaId: number;
  sesionOperativaId: number;
  valorFinalCobrado: string | number | { toString(): string };
  metodoPagoSnapshot: string | null;
  referenciaPagoSnapshot: string | null;
  observacion: string | null;
  motivoEstado?: string | null;
  motivoAnulacion?: string | null;
  anuladaAt?: Date | string | null;
  anuladaPorUsuarioId?: number | null;
  anuladaPorUsuarioNombre?: string | null;
  movimientoReversoId?: number | null;
};

function normalizeMoneyValue(
  value: string | number | { toString(): string },
): string {
  return typeof value === "number" ? value.toFixed(2) : value.toString();
}

function normalizeDateValue(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

export function buildAdmisionAuditSnapshot(
  input: AdmisionAuditSnapshotInput,
) {
  return {
    id: input.id,
    estado: input.estado,
    pacienteNombre: input.pacienteNombreSnapshot,
    pacienteDocumento: input.pacienteDocumentoSnapshot,
    servicio: input.servicioNombreSnapshot,
    contrato: input.contratoNombreSnapshot,
    categoria: input.categoriaAfiliacionNombreSnapshot,
    tipoCobro: input.tipoCobroSnapshot,
    cajaId: input.cajaId,
    jornadaCajaId: input.jornadaCajaId,
    sesionOperativaId: input.sesionOperativaId,
    valorFinalCobrado: normalizeMoneyValue(input.valorFinalCobrado),
    metodoPago: input.metodoPagoSnapshot,
    referenciaPago: input.referenciaPagoSnapshot,
    observacion: input.observacion,
    motivoEstado: input.motivoEstado ?? null,
    motivoAnulacion: input.motivoAnulacion ?? null,
    anuladaAt: normalizeDateValue(input.anuladaAt),
    anuladaPorUsuarioId: input.anuladaPorUsuarioId ?? null,
    anuladaPorUsuarioNombre: input.anuladaPorUsuarioNombre ?? null,
    movimientoReversoId: input.movimientoReversoId ?? null,
  };
}