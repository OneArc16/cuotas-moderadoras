"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startSesionOperativa } from "@/features/sesion-operativa/lib/start-sesion-operativa";

type ModuloDisponibleItem = {
  id: number;
  nombre: string;
  codigo: string;
  piso: {
    id: number;
    nombre: string;
    cajas: {
      id: number;
      nombre: string;
      estado: string;
    }[];
  };
};

type ModuloSelectorProps = {
  modulos: ModuloDisponibleItem[];
};

export function ModuloSelector({ modulos }: ModuloSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(moduloAtencionId: number) {
    startTransition(async () => {
      try {
        await startSesionOperativa({ moduloAtencionId });
        toast.success("Módulo seleccionado correctamente");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo iniciar la sesión operativa"
        );
      }
    });
  }

  if (modulos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          No hay módulos disponibles para iniciar sesión operativa.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modulos.map((modulo) => {
        const cajaAsignada = modulo.piso.cajas[0] ?? null;

        return (
          <div
            key={modulo.id}
            className="rounded-2xl border bg-background p-5 shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Código: {modulo.codigo}
              </p>
              <h3 className="text-lg font-semibold">{modulo.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                Piso: {modulo.piso.nombre}
              </p>
              <p className="text-sm text-muted-foreground">
                Caja: {cajaAsignada ? cajaAsignada.nombre : "Sin caja activa"}
              </p>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                onClick={() => handleSelect(modulo.id)}
                disabled={isPending || !cajaAsignada}
                className="w-full"
              >
                Entrar a este módulo
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}