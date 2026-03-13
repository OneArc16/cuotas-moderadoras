"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCaja } from "@/features/parametrizacion/cajas/lib/update-caja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PisoOption = {
  id: number;
  nombre: string;
};

type EditCajaDialogProps = {
  id: number;
  nombre: string;
  pisoId: number;
  pisos: PisoOption[];
};

export function EditCajaDialog({
  id,
  nombre,
  pisoId,
  pisos,
}: EditCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nombreValue, setNombreValue] = useState(nombre);
  const [pisoIdValue, setPisoIdValue] = useState(pisoId);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNombreValue(nombre);
    setPisoIdValue(pisoId);
  }, [nombre, pisoId]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateCaja({
          id,
          nombre: nombreValue,
          pisoId: pisoIdValue,
        });

        toast.success("Caja actualizada correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la caja"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`nombre-caja-${id}`}>Nombre</Label>
            <Input
              id={`nombre-caja-${id}`}
              value={nombreValue}
              onChange={(e) => setNombreValue(e.target.value)}
              placeholder="Ej: Caja Piso 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`piso-caja-${id}`}>Piso</Label>
            <select
              id={`piso-caja-${id}`}
              value={pisoIdValue}
              onChange={(e) => setPisoIdValue(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {pisos.map((piso) => (
                <option key={piso.id} value={piso.id}>
                  {piso.nombre}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}