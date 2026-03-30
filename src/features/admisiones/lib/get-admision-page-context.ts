import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  hasAnyPermission,
  hasPermission,
  RBAC_PERMISSION,
} from "@/lib/rbac";

type AdmisionPageContext = {
  usuario: {
    id: number;
    nombreCompleto: string;
    username: string;
  };
  canCreateAdmision: boolean;
  canCancelAdmision: boolean;
  sesionOperativa: null | {
    id: number;
    fechaOperativa: Date;
    caja: {
      id: number;
      nombre: string;
    };
  };
  jornadaCaja: null | {
    id: number;
    fechaOperativa: Date;
    estado: "ABIERTA" | "REABIERTA" | "CERRADA";
    baseInicial: string;
    totalCobros: string;
    totalDevoluciones: string;
    saldoEsperado: string;
  };
  contratos: Array<{
    id: number;
    nombre: string;
    tipo: string;
    categorias: Array<{
      id: number;
      codigo: string;
      nombre: string;
    }>;
    categoriaIds: number[];
    servicioIds: number[];
  }>;
  servicios: Array<{
    id: number;
    codigo: string | null;
    nombre: string;
  }>;
  recentAdmissions: Array<{
    id: number;
    fechaHora: string;
    estado: "REGISTRADA" | "ANULADA";
    pacienteNombreSnapshot: string;
    pacienteDocumentoSnapshot: string;
    servicioNombreSnapshot: string;
    contratoNombreSnapshot: string;
    categoriaAfiliacionNombreSnapshot: string | null;
    tipoCobroSnapshot: "CUOTA_MODERADORA" | "PARTICULAR";
    valorFinalCobrado: string;
    metodoPagoSnapshot: string | null;
    referenciaPagoSnapshot: string | null;
    observacion: string | null;
    motivoAnulacion: string | null;
    anuladaAt: string | null;
    anuladaPorUsuarioNombre: string | null;
    anuladaPorUsername: string | null;
  }>;
};

function buildFullName(usuario: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [
    usuario.primerNombre,
    usuario.segundoNombre,
    usuario.primerApellido,
    usuario.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ");
}

type ContratoAccumulator = {
  id: number;
  nombre: string;
  tipo: string;
  categoriasMap: Map<
    number,
    {
      id: number;
      codigo: string;
      nombre: string;
    }
  >;
  categoriaIds: Set<number>;
  servicioIds: Set<number>;
};

export async function getAdmisionPageContext(): Promise<AdmisionPageContext> {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    throw new Error("No se pudo validar la sesion actual.");
  }

  const canAccessAdmisiones = hasAnyPermission(usuario, [
    RBAC_PERMISSION.ADMISION_VIEW,
    RBAC_PERMISSION.ADMISION_CREATE,
    RBAC_PERMISSION.ADMISION_CANCEL,
  ]);

  if (!canAccessAdmisiones) {
    throw new Error("No tienes permiso para acceder al modulo de admisiones.");
  }

  const canCreateAdmision = hasPermission(usuario, RBAC_PERMISSION.ADMISION_CREATE);
  const canCancelAdmision = hasPermission(usuario, RBAC_PERMISSION.ADMISION_CANCEL);
  const now = new Date();

  const [sesionOperativa, servicios, tarifasActivas] = await Promise.all([
    prisma.sesionOperativa.findFirst({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fechaOperativa: true,
        caja: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    }),
    prisma.servicio.findMany({
      where: {
        estado: "ACTIVO",
      },
      orderBy: {
        nombre: "asc",
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
      },
    }),
    prisma.tarifaServicio.findMany({
      where: {
        estado: "ACTIVO",
        fechaInicioVigencia: {
          lte: now,
        },
        OR: [
          { fechaFinVigencia: null },
          {
            fechaFinVigencia: {
              gte: now,
            },
          },
        ],
        contrato: {
          is: {
            estado: "ACTIVO",
          },
        },
        AND: [
          {
            OR: [
              { servicioId: null },
              {
                servicio: {
                  is: {
                    estado: "ACTIVO",
                  },
                },
              },
            ],
          },
          {
            OR: [
              { categoriaAfiliacionId: null },
              {
                categoriaAfiliacion: {
                  is: {
                    estado: "ACTIVO",
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        tipoCobro: true,
        contratoId: true,
        servicioId: true,
        categoriaAfiliacionId: true,
        contrato: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
        categoriaAfiliacion: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    }),
  ]);

  const jornadaCaja = sesionOperativa
    ? await prisma.jornadaCaja.findFirst({
        where: {
          cajaId: sesionOperativa.caja.id,
          estado: {
            in: ["ABIERTA", "REABIERTA"],
          },
        },
        orderBy: [{ fechaOperativa: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          fechaOperativa: true,
          estado: true,
          baseInicial: true,
          totalCobros: true,
          totalDevoluciones: true,
          saldoEsperado: true,
        },
      })
    : null;

  const recentAdmissions = jornadaCaja
    ? await prisma.admision.findMany({
        where: {
          jornadaCajaId: jornadaCaja.id,
        },
        orderBy: [{ fechaHora: "desc" }, { id: "desc" }],
        take: 12,
        select: {
          id: true,
          fechaHora: true,
          estado: true,
          pacienteNombreSnapshot: true,
          pacienteDocumentoSnapshot: true,
          servicioNombreSnapshot: true,
          contratoNombreSnapshot: true,
          categoriaAfiliacionNombreSnapshot: true,
          tipoCobroSnapshot: true,
          valorFinalCobrado: true,
          metodoPagoSnapshot: true,
          referenciaPagoSnapshot: true,
          observacion: true,
          motivoAnulacion: true,
          anuladaAt: true,
          anuladaPorUsuario: {
            select: {
              primerNombre: true,
              segundoNombre: true,
              primerApellido: true,
              segundoApellido: true,
              username: true,
            },
          },
        },
      })
    : [];

  const contratosMap = new Map<number, ContratoAccumulator>();

  for (const tarifa of tarifasActivas) {
    const contrato =
      contratosMap.get(tarifa.contrato.id) ??
      (() => {
        const nextContrato: ContratoAccumulator = {
          id: tarifa.contrato.id,
          nombre: tarifa.contrato.nombre,
          tipo: tarifa.contrato.tipo,
          categoriasMap: new Map(),
          categoriaIds: new Set(),
          servicioIds: new Set(),
        };

        contratosMap.set(tarifa.contrato.id, nextContrato);
        return nextContrato;
      })();

    if (tarifa.tipoCobro === "PARTICULAR") {
      if (tarifa.servicioId) {
        contrato.servicioIds.add(tarifa.servicioId);
      }

      continue;
    }

    if (
      tarifa.tipoCobro === "CUOTA_MODERADORA" &&
      !tarifa.servicioId &&
      tarifa.categoriaAfiliacion
    ) {
      contrato.categoriaIds.add(tarifa.categoriaAfiliacion.id);
      contrato.categoriasMap.set(tarifa.categoriaAfiliacion.id, {
        id: tarifa.categoriaAfiliacion.id,
        codigo: tarifa.categoriaAfiliacion.codigo,
        nombre: tarifa.categoriaAfiliacion.nombre,
      });
    }
  }

  const contratos = Array.from(contratosMap.values())
    .map((contrato) => ({
      id: contrato.id,
      nombre: contrato.nombre,
      tipo: contrato.tipo,
      categorias: Array.from(contrato.categoriasMap.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      ),
      categoriaIds: Array.from(contrato.categoriaIds.values()).sort((a, b) =>
        a - b,
      ),
      servicioIds: Array.from(contrato.servicioIds.values()).sort((a, b) =>
        a - b,
      ),
    }))
    .filter((contrato) => {
      if (contrato.tipo === "PARTICULAR") {
        return contrato.servicioIds.length > 0;
      }

      return contrato.categoriaIds.length > 0;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return {
    usuario: {
      id: usuario.id,
      username: usuario.username,
      nombreCompleto: buildFullName(usuario),
    },
    canCreateAdmision,
    canCancelAdmision,
    sesionOperativa,
    jornadaCaja: jornadaCaja
      ? {
          id: jornadaCaja.id,
          fechaOperativa: jornadaCaja.fechaOperativa,
          estado: jornadaCaja.estado,
          baseInicial: jornadaCaja.baseInicial.toString(),
          totalCobros: jornadaCaja.totalCobros.toString(),
          totalDevoluciones: jornadaCaja.totalDevoluciones.toString(),
          saldoEsperado: jornadaCaja.saldoEsperado.toString(),
        }
      : null,
    contratos,
    servicios,
    recentAdmissions: recentAdmissions.map((admision) => ({
      id: admision.id,
      fechaHora: admision.fechaHora.toISOString(),
      estado: admision.estado,
      pacienteNombreSnapshot: admision.pacienteNombreSnapshot,
      pacienteDocumentoSnapshot: admision.pacienteDocumentoSnapshot,
      servicioNombreSnapshot: admision.servicioNombreSnapshot,
      contratoNombreSnapshot: admision.contratoNombreSnapshot,
      categoriaAfiliacionNombreSnapshot:
        admision.categoriaAfiliacionNombreSnapshot,
      tipoCobroSnapshot: admision.tipoCobroSnapshot,
      valorFinalCobrado: admision.valorFinalCobrado.toString(),
      metodoPagoSnapshot: admision.metodoPagoSnapshot,
      referenciaPagoSnapshot: admision.referenciaPagoSnapshot,
      observacion: admision.observacion,
      motivoAnulacion: admision.motivoAnulacion,
      anuladaAt: admision.anuladaAt?.toISOString() ?? null,
      anuladaPorUsuarioNombre: admision.anuladaPorUsuario
        ? buildFullName(admision.anuladaPorUsuario)
        : null,
      anuladaPorUsername: admision.anuladaPorUsuario?.username ?? null,
    })),
  };
}