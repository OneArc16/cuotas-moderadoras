"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateModuloAtencion } from "@/features/parametrizacion/modulos-atencion/lib/update-modulo-atencion";
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

type EditModuloAtencionDialogProps = {
  id: number;
  codigo: string;
  nombre: string;
  pisoId: number;
  pisos: PisoOption[];
};

export function EditModuloAtencionDialog({
  id,
  codigo,
  nombre,
  pisoId,
  pisos,
}: EditModuloAtencionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [codigoValue, setCodigoValue] = useState(codigo);
  const [nombreValue, setNombreValue] = useState(nombre);
  const [pisoIdValue, setPisoIdValue] = useState(pisoId);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCodigoValue(codigo);
    setNombreValue(nombre);
    setPisoIdValue(pisoId);
  }, [codigo, nombre, pisoId]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateModuloAtencion({
          id,
          codigo: codigoValue,
          nombre: nombreValue,
          pisoId: pisoIdValue,
        });

        toast.success("Módulo actualizado correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el módulo"
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
          <DialogTitle>Editar módulo de atención</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`codigo-modulo-${id}`}>Código</Label>
            <Input
              id={`codigo-modulo-${id}`}
              value={codigoValue}
              onChange={(e) => setCodigoValue(e.target.value)}
              placeholder="Ej: MOD-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`nombre-modulo-${id}`}>Nombre</Label>
            <Input
              id={`nombre-modulo-${id}`}
              value={nombreValue}
              onChange={(e) => setNombreValue(e.target.value)}
              placeholder="Ej: Módulo 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`piso-modulo-${id}`}>Piso</Label>
            <select
              id={`piso-modulo-${id}`}
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