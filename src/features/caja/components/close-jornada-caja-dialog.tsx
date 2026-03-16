"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { closeJornadaCaja } from "@/features/caja/lib/close-jornada-caja";
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

type CloseJornadaCajaDialogProps = {
  jornadaId: number;
  cajaNombre: string;
  pisoNombre: string;
  saldoEsperado: string;
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

export function CloseJornadaCajaDialog({
  jornadaId,
  cajaNombre,
  pisoNombre,
  saldoEsperado,
}: CloseJornadaCajaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [efectivoContado, setEfectivoContado] = useState("");
  const [observacion, setObservacion] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const saldoEsperadoNumber = useMemo(
    () => Number(saldoEsperado) || 0,
    [saldoEsperado],
  );

  const efectivoContadoNumber = useMemo(
    () => parseMoneyInput(efectivoContado),
    [efectivoContado],
  );

  const diferencia = useMemo(
    () => efectivoContadoNumber - saldoEsperadoNumber,
    [efectivoContadoNumber, saldoEsperadoNumber],
  );

  const diferenciaLabel = useMemo(() => {
    if (!efectivoContado.trim()) return "Aún no has digitado el efectivo contado.";
    if (diferencia === 0) return "La caja cuadra exactamente.";
    if (diferencia > 0) return `Sobrante: ${formatMoney(diferencia)}`;
    return `Faltante: ${formatMoney(Math.abs(diferencia))}`;
  }, [efectivoContado, diferencia]);

  function handleClose() {
    setOpen(false);
    setEfectivoContado("");
    setObservacion("");
    setErrorMessage(null);
  }

  function handleSubmit() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await closeJornadaCaja({
          jornadaId,
          efectivoContado: efectivoContadoNumber,
          observacionCierre: observacion,
        });

        if (!result?.ok) {
          setErrorMessage(
            result?.message ?? "No se pudo cerrar la jornada de caja.",
          );
          return;
        }

        toast.success("Caja cerrada correctamente");
        handleClose();
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cerrar la jornada de caja.";
        setErrorMessage(message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl">Cerrar caja</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-muted/30 p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Cerrar jornada de caja
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Vas a cerrar la caja <span className="font-medium text-foreground">{cajaNombre}</span>{" "}
              del piso <span className="font-medium text-foreground">{pisoNombre}</span>.
              Registra el efectivo contado para calcular la diferencia frente al
              saldo esperado.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Saldo esperado
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatMoney(saldoEsperadoNumber)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este valor corresponde al efectivo que debe existir en caja.
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Diferencia proyectada
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {efectivoContado.trim()
                  ? formatMoney(diferencia)
                  : formatMoney(0)}
              </p>
              <p
                className={`mt-1 text-sm ${
                  !efectivoContado.trim()
                    ? "text-muted-foreground"
                    : diferencia === 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : diferencia > 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {diferenciaLabel}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="efectivo-contado">Efectivo contado</Label>
            <Input
              id="efectivo-contado"
              inputMode="numeric"
              placeholder="Ej. 85000"
              value={efectivoContado}
              onChange={(e) => setEfectivoContado(sanitizeMoneyInput(e.target.value))}
              disabled={isPending}
              className="h-12 rounded-2xl"
            />
            <p className="text-sm text-muted-foreground">
              Digita el efectivo real encontrado al momento del cierre.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion-cierre">Observación de cierre</Label>
            <Textarea
              id="observacion-cierre"
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
            disabled={isPending || !efectivoContado.trim()}
            className="rounded-2xl"
          >
            {isPending ? "Cerrando..." : "Confirmar cierre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}