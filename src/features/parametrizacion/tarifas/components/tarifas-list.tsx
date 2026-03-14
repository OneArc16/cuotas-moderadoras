"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleTarifaStatus } from "@/features/parametrizacion/tarifas/lib/toggle-tarifa-status";
import { EditTarifaDialog } from "@/features/parametrizacion/tarifas/components/edit-tarifa-dialog";

type TarifaItem = {
  id: number;
  servicioId: number;
  contratoId: number;
  categoriaAfiliacionId: number | null;
  servicio: {
    id: number;
    nombre: string;
  };
  contrato: {
    id: number;
    nombre: string;
  };
  categoriaAfiliacion: {
    id: number;
    nombre: string;
  } | null;
  tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
  valor: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string | null;
  estado: string;
};

type Option = {
  id: number;
  nombre: string;
};

type ContratoOption = {
  id: number;
  nombre: string;
  categorias: {
    id: number;
    categoriaAfiliacionId: number;
    categoriaAfiliacion: {
      id: number;
      nombre: string;
    };
  }[];
};

type TarifasListProps = {
  tarifas: TarifaItem[];
  servicios: Option[];
  contratos: ContratoOption[];
};

function formatTipoCobro(tipoCobro: string) {
  return tipoCobro === "CUOTA_MODERADORA"
    ? "Cuota moderadora"
    : "Particular";
}

function formatValor(valor: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}

function formatFecha(fechaIso: string) {
  const [year, month, day] = fechaIso.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export function TarifasList({ tarifas, servicios, contratos, }: TarifasListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: number) {
    startTransition(async () => {
      try {
        await toggleTarifaStatus(id);
        toast.success("Estado de la tarifa actualizado");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado de la tarifa"
        );
      }
    });
  }

  if (tarifas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Aún no hay tarifas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1200px] text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th className="px-4 py-3 text-left font-medium">Servicio</th>
            <th className="px-4 py-3 text-left font-medium">Contrato</th>
            <th className="px-4 py-3 text-left font-medium">Categoría</th>
            <th className="px-4 py-3 text-left font-medium">Tipo cobro</th>
            <th className="px-4 py-3 text-left font-medium">Valor</th>
            <th className="px-4 py-3 text-left font-medium">Desde</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {tarifas.map((tarifa) => (
            <tr key={tarifa.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 align-top">{tarifa.id}</td>
              <td className="px-4 py-3 align-top">{tarifa.servicio.nombre}</td>
              <td className="px-4 py-3 align-top">{tarifa.contrato.nombre}</td>
              <td className="px-4 py-3 align-top">
                {tarifa.categoriaAfiliacion?.nombre ?? "—"}
              </td>
              <td className="px-4 py-3 align-top">
                {formatTipoCobro(tarifa.tipoCobro)}
              </td>
              <td className="px-4 py-3 align-top font-medium">
                {formatValor(tarifa.valor)}
              </td>
              <td className="px-4 py-3 align-top">
                {formatFecha(tarifa.fechaInicioVigencia)}
              </td>
              <td className="px-4 py-3 align-top">{tarifa.estado}</td>
              <td className="px-4 py-3 align-top">
                <div className="flex items-center gap-2">
                  <EditTarifaDialog
                    id={tarifa.id}
                    servicioId={tarifa.servicioId}
                    contratoId={tarifa.contratoId}
                    categoriaAfiliacionId={tarifa.categoriaAfiliacionId}
                    tipoCobro={tarifa.tipoCobro}
                    valor={tarifa.valor}
                    fechaInicioVigencia={tarifa.fechaInicioVigencia}
                    fechaFinVigencia={tarifa.fechaFinVigencia}
                    servicios={servicios}
                    contratos={contratos}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggle(tarifa.id)}
                  >
                    {tarifa.estado === "ACTIVO" ? "Inactivar" : "Activar"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
