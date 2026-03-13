"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { toast } from "sonner";
import { createModuloAtencion } from "@/features/parametrizacion/modulos-atencion/lib/create-modulo-atencion";

const moduloAtencionFormSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es obligatorio")
    .max(30, "Máximo 30 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  pisoId: z.coerce.number().min(1, "Debes seleccionar un piso"),
});

type ModuloAtencionFormValues = z.infer<typeof moduloAtencionFormSchema>;

type PisoOption = {
  id: number;
  nombre: string;
};

type ModuloAtencionFormProps = {
  pisos: PisoOption[];
};

export function ModuloAtencionForm({ pisos }: ModuloAtencionFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuloAtencionFormValues>({
    resolver: zodResolver(moduloAtencionFormSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      pisoId: 0,
    },
  });

  function onSubmit(values: ModuloAtencionFormValues) {
    startTransition(async () => {
      try {
        await createModuloAtencion(values);
        toast.success("Módulo creado correctamente");
        reset({
          codigo: "",
          nombre: "",
          pisoId: 0,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el módulo"
        );
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código del módulo</Label>
            <Input
              id="codigo"
              placeholder="Ej: MOD-1"
              {...register("codigo")}
            />
            {errors.codigo ? (
              <p className="text-sm text-destructive">
                {errors.codigo.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del módulo</Label>
            <Input
              id="nombre"
              placeholder="Ej: Módulo 1"
              {...register("nombre")}
            />
            {errors.nombre ? (
              <p className="text-sm text-destructive">
                {errors.nombre.message}
              </p>
            ) : null}
          </div>
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
          {isPending ? "Guardando..." : "Guardar módulo"}
        </Button>
      </form>
    </div>
  );
}