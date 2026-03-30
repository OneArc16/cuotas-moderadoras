"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/lib/prisma");
async function main() {
    const [permisos, rolPermisos, roles] = await Promise.all([
        prisma_1.prisma.permiso.count(),
        prisma_1.prisma.rolPermiso.count(),
        prisma_1.prisma.rol.findMany({
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
    await prisma_1.prisma.$disconnect();
});
