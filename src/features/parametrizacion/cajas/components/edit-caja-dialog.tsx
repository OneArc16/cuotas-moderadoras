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

type EditCajaDialogProps = {
  id: number;
  nombre: string;
};

export function EditCajaDialog({ id, nombre }: EditCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nombreValue, setNombreValue] = useState(nombre);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNombreValue(nombre);
  }, [nombre]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await updateCaja({
          id,
          nombre: nombreValue,
        });

        toast.success("Caja actualizada correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo actualizar la caja",
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
              onChange={(event) => setNombreValue(event.target.value)}
              placeholder="Ej: Caja primer piso"
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}