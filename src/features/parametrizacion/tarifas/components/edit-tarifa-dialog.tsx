"use client";

import { useEffect, useState, useTransition } from "react";
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
  servicioId: number;
  contratoId: number;
  categoriaAfiliacionId: number | null;
  tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
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
  tipoCobro,
  valor,
  fechaInicioVigencia,
  fechaFinVigencia,
  servicios,
  contratos,
  categorias,
}: EditTarifaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [servicioOpen, setServicioOpen] = useState(false);
  const [servicioIdValue, setServicioIdValue] = useState(servicioId);
  const [contratoIdValue, setContratoIdValue] = useState(contratoId);
  const [categoriaAfiliacionIdValue, setCategoriaAfiliacionIdValue] = useState<
    number | ""
  >(categoriaAfiliacionId ?? "");
  const [tipoCobroValue, setTipoCobroValue] = useState<
    "CUOTA_MODERADORA" | "PARTICULAR"
  >(tipoCobro);
  const [valorValue, setValorValue] = useState(valor);
  const [fechaInicioValue, setFechaInicioValue] = useState(
    toDateInputValue(fechaInicioVigencia)
  );
  const [fechaFinValue, setFechaFinValue] = useState(
    toDateInputValue(fechaFinVigencia)
  );
  const [isPending, startTransition] = useTransition();

  const selectedServicio =
    servicios.find((servicio) => servicio.id === servicioIdValue) ?? null;

    const selectedContrato =
  contratos.find((contrato) => contrato.id === contratoIdValue) ?? null;

const categoriasDisponibles = selectedContrato
  ? selectedContrato.categorias.map((relacion) => ({
      id: relacion.categoriaAfiliacion.id,
      nombre: relacion.categoriaAfiliacion.nombre,
    }))
  : [];

useEffect(() => {
  if (categoriaAfiliacionIdValue === "") return;

  const categoriaSigueDisponible = categoriasDisponibles.some(
    (categoria) => categoria.id === Number(categoriaAfiliacionIdValue)
  );

  if (!categoriaSigueDisponible) {
    setCategoriaAfiliacionIdValue("");
  }
}, [categoriaAfiliacionIdValue, categoriasDisponibles]);

  useEffect(() => {
    setServicioIdValue(servicioId);
    setContratoIdValue(contratoId);
    setCategoriaAfiliacionIdValue(categoriaAfiliacionId ?? "");
    setTipoCobroValue(tipoCobro);
    setValorValue(valor);
    setFechaInicioValue(toDateInputValue(fechaInicioVigencia));
    setFechaFinValue(toDateInputValue(fechaFinVigencia));
  }, [
    servicioId,
    contratoId,
    categoriaAfiliacionId,
    tipoCobro,
    valor,
    fechaInicioVigencia,
    fechaFinVigencia,
  ]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateTarifa({
          id,
          servicioId: servicioIdValue,
          contratoId: contratoIdValue,
          categoriaAfiliacionId:
            categoriaAfiliacionIdValue === ""
              ? undefined
              : Number(categoriaAfiliacionIdValue),
          tipoCobro: tipoCobroValue,
          valor: valorValue,
          fechaInicioVigencia: fechaInicioValue,
          fechaFinVigencia: fechaFinValue || undefined,
        });

        toast.success("Tarifa actualizada correctamente");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la tarifa"
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
                Selecciona servicio, contrato y categoría.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                        !selectedServicio && "text-muted-foreground"
                      )}
                    >
                      {selectedServicio
                        ? selectedServicio.nombre
                        : "Selecciona un servicio"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar servicio..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron servicios.</CommandEmpty>
                        <CommandGroup>
                          {servicios.map((servicio) => (
                            <CommandItem
                              key={servicio.id}
                              value={servicio.nombre}
                              onSelect={() => {
                                setServicioIdValue(servicio.id);
                                setServicioOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  servicioIdValue === servicio.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {servicio.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`contrato-tarifa-${id}`}>Contrato</Label>
                <select
                  id={`contrato-tarifa-${id}`}
                  value={contratoIdValue}
                  onChange={(e) => setContratoIdValue(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {contratos.map((contrato) => (
                    <option key={contrato.id} value={contrato.id}>
                      {contrato.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`categoria-tarifa-${id}`}>
                  Categoría de afiliación
                </Label>
                <select
                  id={`categoria-tarifa-${id}`}
                  value={categoriaAfiliacionIdValue}
                  onChange={(e) =>
                    setCategoriaAfiliacionIdValue(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  disabled={!selectedContrato}
                >
                  <option value="">
                    {selectedContrato ? "Sin categoría" : "Primero selecciona un contrato"}
                  </option>
                  {categoriasDisponibles.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`tipo-cobro-tarifa-${id}`}>
                  Tipo de cobro
                </Label>
                <select
                  id={`tipo-cobro-tarifa-${id}`}
                  value={tipoCobroValue}
                  onChange={(e) =>
                    setTipoCobroValue(
                      e.target.value as "CUOTA_MODERADORA" | "PARTICULAR"
                    )
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="CUOTA_MODERADORA">CUOTA MODERADORA</option>
                  <option value="PARTICULAR">PARTICULAR</option>
                </select>
              </div>
            </div>
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
                  onChange={(e) => setValorValue(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`fecha-inicio-tarifa-${id}`}>
                  Fecha inicio vigencia
                </Label>
                <Input
                  id={`fecha-inicio-tarifa-${id}`}
                  type="date"
                  value={fechaInicioValue}
                  onChange={(e) => setFechaInicioValue(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`fecha-fin-tarifa-${id}`}>
                  Fecha fin vigencia
                </Label>
                <Input
                  id={`fecha-fin-tarifa-${id}`}
                  type="date"
                  value={fechaFinValue}
                  onChange={(e) => setFechaFinValue(e.target.value)}
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