"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { closeJornadaCaja } from "@/features/caja/lib/close-jornada-caja";

type CloseJornadaCajaDialogProps = {
  jornadaId: number;
  cajaNombre: string;
  disabled?: boolean;
};

export function CloseJornadaCajaDialog({
  jornadaId,
  cajaNombre,
  disabled = false,
}: CloseJornadaCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [efectivoContado, setEfectivoContado] = useState("");
  const [observacionCierre, setObservacionCierre] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await closeJornadaCaja({
          jornadaId,
          efectivoContado,
          observacionCierre,
        });

        toast.success("Caja cerrada correctamente");
        setEfectivoContado("");
        setObservacionCierre("");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo cerrar la caja"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={disabled}>
          Cerrar caja
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{cajaNombre}</p>
            <p className="text-sm text-muted-foreground">
              Registra el efectivo contado al cierre.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`efectivo-contado-${jornadaId}`}>
              Efectivo contado
            </Label>
            <Input
              id={`efectivo-contado-${jornadaId}`}
              type="number"
              min="0"
              step="0.01"
              value={efectivoContado}
              onChange={(event) => setEfectivoContado(event.target.value)}
              placeholder="Ej: 85000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`observacion-cierre-${jornadaId}`}>
              Observación de cierre
            </Label>
            <textarea
              id={`observacion-cierre-${jornadaId}`}
              value={observacionCierre}
              onChange={(event) => setObservacionCierre(event.target.value)}
              rows={3}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Cerrando..." : "Confirmar cierre"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}