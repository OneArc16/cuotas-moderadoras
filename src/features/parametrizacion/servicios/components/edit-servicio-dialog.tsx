"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateServicio } from "@/features/parametrizacion/servicios/lib/update-servicio";
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

type EditServicioDialogProps = {
  id: number;
  codigo: string | null;
  nombre: string;
};

export function EditServicioDialog({
  id,
  codigo,
  nombre,
}: EditServicioDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [codigoValue, setCodigoValue] = useState(codigo ?? "");
  const [nombreValue, setNombreValue] = useState(nombre);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCodigoValue(codigo ?? "");
    setNombreValue(nombre);
  }, [codigo, nombre]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateServicio({
          id,
          codigo: codigoValue,
          nombre: nombreValue,
        });

        toast.success("Servicio actualizado correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el servicio"
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
          <DialogTitle>Editar servicio</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`codigo-servicio-${id}`}>Código</Label>
            <Input
              id={`codigo-servicio-${id}`}
              value={codigoValue}
              onChange={(e) => setCodigoValue(e.target.value)}
              placeholder="Ej: MED-GEN"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`nombre-servicio-${id}`}>Nombre</Label>
            <Input
              id={`nombre-servicio-${id}`}
              value={nombreValue}
              onChange={(e) => setNombreValue(e.target.value)}
              placeholder="Ej: Medicina general"
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
