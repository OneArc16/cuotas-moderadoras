"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createCaja } from "@/features/parametrizacion/cajas/lib/create-caja";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const cajaFormSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  pisoId: z.coerce.number().min(1, "Debes seleccionar un piso"),
});

type CajaFormValues = z.infer<typeof cajaFormSchema>;

type PisoOption = {
  id: number;
  nombre: string;
};

type CajaFormProps = {
  pisos: PisoOption[];
};

export function CajaForm({ pisos }: CajaFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CajaFormValues>({
    resolver: zodResolver(cajaFormSchema),
    defaultValues: {
      nombre: "",
      pisoId: 0,
    },
  });

    function onSubmit(values: CajaFormValues) {
    startTransition(async () => {
        try {
        await createCaja(values);
        toast.success("Caja creada correctamente");
        reset({
            nombre: "",
            pisoId: 0,
        });
        } catch (error) {
        toast.error(
            error instanceof Error ? error.message : "No se pudo crear la caja"
        );
        }
    });
    }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de la caja</Label>
          <Input
            id="nombre"
            placeholder="Ej: Caja Piso 1"
            {...register("nombre")}
          />
          {errors.nombre ? (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pisoId">Piso</Label>
          <select
            id="pisoId"
            {...register("pisoId")}
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value={0}>Selecciona un piso</option>
            {pisos.map((piso) => (
              <option key={piso.id} value={piso.id}>
                {piso.nombre}
              </option>
            ))}
          </select>
          {errors.pisoId ? (
            <p className="text-sm text-destructive">{errors.pisoId.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar caja"}
        </Button>
      </form>
    </div>
  );
}