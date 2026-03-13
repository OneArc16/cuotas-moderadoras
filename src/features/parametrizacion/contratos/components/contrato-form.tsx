"use client";

import { z } from "zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContrato } from "@/features/parametrizacion/contratos/lib/create-contrato";

const contratoFormSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  tipo: z.enum(["EPS", "PARTICULAR", "OTRO"], {
    error: "Debes seleccionar un tipo",
  }),
});

type ContratoFormValues = z.infer<typeof contratoFormSchema>;

export function ContratoForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContratoFormValues>({
    resolver: zodResolver(contratoFormSchema),
    defaultValues: {
      nombre: "",
      tipo: "EPS",
    },
  });

  function onSubmit(values: ContratoFormValues) {
    startTransition(async () => {
      try {
        await createContrato(values);
        toast.success("Contrato creado correctamente");
        reset({
          nombre: "",
          tipo: "EPS",
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo crear el contrato"
        );
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del contrato</Label>
          <Input
            id="nombre"
            placeholder="Ej: Coosalud contributivo"
            {...register("nombre")}
          />
          {errors.nombre ? (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <select
            id="tipo"
            {...register("tipo")}
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="EPS">EPS</option>
            <option value="PARTICULAR">PARTICULAR</option>
            <option value="OTRO">OTRO</option>
          </select>
          {errors.tipo ? (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar contrato"}
        </Button>
      </form>
    </div>
  );
}