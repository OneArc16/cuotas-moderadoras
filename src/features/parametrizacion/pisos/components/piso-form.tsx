"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createPiso } from "@/features/parametrizacion/pisos/lib/create-piso";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const pisoFormSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
});

type PisoFormValues = z.infer<typeof pisoFormSchema>;

export function PisoForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PisoFormValues>({
    resolver: zodResolver(pisoFormSchema),
    defaultValues: {
      nombre: "",
    },
  });

    function onSubmit(values: PisoFormValues) {
    startTransition(async () => {
        try {
        await createPiso(values);
        toast.success("Piso creado correctamente");
        reset({
          codigo: "",
          nombre: "", 
        });
        } catch (error) {
        toast.error(
            error instanceof Error ? error.message : "No se pudo crear el piso"
        );
        }
    });
    }

  return (
    <div className="rounded-xl border p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del piso</Label>
          <Input id="nombre" placeholder="Ej: Piso 1" {...register("nombre")} />
          {errors.nombre ? (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar piso"}
        </Button>
      </form>
    </div>
  );
}