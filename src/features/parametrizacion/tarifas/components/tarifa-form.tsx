"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createTarifa } from "@/features/parametrizacion/tarifas/lib/create-tarifa";
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

const tarifaFormSchema = z.object({
  servicioId: z.coerce.number().min(1, "Debes seleccionar un servicio"),
  contratoId: z.coerce.number().min(1, "Debes seleccionar un contrato"),
  categoriaAfiliacionId: z.coerce.number().optional(),
  tipoCobro: z.enum(["CUOTA_MODERADORA", "PARTICULAR"]),
  valor: z
    .string()
    .min(1, "El valor es obligatorio")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Debes ingresar un valor válido",
    }),
  fechaInicioVigencia: z.string().min(1, "La fecha inicial es obligatoria"),
  fechaFinVigencia: z.string().optional(),
});

type TarifaFormValues = z.infer<typeof tarifaFormSchema>;

type Option = {
  id: number;
  nombre: string;
};

type TarifaFormProps = {
  servicios: Option[];
  contratos: Option[];
  categorias: Option[];
};

export function TarifaForm({
  servicios,
  contratos,
  categorias,
}: TarifaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [servicioOpen, setServicioOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TarifaFormValues>({
    resolver: zodResolver(tarifaFormSchema),
    defaultValues: {
      servicioId: 0,
      contratoId: 0,
      categoriaAfiliacionId: undefined,
      tipoCobro: "CUOTA_MODERADORA",
      valor: "",
      fechaInicioVigencia: "",
      fechaFinVigencia: "",
    },
  });

  const servicioIdValue = watch("servicioId");
  const selectedServicio =
    servicios.find((servicio) => servicio.id === servicioIdValue) ?? null;

  function onSubmit(values: TarifaFormValues) {
    startTransition(async () => {
      try {
        await createTarifa(values);
        toast.success("Tarifa creada correctamente");
        reset({
          servicioId: 0,
          contratoId: 0,
          categoriaAfiliacionId: undefined,
          tipoCobro: "CUOTA_MODERADORA",
          valor: "",
          fechaInicioVigencia: "",
          fechaFinVigencia: "",
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo crear la tarifa"
        );
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
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
                            setValue("servicioId", servicio.id, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
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

            {errors.servicioId ? (
              <p className="text-sm text-destructive">
                {errors.servicioId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contratoId">Contrato</Label>
            <select
              id="contratoId"
              {...register("contratoId")}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value={0}>Selecciona un contrato</option>
              {contratos.map((contrato) => (
                <option key={contrato.id} value={contrato.id}>
                  {contrato.nombre}
                </option>
              ))}
            </select>
            {errors.contratoId ? (
              <p className="text-sm text-destructive">
                {errors.contratoId.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoriaAfiliacionId">
              Categoría de afiliación
            </Label>
            <select
              id="categoriaAfiliacionId"
              {...register("categoriaAfiliacionId")}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Sin categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoCobro">Tipo de cobro</Label>
            <select
              id="tipoCobro"
              {...register("tipoCobro")}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="CUOTA_MODERADORA">CUOTA MODERADORA</option>
              <option value="PARTICULAR">PARTICULAR</option>
            </select>
            {errors.tipoCobro ? (
              <p className="text-sm text-destructive">
                {errors.tipoCobro.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 12500"
              {...register("valor")}
            />
            {errors.valor ? (
              <p className="text-sm text-destructive">{errors.valor.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicioVigencia">Fecha inicio vigencia</Label>
            <Input
              id="fechaInicioVigencia"
              type="date"
              {...register("fechaInicioVigencia")}
            />
            {errors.fechaInicioVigencia ? (
              <p className="text-sm text-destructive">
                {errors.fechaInicioVigencia.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFinVigencia">Fecha fin vigencia</Label>
            <Input
              id="fechaFinVigencia"
              type="date"
              {...register("fechaFinVigencia")}
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