-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA', 'TARJETA', 'OTRO');

-- AlterTable
ALTER TABLE "Admision" ADD COLUMN     "metodoPagoSnapshot" "MetodoPago",
ADD COLUMN     "referenciaPagoSnapshot" TEXT;

-- AlterTable
ALTER TABLE "Movimiento" ADD COLUMN     "metodoPago" "MetodoPago" NOT NULL DEFAULT 'OTRO',
ADD COLUMN     "referenciaPago" TEXT;
