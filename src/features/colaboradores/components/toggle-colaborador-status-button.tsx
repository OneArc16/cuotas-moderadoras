"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { toggleColaboradorStatus } from "@/features/colaboradores/lib/toggle-colaborador-status";

type ToggleColaboradorStatusButtonProps = {
  id: number;
  estado: "ACTIVO" | "INACTIVO" | "BLOQUEADO";
};

export function ToggleColaboradorStatusButton({
  id,
  estado,
}: ToggleColaboradorStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const accionLabel = estado === "ACTIVO" ? "Inactivar" : "Activar";

  function handleClick() {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", String(id));

        await toggleColaboradorStatus(formData);

        toast.success(`Colaborador ${accionLabel.toLowerCase()}do correctamente.`);
        router.refresh();
      } catch (error) {
        console.error("Error al cambiar estado del colaborador:", error);
        toast.error("No se pudo cambiar el estado del colaborador.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex rounded-xl border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Guardando..." : accionLabel}
    </button>
  );
}