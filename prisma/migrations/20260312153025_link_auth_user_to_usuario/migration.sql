/*
  Warnings:

  - A unique constraint covering the columns `[authUserId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "authUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_authUserId_key" ON "Usuario"("authUserId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
