"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { cancelAdmisionAction } from "@/features/admisiones/lib/cancel-admision-action";

type CancelAdmisionDialogProps = {
  admisionId: number;
  pacienteNombre: string;
  servicioNombre: string;
  valorFinalCobrado: string;
  metodoPagoSnapshot: string | null;
};

function formatMoney(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatMetodoPago(value: string | null) {
  switch (value) {
    case "EFECTIVO":
      return "Efectivo";
    case "NEQUI":
      return "Nequi";
    case "DAVIPLATA":
      return "Daviplata";
    case "TRANSFERENCIA":
      return "Transferencia";
    case "TARJETA":
      return "Tarjeta";
    case "OTRO":
      return "Otro";
    default:
      return "Sin definir";
  }
}

export function CancelAdmisionDialog({
  admisionId,
  pacienteNombre,
  servicioNombre,
  valorFinalCobrado,
  metodoPagoSnapshot,
}: CancelAdmisionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setMotivoAnulacion("");
    setErrorMessage(null);
  }

  function handleSubmit() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await cancelAdmisionAction({
          admisionId,
          motivoAnulacion,
        });

        if (!result.ok) {
          setErrorMessage(
            result.fieldErrors?.motivoAnulacion?.[0] ??
              result.message ??
              "No se pudo anular la admision.",
          );
          return;
        }

        toast.success("Admision anulada correctamente");
        handleClose();
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo anular la admision.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="rounded-2xl">
          Anular admision
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl overflow-hidden rounded-3xl p-0">
        <div className="bg-muted/30 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Anular admision registrada
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Vas a anular la admision de <span className="font-medium text-foreground">{pacienteNombre}</span>.
              Esta accion registrara un reverso en caja y dejara trazabilidad operativa.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-muted/20 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admision</p>
              <p className="mt-2 text-base font-semibold">{servicioNombre}</p>
              <p className="mt-1 text-sm text-muted-foreground">Paciente: {pacienteNombre}</p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cobro registrado</p>
              <p className="mt-2 text-base font-semibold">{formatMoney(valorFinalCobrado)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Metodo: {formatMetodoPago(metodoPagoSnapshot)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Importante</p>
            <p className="mt-1 text-sm text-muted-foreground">
              La anulacion dejara la admision en estado ANULADA y registrara una salida de caja por el mismo valor del cobro.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`motivo-anulacion-${admisionId}`}>Motivo de anulacion</Label>
            <Textarea
              id={`motivo-anulacion-${admisionId}`}
              placeholder="Describe por que debes anular esta admision"
              value={motivoAnulacion}
              onChange={(event) => setMotivoAnulacion(event.target.value)}
              disabled={isPending}
              rows={4}
              className="rounded-2xl"
            />
            <p className="text-sm text-muted-foreground">
              Este motivo quedara guardado en auditoria y en el historial operativo de la admision.
            </p>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-2xl"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending || !motivoAnulacion.trim()}
            className="rounded-2xl"
          >
            {isPending ? "Anulando..." : "Confirmar anulacion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}