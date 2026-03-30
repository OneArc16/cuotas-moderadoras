import { prisma } from "../src/lib/prisma";

async function main() {
  const [permisos, rolPermisos, roles] = await Promise.all([
    prisma.permiso.count(),
    prisma.rolPermiso.count(),
    prisma.rol.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        estado: true,
        _count: {
          select: {
            permisos: true,
          },
        },
      },
    }),
  ]);

  console.log(JSON.stringify({ permisos, rolPermisos, roles }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });