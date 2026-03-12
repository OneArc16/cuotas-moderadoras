-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "GenericStatus" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CC', 'CE', 'TI', 'RC', 'PASAPORTE', 'NIT', 'OTRO');

-- CreateEnum
CREATE TYPE "ContratoTipo" AS ENUM ('EPS', 'PARTICULAR', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoCobro" AS ENUM ('CUOTA_MODERADORA', 'PARTICULAR');

-- CreateEnum
CREATE TYPE "JornadaCajaEstado" AS ENUM ('ABIERTA', 'CERRADA', 'REABIERTA');

-- CreateEnum
CREATE TYPE "SesionOperativaEstado" AS ENUM ('ACTIVA', 'CERRADA');

-- CreateEnum
CREATE TYPE "AdmisionEstado" AS ENUM ('REGISTRADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "DescuentoTipo" AS ENUM ('NINGUNO', 'PORCENTAJE', 'VALOR_FIJO');

-- CreateEnum
CREATE TYPE "MovimientoTipo" AS ENUM ('COBRO', 'DEVOLUCION', 'REVERSO_ANULACION');

-- CreateEnum
CREATE TYPE "MovimientoNaturaleza" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateTable
CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "moduloSistema" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "id" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "primerNombre" TEXT NOT NULL,
    "segundoNombre" TEXT,
    "primerApellido" TEXT NOT NULL,
    "segundoApellido" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "estado" "UserStatus" NOT NULL DEFAULT 'ACTIVO',
    "rolId" TEXT NOT NULL,
    "ultimoLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "primerNombre" TEXT NOT NULL,
    "segundoNombre" TEXT,
    "primerApellido" TEXT NOT NULL,
    "segundoApellido" TEXT,
    "telefono" TEXT,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "ContratoTipo" NOT NULL,
    "descripcion" TEXT,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaAfiliacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaAfiliacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoCategoriaAfiliacion" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "categoriaAfiliacionId" TEXT NOT NULL,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoCategoriaAfiliacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarifaServicio" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "categoriaAfiliacionId" TEXT,
    "tipoCobro" "TipoCobro" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "fechaInicioVigencia" TIMESTAMP(3) NOT NULL,
    "fechaFinVigencia" TIMESTAMP(3),
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarifaServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piso" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Piso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuloAtencion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "pisoId" TEXT NOT NULL,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuloAtencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caja" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "pisoId" TEXT NOT NULL,
    "estado" "GenericStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaCaja" (
    "id" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "fechaOperativa" TIMESTAMP(3) NOT NULL,
    "estado" "JornadaCajaEstado" NOT NULL DEFAULT 'ABIERTA',
    "baseInicial" DECIMAL(12,2) NOT NULL,
    "abiertaPorUsuarioId" TEXT NOT NULL,
    "abiertaAt" TIMESTAMP(3) NOT NULL,
    "cerradaPorUsuarioId" TEXT,
    "cerradaAt" TIMESTAMP(3),
    "totalCobros" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDevoluciones" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldoEsperado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "efectivoContado" DECIMAL(12,2),
    "diferenciaCierre" DECIMAL(12,2),
    "observacionApertura" TEXT,
    "observacionCierre" TEXT,
    "reabiertaPorUsuarioId" TEXT,
    "reabiertaAt" TIMESTAMP(3),
    "motivoReapertura" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JornadaCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionOperativa" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "moduloAtencionId" TEXT NOT NULL,
    "pisoId" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "fechaOperativa" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3),
    "estado" "SesionOperativaEstado" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesionOperativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admision" (
    "id" TEXT NOT NULL,
    "consecutivo" INTEGER,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pacienteId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "categoriaAfiliacionId" TEXT,
    "tipoCobro" "TipoCobro" NOT NULL,
    "estado" "AdmisionEstado" NOT NULL DEFAULT 'REGISTRADA',
    "motivoEstado" TEXT,
    "pisoId" TEXT NOT NULL,
    "moduloAtencionId" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "jornadaCajaId" TEXT NOT NULL,
    "sesionOperativaId" TEXT NOT NULL,
    "registradaPorUsuarioId" TEXT NOT NULL,
    "pacienteNombreSnapshot" TEXT NOT NULL,
    "pacienteDocumentoSnapshot" TEXT NOT NULL,
    "servicioNombreSnapshot" TEXT NOT NULL,
    "contratoNombreSnapshot" TEXT NOT NULL,
    "categoriaAfiliacionNombreSnapshot" TEXT,
    "tipoCobroSnapshot" "TipoCobro" NOT NULL,
    "tarifaIdAplicada" TEXT,
    "valorBase" DECIMAL(12,2) NOT NULL,
    "descuentoTipo" "DescuentoTipo" NOT NULL DEFAULT 'NINGUNO',
    "descuentoValor" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descuentoCalculado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "razonDescuento" TEXT,
    "valorFinalCobrado" DECIMAL(12,2) NOT NULL,
    "valorRecibido" DECIMAL(12,2) NOT NULL,
    "valorDevuelto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "anuladaPorUsuarioId" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "motivoAnulacion" TEXT,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "admisionId" TEXT NOT NULL,
    "jornadaCajaId" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "pisoId" TEXT NOT NULL,
    "moduloAtencionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoMovimiento" "MovimientoTipo" NOT NULL,
    "naturaleza" "MovimientoNaturaleza" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalle" TEXT,
    "valorAnteriorJson" JSONB,
    "valorNuevoJson" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "RolPermiso_rolId_permisoId_key" ON "RolPermiso"("rolId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_numeroDocumento_key" ON "Usuario"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_numeroDocumento_key" ON "Paciente"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_nombre_key" ON "Contrato"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaAfiliacion_codigo_key" ON "CategoriaAfiliacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoCategoriaAfiliacion_contratoId_categoriaAfiliacionI_key" ON "ContratoCategoriaAfiliacion"("contratoId", "categoriaAfiliacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_codigo_key" ON "Servicio"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombre_key" ON "Servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Piso_nombre_key" ON "Piso"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ModuloAtencion_codigo_key" ON "ModuloAtencion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ModuloAtencion_nombre_pisoId_key" ON "ModuloAtencion"("nombre", "pisoId");

-- CreateIndex
CREATE UNIQUE INDEX "Caja_nombre_key" ON "Caja"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Admision_consecutivo_key" ON "Admision"("consecutivo");

-- CreateIndex
CREATE INDEX "Admision_fechaHora_idx" ON "Admision"("fechaHora");

-- CreateIndex
CREATE INDEX "Admision_pacienteId_fechaHora_idx" ON "Admision"("pacienteId", "fechaHora");

-- CreateIndex
CREATE INDEX "Movimiento_createdAt_idx" ON "Movimiento"("createdAt");

-- CreateIndex
CREATE INDEX "Auditoria_createdAt_idx" ON "Auditoria"("createdAt");

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoCategoriaAfiliacion" ADD CONSTRAINT "ContratoCategoriaAfiliacion_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoCategoriaAfiliacion" ADD CONSTRAINT "ContratoCategoriaAfiliacion_categoriaAfiliacionId_fkey" FOREIGN KEY ("categoriaAfiliacionId") REFERENCES "CategoriaAfiliacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaServicio" ADD CONSTRAINT "TarifaServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaServicio" ADD CONSTRAINT "TarifaServicio_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaServicio" ADD CONSTRAINT "TarifaServicio_categoriaAfiliacionId_fkey" FOREIGN KEY ("categoriaAfiliacionId") REFERENCES "CategoriaAfiliacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuloAtencion" ADD CONSTRAINT "ModuloAtencion_pisoId_fkey" FOREIGN KEY ("pisoId") REFERENCES "Piso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caja" ADD CONSTRAINT "Caja_pisoId_fkey" FOREIGN KEY ("pisoId") REFERENCES "Piso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaCaja" ADD CONSTRAINT "JornadaCaja_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaCaja" ADD CONSTRAINT "JornadaCaja_abiertaPorUsuarioId_fkey" FOREIGN KEY ("abiertaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaCaja" ADD CONSTRAINT "JornadaCaja_cerradaPorUsuarioId_fkey" FOREIGN KEY ("cerradaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaCaja" ADD CONSTRAINT "JornadaCaja_reabiertaPorUsuarioId_fkey" FOREIGN KEY ("reabiertaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionOperativa" ADD CONSTRAINT "SesionOperativa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionOperativa" ADD CONSTRAINT "SesionOperativa_moduloAtencionId_fkey" FOREIGN KEY ("moduloAtencionId") REFERENCES "ModuloAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionOperativa" ADD CONSTRAINT "SesionOperativa_pisoId_fkey" FOREIGN KEY ("pisoId") REFERENCES "Piso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionOperativa" ADD CONSTRAINT "SesionOperativa_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_categoriaAfiliacionId_fkey" FOREIGN KEY ("categoriaAfiliacionId") REFERENCES "CategoriaAfiliacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_tarifaIdAplicada_fkey" FOREIGN KEY ("tarifaIdAplicada") REFERENCES "TarifaServicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_pisoId_fkey" FOREIGN KEY ("pisoId") REFERENCES "Piso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_moduloAtencionId_fkey" FOREIGN KEY ("moduloAtencionId") REFERENCES "ModuloAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_jornadaCajaId_fkey" FOREIGN KEY ("jornadaCajaId") REFERENCES "JornadaCaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_sesionOperativaId_fkey" FOREIGN KEY ("sesionOperativaId") REFERENCES "SesionOperativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_registradaPorUsuarioId_fkey" FOREIGN KEY ("registradaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_anuladaPorUsuarioId_fkey" FOREIGN KEY ("anuladaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_admisionId_fkey" FOREIGN KEY ("admisionId") REFERENCES "Admision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_jornadaCajaId_fkey" FOREIGN KEY ("jornadaCajaId") REFERENCES "JornadaCaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_pisoId_fkey" FOREIGN KEY ("pisoId") REFERENCES "Piso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_moduloAtencionId_fkey" FOREIGN KEY ("moduloAtencionId") REFERENCES "ModuloAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
