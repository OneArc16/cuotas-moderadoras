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
import { openJornadaCaja } from "@/features/caja/lib/open-jornada-caja";

type OpenJornadaCajaDialogProps = {
  cajaId: number;
  cajaNombre: string;
  disabled?: boolean;
};

export function OpenJornadaCajaDialog({
  cajaId,
  cajaNombre,
  disabled = false,
}: OpenJornadaCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [baseInicial, setBaseInicial] = useState("");
  const [observacionApertura, setObservacionApertura] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await openJornadaCaja({
          cajaId,
          baseInicial,
          observacionApertura,
        });

        toast.success("Caja abierta correctamente");
        setBaseInicial("");
        setObservacionApertura("");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo abrir la caja"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" disabled={disabled}>
          Abrir caja
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{cajaNombre}</p>
            <p className="text-sm text-muted-foreground">
              Registra la base inicial de la jornada.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`base-inicial-${cajaId}`}>Base inicial</Label>
            <Input
              id={`base-inicial-${cajaId}`}
              type="number"
              min="0"
              step="0.01"
              value={baseInicial}
              onChange={(event) => setBaseInicial(event.target.value)}
              placeholder="Ej: 50000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`observacion-apertura-${cajaId}`}>
              Observación de apertura
            </Label>
            <textarea
              id={`observacion-apertura-${cajaId}`}
              value={observacionApertura}
              onChange={(event) => setObservacionApertura(event.target.value)}
              rows={3}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Abriendo..." : "Confirmar apertura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}