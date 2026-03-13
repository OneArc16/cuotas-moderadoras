"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleModuloAtencionStatus } from "@/features/parametrizacion/modulos-atencion/lib/toggle-modulo-atencion-status";

type ModuloAtencionItem = {
  id: number;
  nombre: string;
  codigo: string;
  estado: string;
  piso: {
    nombre: string;
  };
};

type ModulosAtencionListProps = {
  modulos: ModuloAtencionItem[];
};

export function ModulosAtencionList({
  modulos,
}: ModulosAtencionListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await toggleModuloAtencionStatus(id);
        toast.success("Estado del módulo actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del módulo"
        );
      }
    });
  }

  if (modulos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay módulos de atención registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-6 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
        <span>ID</span>
        <span>Código</span>
        <span>Nombre</span>
        <span>Piso</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      <div className="divide-y">
        {modulos.map((modulo) => (
          <div
            key={modulo.id}
            className="grid grid-cols-6 items-center px-4 py-3 text-sm"
          >
            <span>{modulo.id}</span>
            <span>{modulo.codigo}</span>
            <span>{modulo.nombre}</span>
            <span>{modulo.piso.nombre}</span>
            <span>{modulo.estado}</span>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(modulo.id)}
              >
                {modulo.estado === "ACTIVO" ? "Inactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}