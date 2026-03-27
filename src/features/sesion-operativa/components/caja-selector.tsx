"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startSesionOperativa } from "@/features/sesion-operativa/lib/start-sesion-operativa";

type CajaDisponibleItem = {
  id: number;
  nombre: string;
  jornadaActiva: null | {
    id: number;
    estado: string;
    fechaOperativa: Date | string;
  };
};

type CajaSelectorProps = {
  cajas: CajaDisponibleItem[];
};

export function CajaSelector({ cajas }: CajaSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(cajaId: number) {
    startTransition(async () => {
      try {
        await startSesionOperativa({ cajaId });
        toast.success("Caja seleccionada correctamente");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo iniciar la sesión operativa",
        );
      }
    });
  }

  if (cajas.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border/70 bg-background/75 p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          No hay cajas disponibles para iniciar sesión operativa.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {cajas.map((caja) => {
        const listaParaOperar = Boolean(caja.jornadaActiva);

        return (
          <div
            key={caja.id}
            className="rounded-[22px] border border-border/70 bg-background/90 p-4 shadow-[0_12px_28px_-22px_color-mix(in_oklab,var(--foreground)_30%,transparent)]"
          >
            <div className="space-y-1.5">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-medium uppercase tracking-[0.14em] ${
                  listaParaOperar
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {listaParaOperar
                  ? `Jornada ${caja.jornadaActiva?.estado.toLowerCase()}`
                  : "Sin jornada activa"}
              </span>
              <h3 className="text-base font-semibold tracking-[-0.02em] text-foreground">
                {caja.nombre}
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                {listaParaOperar
                  ? "Lista para iniciar sesión operativa."
                  : "Debes abrir o reabrir la jornada de esta caja antes de operar."}
              </p>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                onClick={() => handleSelect(caja.id)}
                disabled={isPending || !listaParaOperar}
                className="h-10 w-full rounded-2xl text-sm font-semibold"
              >
                Entrar a esta caja
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}