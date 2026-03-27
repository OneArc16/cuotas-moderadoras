"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createCaja } from "@/features/parametrizacion/cajas/lib/create-caja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CajaForm() {
  const [isPending, startTransition] = useTransition();
  const [nombre, setNombre] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await createCaja({ nombre });
        toast.success("Caja creada correctamente");
        setNombre("");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo crear la caja",
        );
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de la caja</Label>
          <Input
            id="nombre"
            placeholder="Ej: Caja primer piso"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Usa un nombre claro y operativo para identificar la caja.
          </p>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar caja"}
        </Button>
      </form>
    </div>
  );
}