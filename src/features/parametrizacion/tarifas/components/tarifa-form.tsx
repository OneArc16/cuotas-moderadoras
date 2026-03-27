"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createTarifa } from "@/features/parametrizacion/tarifas/lib/create-tarifa";
import { cn } from "@/lib/utils";

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

type TarifaFormProps = {
  servicios: Option[];
  contratos: ContratoOption[];
};

export function TarifaForm({ servicios, contratos }: TarifaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [servicioOpen, setServicioOpen] = useState(false);
  const [contratoId, setContratoId] = useState(0);
  const [servicioId, setServicioId] = useState(0);
  const [categoriaAfiliacionId, setCategoriaAfiliacionId] = useState(0);
  const [valor, setValor] = useState("");
  const [fechaInicioVigencia, setFechaInicioVigencia] = useState("");
  const [fechaFinVigencia, setFechaFinVigencia] = useState("");

  const selectedContrato = useMemo(
    () => contratos.find((contrato) => contrato.id === contratoId) ?? null,
    [contratoId, contratos],
  );

  const selectedServicio = useMemo(
    () => servicios.find((servicio) => servicio.id === servicioId) ?? null,
    [servicioId, servicios],
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

  function resetForm() {
    setContratoId(0);
    setServicioId(0);
    setCategoriaAfiliacionId(0);
    setValor("");
    setFechaInicioVigencia("");
    setFechaFinVigencia("");
  }

  function handleContratoChange(nextContratoId: number) {
    setContratoId(nextContratoId);
    setServicioId(0);
    setCategoriaAfiliacionId(0);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await createTarifa({
          contratoId,
          servicioId: contratoEsParticular && servicioId > 0 ? servicioId : undefined,
          categoriaAfiliacionId:
            !contratoEsParticular && categoriaAfiliacionId > 0
              ? categoriaAfiliacionId
              : undefined,
          valor,
          fechaInicioVigencia,
          fechaFinVigencia: fechaFinVigencia || undefined,
        });

        toast.success("Tarifa creada correctamente");
        resetForm();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo crear la tarifa",
        );
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contratoId">Contrato</Label>
            <select
              id="contratoId"
              value={contratoId}
              onChange={(event) => handleContratoChange(Number(event.target.value))}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value={0}>Selecciona un contrato</option>
              {contratos.map((contrato) => (
                <option key={contrato.id} value={contrato.id}>
                  {contrato.nombre} · {contrato.tipo}
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
            <Label htmlFor="servicioId">Servicio</Label>
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
                      {servicios.map((servicio) => (
                        <CommandItem
                          key={servicio.id}
                          value={servicio.nombre}
                          onSelect={() => {
                            setServicioId(servicio.id);
                            setServicioOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              servicioId === servicio.id ? "opacity-100" : "opacity-0",
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
            <p className="text-sm text-muted-foreground">
              Para contratos particulares, la tarifa se define por servicio individual.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="categoriaAfiliacionId">Categoría de afiliación</Label>
            <select
              id="categoriaAfiliacionId"
              value={categoriaAfiliacionId}
              onChange={(event) => setCategoriaAfiliacionId(Number(event.target.value))}
              disabled={!selectedContrato}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value={0}>
                {selectedContrato
                  ? "Selecciona una categoría"
                  : "Primero selecciona un contrato"}
              </option>
              {categoriasDisponibles.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              Para contratos no particulares, la cuota moderadora se define por categoría. El servicio se seleccionará en admisiones solo para registrar la atención.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 12500"
              value={valor}
              onChange={(event) => setValor(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicioVigencia">Fecha inicio vigencia</Label>
            <Input
              id="fechaInicioVigencia"
              type="date"
              value={fechaInicioVigencia}
              onChange={(event) => setFechaInicioVigencia(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFinVigencia">Fecha fin vigencia</Label>
            <Input
              id="fechaFinVigencia"
              type="date"
              value={fechaFinVigencia}
              onChange={(event) => setFechaFinVigencia(event.target.value)}
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar tarifa"}
        </Button>
      </form>
    </div>
  );
}