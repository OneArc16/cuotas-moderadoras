"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { openJornadaCaja } from "@/features/caja/lib/open-jornada-caja";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type OpenJornadaCajaDialogProps = {
  cajaId: number;
  cajaNombre: string;
  pisoNombre: string;
};

function formatMoney(value: number | string) {
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

function sanitizeMoneyInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function parseMoneyInput(value: string) {
  if (!value.trim()) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function OpenJornadaCajaDialog({
  cajaId,
  cajaNombre,
  pisoNombre,
}: OpenJornadaCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [baseInicial, setBaseInicial] = useState("");
  const [observacion, setObservacion] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const baseInicialNumber = useMemo(
    () => parseMoneyInput(baseInicial),
    [baseInicial],
  );

  function handleClose() {
    setOpen(false);
    setBaseInicial("");
    setObservacion("");
    setErrorMessage(null);
  }

  function handleSubmit() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await openJornadaCaja({
          cajaId,
          baseInicial: baseInicialNumber,
          observacionApertura: observacion,
        });

        if (!result?.ok) {
          setErrorMessage(
            result?.message ?? "No se pudo abrir la jornada de caja.",
          );
          return;
        }

        toast.success("Caja abierta correctamente");
        handleClose();
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo abrir la jornada de caja.";
        setErrorMessage(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl">Abrir caja</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl overflow-hidden rounded-3xl p-0">
        <div className="bg-muted/30 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Abrir jornada de caja
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Vas a abrir la caja{" "}
              <span className="font-medium text-foreground">{cajaNombre}</span>{" "}
              del piso{" "}
              <span className="font-medium text-foreground">{pisoNombre}</span>.
              Registra la base inicial con la que comenzará la jornada.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Caja
              </p>
              <p className="mt-2 text-base font-semibold">{cajaNombre}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Punto de recaudo operativo.
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Base inicial proyectada
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatMoney(baseInicialNumber)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este valor será el punto de partida del efectivo esperado.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-inicial">Base inicial</Label>
            <Input
              id="base-inicial"
              inputMode="numeric"
              placeholder="Ej. 50000"
              value={baseInicial}
              onChange={(e) => setBaseInicial(sanitizeMoneyInput(e.target.value))}
              disabled={isPending}
              className="h-12 rounded-2xl"
            />
            <p className="text-sm text-muted-foreground">
              Digita el efectivo con el que inicia la caja en esta jornada.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion-apertura">Observación de apertura</Label>
            <Textarea
              id="observacion-apertura"
              placeholder="Opcional"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              disabled={isPending}
              rows={4}
              className="rounded-2xl"
            />
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
            onClick={handleSubmit}
            disabled={isPending || !baseInicial.trim()}
            className="rounded-2xl"
          >
            {isPending ? "Abriendo..." : "Confirmar apertura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}