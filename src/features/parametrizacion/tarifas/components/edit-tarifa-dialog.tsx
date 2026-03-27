"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateTarifa } from "@/features/parametrizacion/tarifas/lib/update-tarifa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  id: number;
  nombre: string;
};

type ContratoOption = {
  id: number;
  nombre: string;
  tipo: string;
  categorias: {
    id: number;
    categoriaAfiliacionId: number;
    categoriaAfiliacion: {
      id: number;
      nombre: string;
    };
  }[];
};

type EditTarifaDialogProps = {
  id: number;
  servicioId: number | null;
  contratoId: number;
  categoriaAfiliacionId: number | null;
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string | null;
  servicios: Option[];
  contratos: ContratoOption[];
};

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.split("T")[0];
}

export function EditTarifaDialog({
  id,
  servicioId,
  contratoId,
  categoriaAfiliacionId,
  valor,
  fechaInicioVigencia,
  fechaFinVigencia,
  servicios,
  contratos,
}: EditTarifaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [servicioOpen, setServicioOpen] = useState(false);
  const [servicioIdValue, setServicioIdValue] = useState(servicioId ?? 0);
  const [contratoIdValue, setContratoIdValue] = useState(contratoId);
  const [categoriaAfiliacionIdValue, setCategoriaAfiliacionIdValue] = useState(
    categoriaAfiliacionId ?? 0,
  );
  const [valorValue, setValorValue] = useState(valor);
  const [fechaInicioValue, setFechaInicioValue] = useState(
    toDateInputValue(fechaInicioVigencia),
  );
  const [fechaFinValue, setFechaFinValue] = useState(
    toDateInputValue(fechaFinVigencia),
  );
  const [isPending, startTransition] = useTransition();

  const selectedContrato = useMemo(
    () => contratos.find((contratoItem) => contratoItem.id === contratoIdValue) ?? null,
    [contratoIdValue, contratos],
  );

  const selectedServicio = useMemo(
    () => servicios.find((servicioItem) => servicioItem.id === servicioIdValue) ?? null,
    [servicioIdValue, servicios],
  );

  const contratoEsParticular = selectedContrato?.tipo === "PARTICULAR";

  const categoriasDisponibles = useMemo(() => {
    if (!selectedContrato || contratoEsParticular) {
      return [];
    }

    return selectedContrato.categorias.map((relacion) => ({
      id: relacion.categoriaAfiliacion.id,
      nombre: relacion.categoriaAfiliacion.nombre,
    }));
  }, [contratoEsParticular, selectedContrato]);

  useEffect(() => {
    setServicioIdValue(servicioId ?? 0);
    setContratoIdValue(contratoId);
    setCategoriaAfiliacionIdValue(categoriaAfiliacionId ?? 0);
    setValorValue(valor);
    setFechaInicioValue(toDateInputValue(fechaInicioVigencia));
    setFechaFinValue(toDateInputValue(fechaFinVigencia));
  }, [
    categoriaAfiliacionId,
    contratoId,
    fechaFinVigencia,
    fechaInicioVigencia,
    servicioId,
    valor,
  ]);

  function handleContratoChange(nextContratoId: number) {
    setContratoIdValue(nextContratoId);
    setServicioIdValue(0);
    setCategoriaAfiliacionIdValue(0);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await updateTarifa({
          id,
          contratoId: contratoIdValue,
          servicioId:
            contratoEsParticular && servicioIdValue > 0 ? servicioIdValue : undefined,
          categoriaAfiliacionId:
            !contratoEsParticular && categoriaAfiliacionIdValue > 0
              ? categoriaAfiliacionIdValue
              : undefined,
          valor: valorValue,
          fechaInicioVigencia: fechaInicioValue,
          fechaFinVigencia: fechaFinValue || undefined,
        });

        toast.success("Tarifa actualizada correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo actualizar la tarifa",
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

      <DialogContent className="max-w-4xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>Editar tarifa</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Actualiza los datos de la tarifa y su vigencia.
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Información principal</p>
              <p className="text-sm text-muted-foreground">
                El tipo de cobro se define automáticamente según el contrato.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`contrato-tarifa-${id}`}>Contrato</Label>
                <select
                  id={`contrato-tarifa-${id}`}
                  value={contratoIdValue}
                  onChange={(event) => handleContratoChange(Number(event.target.value))}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {contratos.map((contratoItem) => (
                    <option key={contratoItem.id} value={contratoItem.id}>
                      {contratoItem.nombre} · {contratoItem.tipo}
                    </option>
                  ))}
                </select>

              </div>

              <div className="space-y-2">
                <Label>Tipo de cobro resuelto</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3 text-sm font-medium text-foreground">
                  {!selectedContrato
                    ? "Selecciona un contrato"
                    : contratoEsParticular
                      ? "PARTICULAR"
                      : "CUOTA MODERADORA"}
                </div>
              </div>
            </div>

            {contratoEsParticular ? (
              <div className="space-y-2">
                <Label htmlFor={`servicio-tarifa-${id}`}>Servicio</Label>
                <Popover open={servicioOpen} onOpenChange={setServicioOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={servicioOpen}
                      className={cn(
                        "w-full justify-between font-normal",
                        !selectedServicio && "text-muted-foreground",
                      )}
                    >
                      {selectedServicio ? selectedServicio.nombre : "Selecciona un servicio"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar servicio..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron servicios.</CommandEmpty>
                        <CommandGroup>
                          {servicios.map((servicioItem) => (
                            <CommandItem
                              key={servicioItem.id}
                              value={servicioItem.nombre}
                              onSelect={() => {
                                setServicioIdValue(servicioItem.id);
                                setServicioOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  servicioIdValue === servicioItem.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {servicioItem.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`categoria-tarifa-${id}`}>Categoría de afiliación</Label>
                <select
                  id={`categoria-tarifa-${id}`}
                  value={categoriaAfiliacionIdValue}
                  onChange={(event) =>
                    setCategoriaAfiliacionIdValue(Number(event.target.value))
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value={0}>Selecciona una categoría</option>
                  {categoriasDisponibles.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  En cuota moderadora el valor sale de la categoría. El
                  servicio se seguirá seleccionando en admisiones solo para
                  registrar la atención.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Valores y vigencia</p>
              <p className="text-sm text-muted-foreground">
                Define el valor y el rango de fechas de la tarifa.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`valor-tarifa-${id}`}>Valor</Label>
                <Input
                  id={`valor-tarifa-${id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorValue}
                  onChange={(event) => setValorValue(event.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`fecha-inicio-tarifa-${id}`}>Fecha inicio vigencia</Label>
                <Input
                  id={`fecha-inicio-tarifa-${id}`}
                  type="date"
                  value={fechaInicioValue}
                  onChange={(event) => setFechaInicioValue(event.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`fecha-fin-tarifa-${id}`}>Fecha fin vigencia</Label>
                <Input
                  id={`fecha-fin-tarifa-${id}`}
                  type="date"
                  value={fechaFinValue}
                  onChange={(event) => setFechaFinValue(event.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}