"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { reopenJornadaCaja } from "@/features/caja/lib/reopen-jornada-caja";

type ReopenJornadaCajaDialogProps = {
  jornadaId: number;
  cajaNombre: string;
  disabled?: boolean;
};

export function ReopenJornadaCajaDialog({
  jornadaId,
  cajaNombre,
  disabled = false,
}: ReopenJornadaCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [motivoReapertura, setMotivoReapertura] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await reopenJornadaCaja({
          jornadaId,
          motivoReapertura,
        });

        toast.success("Caja reabierta correctamente");
        setMotivoReapertura("");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo reabrir la caja"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" disabled={disabled}>
          Reabrir caja
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reabrir caja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{cajaNombre}</p>
            <p className="text-sm text-muted-foreground">
              Registra el motivo de la reapertura.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`motivo-reapertura-${jornadaId}`}>
              Motivo de reapertura
            </Label>
            <textarea
              id={`motivo-reapertura-${jornadaId}`}
              value={motivoReapertura}
              onChange={(event) => setMotivoReapertura(event.target.value)}
              rows={4}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Describe por qué se necesita reabrir la caja"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Reabriendo..." : "Confirmar reapertura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}