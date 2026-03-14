import { prisma } from "@/lib/prisma";

export async function getTarifas() {
  const tarifas = await prisma.tarifaServicio.findMany({
    include: {
      servicio: true,
      contrato: true,
      categoriaAfiliacion: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return tarifas.map((tarifa) => ({
    id: tarifa.id,
    servicioId: tarifa.servicioId,
    contratoId: tarifa.contratoId,
    categoriaAfiliacionId: tarifa.categoriaAfiliacionId,
    servicio: {
      id: tarifa.servicio.id,
      nombre: tarifa.servicio.nombre,
    },
    contrato: {
      id: tarifa.contrato.id,
      nombre: tarifa.contrato.nombre,
    },
    categoriaAfiliacion: tarifa.categoriaAfiliacion
      ? {
          id: tarifa.categoriaAfiliacion.id,
          nombre: tarifa.categoriaAfiliacion.nombre,
        }
      : null,
    tipoCobro: tarifa.tipoCobro,
    valor: tarifa.valor.toString(),
    fechaInicioVigencia: tarifa.fechaInicioVigencia.toISOString(),
    fechaFinVigencia: tarifa.fechaFinVigencia
      ? tarifa.fechaFinVigencia.toISOString()
      : null,
    estado: tarifa.estado,
  }));
}