import { NuevoColaboradorForm } from "@/features/colaboradores/components/nuevo-colaborador-form";
import { prisma } from "@/lib/prisma";

export default async function NuevoColaboradorPage() {
  const roles = await prisma.rol.findMany({
    where: {
      estado: "ACTIVO",
    },
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
    },
  });

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Administración / Colaboradores
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Nuevo colaborador
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Registra un nuevo colaborador interno, asígnale su rol y define su
            estado inicial dentro del sistema.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border bg-background p-6 shadow-sm">
        <NuevoColaboradorForm roles={roles} />
      </section>
    </main>
  );
}