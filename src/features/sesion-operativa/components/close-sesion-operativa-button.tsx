"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { closeSesionOperativaActual } from "@/features/sesion-operativa/lib/close-sesion-operativa-actual";

export function CloseSesionOperativaButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    startTransition(async () => {
      try {
        await closeSesionOperativaActual();
        toast.success("Sesión operativa cerrada correctamente");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cerrar la sesión operativa"
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClose}
      disabled={isPending}
    >
      {isPending ? "Cerrando..." : "Cerrar sesión operativa"}
    </Button>
  );
}