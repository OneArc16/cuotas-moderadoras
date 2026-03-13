"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateContrato } from "@/features/parametrizacion/contratos/lib/update-contrato";
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

type EditContratoDialogProps = {
  id: number;
  nombre: string;
  tipo: "EPS" | "PARTICULAR" | "OTRO";
};

export function EditContratoDialog({
  id,
  nombre,
  tipo,
}: EditContratoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nombreValue, setNombreValue] = useState(nombre);
  const [tipoValue, setTipoValue] = useState<"EPS" | "PARTICULAR" | "OTRO">(tipo);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNombreValue(nombre);
    setTipoValue(tipo);
  }, [nombre, tipo]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateContrato({
          id,
          nombre: nombreValue,
          tipo: tipoValue,
        });

        toast.success("Contrato actualizado correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el contrato"
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
          <DialogTitle>Editar contrato</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`nombre-contrato-${id}`}>Nombre</Label>
            <Input
              id={`nombre-contrato-${id}`}
              value={nombreValue}
              onChange={(e) => setNombreValue(e.target.value)}
              placeholder="Ej: Coosalud contributivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tipo-contrato-${id}`}>Tipo</Label>
            <select
              id={`tipo-contrato-${id}`}
              value={tipoValue}
              onChange={(e) =>
                setTipoValue(e.target.value as "EPS" | "PARTICULAR" | "OTRO")
              }
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="EPS">EPS</option>
              <option value="PARTICULAR">PARTICULAR</option>
              <option value="OTRO">OTRO</option>
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