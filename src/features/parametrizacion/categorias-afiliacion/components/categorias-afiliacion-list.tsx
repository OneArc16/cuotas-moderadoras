"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleCategoriaAfiliacionStatus } from "@/features/parametrizacion/categorias-afiliacion/lib/toggle-categoria-afiliacion-status";
import { EditCategoriaAfiliacionDialog } from "@/features/parametrizacion/categorias-afiliacion/components/edit-categoria-afiliacion-dialog";

type CategoriaAfiliacionItem = {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
};

type CategoriasAfiliacionListProps = {
  categorias: CategoriaAfiliacionItem[];
};

export function CategoriasAfiliacionList({
  categorias,
}: CategoriasAfiliacionListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await toggleCategoriaAfiliacionStatus(id);
        toast.success("Estado de la categoría actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado de la categoría"
        );
      }
    });
  }

  if (categorias.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay categorías de afiliación registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-5 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
        <span>ID</span>
        <span>Código</span>
        <span>Nombre</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      <div className="divide-y">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="grid grid-cols-5 items-center px-4 py-3 text-sm"
          >
            <span>{categoria.id}</span>
            <span>{categoria.codigo}</span>
            <span>{categoria.nombre}</span>
            <span>{categoria.estado}</span>
            <div className="flex items-center gap-2">
              <EditCategoriaAfiliacionDialog
                id={categoria.id}
                codigo={categoria.codigo}
                nombre={categoria.nombre}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(categoria.id)}
              >
                {categoria.estado === "ACTIVO" ? "Inactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
