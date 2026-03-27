"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EditCajaDialog } from "@/features/parametrizacion/cajas/components/edit-caja-dialog";
import { toggleCajaStatus } from "@/features/parametrizacion/cajas/lib/toggle-caja-status";

type CajaItem = {
  id: number;
  nombre: string;
  estado: string;
};

type CajasListProps = {
  cajas: CajaItem[];
};

export function CajasList({ cajas }: CajasListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await toggleCajaStatus(id);
        toast.success("Estado de la caja actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado de la caja",
        );
      }
    });
  }

  if (cajas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay cajas registradas.
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
        {cajas.map((caja) => (
          <div
            key={caja.id}
            className="grid grid-cols-4 items-center px-4 py-3 text-sm"
          >
            <span>{caja.id}</span>
            <span>{caja.nombre}</span>
            <span>{caja.estado}</span>
            <div className="flex items-center gap-2">
              <EditCajaDialog id={caja.id} nombre={caja.nombre} />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(caja.id)}
              >
                {caja.estado === "ACTIVO" ? "Inactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}