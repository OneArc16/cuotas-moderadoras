-- Make floor and module references optional for the active caja-only workflow.
ALTER TABLE "Caja" ALTER COLUMN "pisoId" DROP NOT NULL;
ALTER TABLE "SesionOperativa" ALTER COLUMN "moduloAtencionId" DROP NOT NULL;
ALTER TABLE "SesionOperativa" ALTER COLUMN "pisoId" DROP NOT NULL;
ALTER TABLE "Admision" ALTER COLUMN "pisoId" DROP NOT NULL;
ALTER TABLE "Admision" ALTER COLUMN "moduloAtencionId" DROP NOT NULL;
ALTER TABLE "Movimiento" ALTER COLUMN "pisoId" DROP NOT NULL;
ALTER TABLE "Movimiento" ALTER COLUMN "moduloAtencionId" DROP NOT NULL;

-- Allow cuota moderadora tariffs to be defined by contract + category without an individual service.
ALTER TABLE "TarifaServicio" ALTER COLUMN "servicioId" DROP NOT NULL;