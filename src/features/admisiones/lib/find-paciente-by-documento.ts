import { prisma } from "@/lib/prisma";

export const TIPO_DOCUMENTO_VALUES = [
  "CC",
  "CE",
  "TI",
  "RC",
  "PASAPORTE",
  "NIT",
  "OTRO",
] as const;

export type TipoDocumentoValue = (typeof TIPO_DOCUMENTO_VALUES)[number];

type FindPacienteByDocumentoInput = {
  tipoDocumento: TipoDocumentoValue;
  numeroDocumento: string;
};

export type PacienteLookupResult = {
  id: number;
  tipoDocumento: TipoDocumentoValue;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string;
  telefono: string | null;
  estado: string;
};

function buildFullName(paciente: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [
    paciente.primerNombre,
    paciente.segundoNombre,
    paciente.primerApellido,
    paciente.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function findPacienteByDocumento({
  tipoDocumento,
  numeroDocumento,
}: FindPacienteByDocumentoInput): Promise<PacienteLookupResult | null> {
  const normalizedNumeroDocumento = numeroDocumento.replace(/\s+/g, "").trim();

  if (!normalizedNumeroDocumento) {
    return null;
  }

  const paciente = await prisma.paciente.findFirst({
    where: {
      tipoDocumento,
      numeroDocumento: normalizedNumeroDocumento,
    },
    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      telefono: true,
      estado: true,
    },
  });

  if (!paciente) {
    return null;
  }

  return {
    id: paciente.id,
    tipoDocumento: paciente.tipoDocumento as TipoDocumentoValue,
    numeroDocumento: paciente.numeroDocumento,
    primerNombre: paciente.primerNombre,
    segundoNombre: paciente.segundoNombre,
    primerApellido: paciente.primerApellido,
    segundoApellido: paciente.segundoApellido,
    nombreCompleto: buildFullName(paciente),
    telefono: paciente.telefono,
    estado: paciente.estado,
  };
}