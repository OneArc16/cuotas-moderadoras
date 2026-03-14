"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createContratoCategoriaAfiliacion } from "@/features/parametrizacion/contratos/lib/create-contrato-categoria-afiliacion";
import { toggleContratoCategoriaAfiliacionStatus } from "@/features/parametrizacion/contratos/lib/toggle-contrato-categoria-afiliacion-status";

type CategoriaAfiliacionItem = {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
};

type ContratoCategoriaRelacionItem = {
  id: number;
  estado: string;
  categoriaAfiliacion: {
    id: number;
    codigo: string;
    nombre: string;
    estado: string;
  };
};

type ContratoCategoriasManagerProps = {
  contratoId: number;
  categoriasAfiliacion: CategoriaAfiliacionItem[];
  relaciones: ContratoCategoriaRelacionItem[];
};

export function ContratoCategoriasManager({
  contratoId,
  categoriasAfiliacion,
  relaciones,
}: ContratoCategoriasManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const categoriasDisponibles = useMemo(() => {
    const categoriasActivasAsignadas = new Set(
      relaciones
        .filter((relacion) => relacion.estado === "ACTIVO")
        .map((relacion) => relacion.categoriaAfiliacion.id)
    );

    return categoriasAfiliacion.filter(
      (categoria) =>
        categoria.estado === "ACTIVO" &&
        !categoriasActivasAsignadas.has(categoria.id)
    );
  }, [categoriasAfiliacion, relaciones]);

  const [categoriaAfiliacionId, setCategoriaAfiliacionId] = useState<string>(
    categoriasDisponibles[0]?.id ? String(categoriasDisponibles[0].id) : ""
  );

  useEffect(() => {
    setCategoriaAfiliacionId(
      categoriasDisponibles[0]?.id ? String(categoriasDisponibles[0].id) : ""
    );
  }, [categoriasDisponibles]);

  function handleCreate() {
    if (!categoriaAfiliacionId) {
      toast.error("Selecciona una categoría");
      return;
    }

    startTransition(async () => {
      try {
        await createContratoCategoriaAfiliacion({
          contratoId,
          categoriaAfiliacionId: Number(categoriaAfiliacionId),
        });

        toast.success("Categoría asignada correctamente");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo asignar la categoría"
        );
      }
    });
  }

  function handleToggle(id: number, estado: string) {
    startTransition(async () => {
      try {
        await toggleContratoCategoriaAfiliacionStatus(id);
        toast.success(
          estado === "ACTIVO"
            ? "Relación inactivada correctamente"
            : "Relación activada correctamente"
        );
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la relación"
        );
      }
    });
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-2">
        {relaciones.length > 0 ? (
          relaciones.map((relacion) => (
            <div
              key={relacion.id}
              className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs"
            >
              <span className="truncate">
                {relacion.categoriaAfiliacion.nombre}
                {relacion.estado === "INACTIVO" ? " (inactiva)" : ""}
              </span>

              <button
                type="button"
                className="shrink-0 text-xs font-medium underline underline-offset-2"
                onClick={() => handleToggle(relacion.id, relacion.estado)}
                disabled={isPending}
              >
                {relacion.estado === "ACTIVO" ? "Quitar" : "Activar"}
              </button>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Sin categorías</span>
        )}
      </div>

      {categoriasDisponibles.length > 0 ? (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            value={categoriaAfiliacionId}
            onChange={(event) => setCategoriaAfiliacionId(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm md:max-w-[260px]"
            disabled={isPending}
          >
            {categoriasDisponibles.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreate}
            disabled={isPending || !categoriaAfiliacionId}
            className="md:w-auto"
          >
            Asignar categoría
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No hay más categorías activas disponibles para asignar.
        </p>
      )}
    </div>
  );
}