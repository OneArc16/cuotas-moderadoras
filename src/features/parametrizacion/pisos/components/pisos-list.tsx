"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { togglePisoStatus } from "@/features/parametrizacion/pisos/lib/toggle-piso-status";
import type { Piso } from "../../../../../generated/prisma/client";

type PisosListProps = {
  pisos: Piso[];
};

export function PisosList({ pisos }: PisosListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await togglePisoStatus(id);
        toast.success("Estado del piso actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del piso"
        );
      }
    });
  }

  if (pisos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay pisos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
        <span>ID</span>
        <span>Nombre</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      <div className="divide-y">
        {pisos.map((piso) => (
          <div key={piso.id} className="grid grid-cols-4 items-center px-4 py-3 text-sm">
            <span>{piso.id}</span>
            <span>{piso.nombre}</span>
            <span>{piso.estado}</span>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(piso.id)}
              >
                {piso.estado === "ACTIVO" ? "Inactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}