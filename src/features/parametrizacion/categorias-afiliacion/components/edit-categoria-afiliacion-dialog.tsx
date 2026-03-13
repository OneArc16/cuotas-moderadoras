"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCategoriaAfiliacion } from "@/features/parametrizacion/categorias-afiliacion/lib/update-categoria-afiliacion";
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

type EditCategoriaAfiliacionDialogProps = {
  id: number;
  codigo: string;
  nombre: string;
};

export function EditCategoriaAfiliacionDialog({
  id,
  codigo,
  nombre,
}: EditCategoriaAfiliacionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [codigoValue, setCodigoValue] = useState(codigo);
  const [nombreValue, setNombreValue] = useState(nombre);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCodigoValue(codigo);
    setNombreValue(nombre);
  }, [codigo, nombre]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateCategoriaAfiliacion({
          id,
          codigo: codigoValue,
          nombre: nombreValue,
        });

        toast.success("Categoría actualizada correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la categoría"
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
          <DialogTitle>Editar categoría de afiliación</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`codigo-categoria-${id}`}>Código</Label>
            <Input
              id={`codigo-categoria-${id}`}
              value={codigoValue}
              onChange={(e) => setCodigoValue(e.target.value)}
              placeholder="Ej: A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`nombre-categoria-${id}`}>Nombre</Label>
            <Input
              id={`nombre-categoria-${id}`}
              value={nombreValue}
              onChange={(e) => setNombreValue(e.target.value)}
              placeholder="Ej: Categoría A"
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
