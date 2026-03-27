"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { reopenJornadaCaja } from "@/features/caja/lib/reopen-jornada-caja";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReopenJornadaCajaDialogProps = {
  jornadaId: number;
  cajaNombre: string;
};

export function ReopenJornadaCajaDialog({
  jornadaId,
  cajaNombre,
}: ReopenJornadaCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [motivoReapertura, setMotivoReapertura] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setMotivoReapertura("");
    setErrorMessage(null);
  }

  function handleSubmit() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await reopenJornadaCaja({
          jornadaId,
          motivoReapertura,
        });

        if (!result?.ok) {
          setErrorMessage(
            result?.message ?? "No se pudo reabrir la jornada de caja.",
          );
          return;
        }

        toast.success("Caja reabierta correctamente");
        handleClose();
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo reabrir la jornada de caja.";
        setErrorMessage(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-2xl">
          Reabrir caja
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl overflow-hidden rounded-3xl p-0">
        <div className="bg-muted/30 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Reabrir jornada de caja
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Vas a reabrir la caja <span className="font-medium text-foreground">{cajaNombre}</span>.
              Registra el motivo de reapertura para dejar trazabilidad operativa.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Caja</p>
              <p className="mt-2 text-base font-semibold">{cajaNombre}</p>
              <p className="mt-1 text-sm text-muted-foreground">Jornada previamente cerrada.</p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Acción operativa</p>
              <p className="mt-2 text-base font-semibold">Reapertura controlada</p>
              <p className="mt-1 text-sm text-muted-foreground">Úsala solo cuando debas continuar la operación de la misma jornada.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Importante</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reabrir no crea una nueva jornada. Solo reactiva la jornada cerrada para continuar operando sobre la misma caja.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo-reapertura">Motivo de reapertura</Label>
            <Textarea
              id="motivo-reapertura"
              placeholder="Describe por qué necesitas reabrir esta caja"
              value={motivoReapertura}
              onChange={(e) => setMotivoReapertura(e.target.value)}
              disabled={isPending}
              rows={4}
              className="rounded-2xl"
            />
            <p className="text-sm text-muted-foreground">
              Este motivo quedará guardado como respaldo operativo.
            </p>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending} className="rounded-2xl">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !motivoReapertura.trim()} className="rounded-2xl">
            {isPending ? "Reabriendo..." : "Confirmar reapertura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}