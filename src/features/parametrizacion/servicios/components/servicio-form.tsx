"use client";

import { z } from "zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServicio } from "@/features/parametrizacion/servicios/lib/create-servicio";

const servicioFormSchema = z.object({
  codigo: z.string().max(30, "Máximo 30 caracteres").optional(),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
});

type ServicioFormValues = z.infer<typeof servicioFormSchema>;

export function ServicioForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioFormSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
    },
  });

  function onSubmit(values: ServicioFormValues) {
    startTransition(async () => {
      try {
        await createServicio(values);
        toast.success("Servicio creado correctamente");
        reset({
          codigo: "",
          nombre: "",
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo crear el servicio"
        );
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              placeholder="Ej: MED-GEN"
              {...register("codigo")}
            />
            {errors.codigo ? (
              <p className="text-sm text-destructive">{errors.codigo.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ej: Medicina general"
              {...register("nombre")}
            />
            {errors.nombre ? (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar servicio"}
        </Button>
      </form>
    </div>
  );
}
