"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePiso } from "@/features/parametrizacion/pisos/lib/update-piso";
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

type EditPisoDialogProps = {
  id: number;
  nombre: string;
};

export function EditPisoDialog({ id, nombre }: EditPisoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(nombre);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(nombre);
  }, [nombre]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updatePiso({
          id,
          nombre: value,
        });

        toast.success("Piso actualizado correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el piso"
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
          <DialogTitle>Editar piso</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`nombre-piso-${id}`}>Nombre del piso</Label>
            <Input
              id={`nombre-piso-${id}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ej: Piso 1"
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