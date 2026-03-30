"use client";

import { CalendarDays, X } from "lucide-react";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterCombobox } from "@/components/shared/ui/filter-combobox";

type CajaOption = {
  id: number;
  nombre: string;
};

type ReportesFiltersProps = {
  desde: string;
  hasta: string;
  cajaId: string;
  cajas: CajaOption[];
};

function FilterDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}

export function ReportesFilters({
  desde,
  hasta,
  cajaId,
  cajas,
}: ReportesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cajaOptions = cajas.map((caja) => ({
    value: String(caja.id),
    label: caja.nombre,
  }));

  const updateParams = useCallback(
    (next: {
      desde?: string;
      hasta?: string;
      cajaId?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      const setOrDelete = (key: string, value?: string) => {
        const cleanValue = value?.trim() ?? "";

        if (cleanValue) {
          params.set(key, cleanValue);
        } else {
          params.delete(key);
        }
      };

      setOrDelete("desde", next.desde);
      setOrDelete("hasta", next.hasta);
      setOrDelete("cajaId", next.cajaId);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="rounded-[24px] border bg-muted/20 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <FilterDateInput
          value={desde}
          onChange={(value) =>
            updateParams({
              desde: value,
              hasta,
              cajaId,
            })
          }
        />

        <FilterDateInput
          value={hasta}
          onChange={(value) =>
            updateParams({
              desde,
              hasta: value,
              cajaId,
            })
          }
        />

        <FilterCombobox
          value={cajaId}
          onChange={(value) =>
            updateParams({
              desde,
              hasta,
              cajaId: value,
            })
          }
          options={cajaOptions}
          placeholder="Todas las cajas"
          searchPlaceholder="Buscar caja..."
          emptyText="No hay cajas"
        />

        <button
          type="button"
          onClick={() => router.replace(pathname)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      </div>
    </div>
  );
}