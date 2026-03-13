"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleServicioStatus } from "@/features/parametrizacion/servicios/lib/toggle-servicio-status";
import { EditServicioDialog } from "./edit-servicio-dialog";

type ServicioItem = {
  id: number;
  codigo: string | null;
  nombre: string;
  estado: string;
};

type ServiciosListProps = {
  servicios: ServicioItem[];
};

export function ServiciosList({ servicios }: ServiciosListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await toggleServicioStatus(id);
        toast.success("Estado del servicio actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del servicio"
        );
      }
    });
  }

  if (servicios.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay servicios registrados.
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
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="grid grid-cols-5 items-center px-4 py-3 text-sm"
          >
            <span>{servicio.id}</span>
            <span>{servicio.codigo ?? "—"}</span>
            <span>{servicio.nombre}</span>
            <span>{servicio.estado}</span>
            <div className="flex items-center gap-2">
              <EditServicioDialog
                id={servicio.id}
                codigo={servicio.codigo}
                nombre={servicio.nombre}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(servicio.id)}
              >
                {servicio.estado === "ACTIVO" ? "Inactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
