import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

import { auth } from "../../src/lib/auth";
import {
  syncBasePermissions,
  syncBaseRolePermissions,
  syncBaseRoles,
} from "../../src/lib/rbac/sync-base-rbac";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function normalizeLoginUsername(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .toLowerCase();
}

async function main() {
  const rolesByName = await syncBaseRoles(prisma, {
    reactivateExistingRoles: true,
  });
  const permissionsByCode = await syncBasePermissions(prisma);

  await syncBaseRolePermissions(prisma, rolesByName, permissionsByCode, {
    resetToMatrix: true,
  });

  const adminRole = rolesByName.get("SUPERADMINISTRADOR");

  if (!adminRole) {
    throw new Error("No se encontro el rol SUPERADMINISTRADOR");
  }

  const adminName = "Administrador Principal";
  const adminEmail = "admin@cuotas.local";
  const adminUsernameVisual = "admin";
  const adminUsername = normalizeLoginUsername(adminUsernameVisual);
  const adminPassword = "Admin12345*";

  let authUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!authUser) {
    await auth.api.signUpEmail({
      body: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        username: adminUsername,
        displayUsername: adminUsernameVisual,
      },
    });

    authUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
  }

  if (!authUser) {
    throw new Error("No se pudo crear o recuperar el usuario auth");
  }

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      name: adminName,
      email: adminEmail,
      username: adminUsername,
      displayUsername: adminUsernameVisual,
      role: "admin",
      banned: false,
    },
  });

  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      OR: [
        { authUserId: authUser.id },
        { username: adminUsername },
        { email: adminEmail },
        { numeroDocumento: "1000000000" },
      ],
    },
  });

  if (usuarioExistente) {
    await prisma.usuario.update({
      where: { id: usuarioExistente.id },
      data: {
        tipoDocumento: "CC",
        numeroDocumento: "1000000000",
        primerNombre: "ADMINISTRADOR",
        segundoNombre: null,
        primerApellido: "PRINCIPAL",
        segundoApellido: null,
        telefono: null,
        email: adminEmail,
        username: adminUsername,
        passwordHash: "AUTH_MANAGED",
        estado: "ACTIVO",
        rolId: adminRole.id,
        authUserId: authUser.id,
      },
    });
  } else {
    await prisma.usuario.create({
      data: {
        tipoDocumento: "CC",
        numeroDocumento: "1000000000",
        primerNombre: "ADMINISTRADOR",
        segundoNombre: null,
        primerApellido: "PRINCIPAL",
        segundoApellido: null,
        telefono: null,
        email: adminEmail,
        username: adminUsername,
        passwordHash: "AUTH_MANAGED",
        estado: "ACTIVO",
        rolId: adminRole.id,
        authUserId: authUser.id,
      },
    });
  }

  console.log("Seed inicial completado");
  console.log("Auth user id:", authUser.id);
  console.log("Usuario:", adminUsername);
  console.log("Contrasena:", adminPassword);
  console.log("Rol Better Auth:", "admin");
  console.log("Rol interno:", adminRole.nombre);
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });