"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleContratoStatus } from "@/features/parametrizacion/contratos/lib/toggle-contrato-status";
import { EditContratoDialog } from "@/features/parametrizacion/contratos/components/edit-contrato-dialog";

type ContratoItem = {
  id: number;
  nombre: string;
  tipo: "EPS" | "PARTICULAR" | "OTRO";
  estado: string;
};

type ContratosListProps = {
  contratos: ContratoItem[];
};

export function ContratosList({ contratos }: ContratosListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await toggleContratoStatus(id);
        toast.success("Estado del contrato actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del contrato"
        );
      }
    });
  }

  if (contratos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay contratos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <div className="grid grid-cols-5 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
        <span>ID</span>
        <span>Nombre</span>
        <span>Tipo</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      <div className="divide-y">
        {contratos.map((contrato) => (
          <div
            key={contrato.id}
            className="grid grid-cols-5 items-center px-4 py-3 text-sm"
          >
            <span>{contrato.id}</span>
            <span>{contrato.nombre}</span>
            <span>{contrato.tipo}</span>
            <span>{contrato.estado}</span>
            <div className="flex items-center gap-2">
            <EditContratoDialog
                id={contrato.id}
                nombre={contrato.nombre}
                tipo={contrato.tipo}
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(contrato.id)}
            >
                {contrato.estado === "ACTIVO" ? "Inactivar" : "Activar"}
            </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}