import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../../src/lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    {
      nombre: "SUPERADMINISTRADOR",
      descripcion: "Control total del sistema",
    },
    {
      nombre: "ADMINISTRADOR",
      descripcion: "Gestión operativa y administrativa",
    },
    {
      nombre: "ADMISIONISTA",
      descripcion: "Registro de admisiones y operación de caja",
    },
    {
      nombre: "AUDITOR",
      descripcion: "Consulta y revisión de información",
    },
    {
      nombre: "GERENCIA",
      descripcion: "Consulta ejecutiva y reportes",
    },
  ];

  for (const role of roles) {
    await prisma.rol.upsert({
      where: { nombre: role.nombre },
      update: {
        descripcion: role.descripcion,
      },
      create: role,
    });
  }

  const adminRole = await prisma.rol.findUnique({
    where: { nombre: "SUPERADMINISTRADOR" },
  });

  if (!adminRole) {
    throw new Error("No se encontró el rol SUPERADMINISTRADOR");
  }

  const adminEmail = "admin@cuotas.local";
  const adminUsername = "admin";
  const adminPassword = "Admin12345*";

  let authUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!authUser) {
    await auth.api.signUpEmail({
      body: {
        name: "Administrador Principal",
        email: adminEmail,
        password: adminPassword,
        username: adminUsername,
        displayUsername: adminUsername,
      },
    });

    authUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
  }

  if (!authUser) {
    throw new Error("No se pudo crear el usuario auth");
  }

  await prisma.usuario.upsert({
    where: { username: adminUsername },
    update: {
      authUserId: authUser.id,
      email: adminEmail,
      rolId: adminRole.id,
      estado: "ACTIVO",
    },
    create: {
      tipoDocumento: "CC",
      numeroDocumento: "1000000000",
      primerNombre: "Administrador",
      segundoNombre: null,
      primerApellido: "Principal",
      segundoApellido: null,
      telefono: null,
      email: adminEmail,
      username: adminUsername,
      passwordHash: "BETTER_AUTH_MANAGED",
      estado: "ACTIVO",
      rolId: adminRole.id,
      authUserId: authUser.id,
    },
  });

  console.log("Seed inicial completado");
  console.log("Usuario:", adminUsername);
  console.log("Contraseña:", adminPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });