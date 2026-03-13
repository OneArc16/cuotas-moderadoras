"use client";

import { z } from "zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoriaAfiliacion } from "@/features/parametrizacion/categorias-afiliacion/lib/create-categoria-afiliacion";

const categoriaAfiliacionFormSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es obligatorio")
    .max(30, "Máximo 30 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
});

type CategoriaAfiliacionFormValues = z.infer<
  typeof categoriaAfiliacionFormSchema
>;

export function CategoriaAfiliacionForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaAfiliacionFormValues>({
    resolver: zodResolver(categoriaAfiliacionFormSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
    },
  });

  function onSubmit(values: CategoriaAfiliacionFormValues) {
    startTransition(async () => {
      try {
        await createCategoriaAfiliacion(values);
        toast.success("Categoría creada correctamente");
        reset({
          codigo: "",
          nombre: "",
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear la categoría"
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
              placeholder="Ej: A"
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
              placeholder="Ej: Categoría A"
              {...register("nombre")}
            />
            {errors.nombre ? (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar categoría"}
        </Button>
      </form>
    </div>
  );
}
