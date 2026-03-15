import { getCurrentUsuario } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type AdmisionPageContext = {
  usuario: {
    id: number;
    nombreCompleto: string;
    username: string;
  };
  sesionOperativa: null | {
    id: number;
    fechaOperativa: Date;
    moduloAtencion: {
      id: number;
      nombre: string;
      codigo: string;
    };
    piso: {
      id: number;
      nombre: string;
    };
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
  }>;
  servicios: Array<{
    id: number;
    codigo: string | null;
    nombre: string;
  }>;
  tarifaCombos: Array<{
    contratoId: number;
    servicioId: number;
    categoriaAfiliacionId: number | null;
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
};

export async function getAdmisionPageContext(): Promise<AdmisionPageContext> {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    throw new Error("No se pudo resolver el usuario autenticado.");
  }

  const now = new Date();

  const [sesionOperativa, tarifasActivas] = await Promise.all([
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
        moduloAtencion: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        piso: {
          select: {
            id: true,
            nombre: true,
          },
        },
        caja: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    }),
    prisma.tarifaServicio.findMany({
      where: {
        estado: "ACTIVO",
        fechaInicioVigencia: {
          lte: now,
        },
        AND: [
          {
            OR: [
              { fechaFinVigencia: null },
              {
                fechaFinVigencia: {
                  gte: now,
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
        contrato: {
          is: {
            estado: "ACTIVO",
          },
        },
        servicio: {
          is: {
            estado: "ACTIVO",
          },
        },
      },
      select: {
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
        servicio: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
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

  const contratosMap = new Map<number, ContratoAccumulator>();
  const serviciosMap = new Map<
    number,
    {
      id: number;
      codigo: string | null;
      nombre: string;
    }
  >();

  const tarifaCombosMap = new Map<
    string,
    {
      contratoId: number;
      servicioId: number;
      categoriaAfiliacionId: number | null;
    }
  >();

  for (const tarifa of tarifasActivas) {
    serviciosMap.set(tarifa.servicio.id, {
      id: tarifa.servicio.id,
      codigo: tarifa.servicio.codigo,
      nombre: tarifa.servicio.nombre,
    });

    const comboKey = `${tarifa.contratoId}-${tarifa.servicioId}-${tarifa.categoriaAfiliacionId ?? "null"}`;

    if (!tarifaCombosMap.has(comboKey)) {
      tarifaCombosMap.set(comboKey, {
        contratoId: tarifa.contratoId,
        servicioId: tarifa.servicioId,
        categoriaAfiliacionId: tarifa.categoriaAfiliacionId,
      });
    }

    const existingContrato = contratosMap.get(tarifa.contrato.id);

    if (existingContrato) {
      if (tarifa.categoriaAfiliacion) {
        existingContrato.categoriasMap.set(tarifa.categoriaAfiliacion.id, {
          id: tarifa.categoriaAfiliacion.id,
          codigo: tarifa.categoriaAfiliacion.codigo,
          nombre: tarifa.categoriaAfiliacion.nombre,
        });
      }
    } else {
      const categoriasMap = new Map<
        number,
        {
          id: number;
          codigo: string;
          nombre: string;
        }
      >();

      if (tarifa.categoriaAfiliacion) {
        categoriasMap.set(tarifa.categoriaAfiliacion.id, {
          id: tarifa.categoriaAfiliacion.id,
          codigo: tarifa.categoriaAfiliacion.codigo,
          nombre: tarifa.categoriaAfiliacion.nombre,
        });
      }

      contratosMap.set(tarifa.contrato.id, {
        id: tarifa.contrato.id,
        nombre: tarifa.contrato.nombre,
        tipo: tarifa.contrato.tipo,
        categoriasMap,
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
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const servicios = Array.from(serviciosMap.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  return {
    usuario: {
      id: usuario.id,
      username: usuario.username,
      nombreCompleto: buildFullName(usuario),
    },
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
    tarifaCombos: Array.from(tarifaCombosMap.values()),
  };
}