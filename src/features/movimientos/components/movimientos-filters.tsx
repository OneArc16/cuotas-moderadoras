"use client";

import { CalendarDays, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterCombobox } from "@/components/shared/ui/filter-combobox";

const METODOS_PAGO = [
  "EFECTIVO",
  "NEQUI",
  "DAVIPLATA",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
] as const;

type OptionItem = {
  id: number;
  nombre: string;
};

type MovimientosFiltersProps = {
  desde: string;
  hasta: string;
  metodo: string;
  q: string;
  cajaId: string;
  moduloId: string;
  cajas: OptionItem[];
  modulos: OptionItem[];
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

export function MovimientosFilters({
  desde,
  hasta,
  metodo,
  q,
  cajaId,
  moduloId,
  cajas,
  modulos,
}: MovimientosFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(q);

  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  const metodoOptions = useMemo(
    () =>
      METODOS_PAGO.map((item) => ({
        value: item,
        label: item,
      })),
    [],
  );

  const cajaOptions = useMemo(
    () =>
      cajas.map((caja) => ({
        value: String(caja.id),
        label: caja.nombre,
      })),
    [cajas],
  );

  const moduloOptions = useMemo(
    () =>
      modulos.map((modulo) => ({
        value: String(modulo.id),
        label: modulo.nombre,
      })),
    [modulos],
  );

  const updateParams = useCallback(
    (next: {
      desde?: string;
      hasta?: string;
      metodo?: string;
      q?: string;
      cajaId?: string;
      moduloId?: string;
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
      setOrDelete("metodo", next.metodo);
      setOrDelete("q", next.q);
      setOrDelete("cajaId", next.cajaId);
      setOrDelete("moduloId", next.moduloId);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const cleanSearch = searchValue.trim();
      const currentSearch = q.trim();

      if (cleanSearch === currentSearch) return;

      updateParams({
        desde,
        hasta,
        metodo,
        q: searchValue,
        cajaId,
        moduloId,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    searchValue,
    q,
    desde,
    hasta,
    metodo,
    cajaId,
    moduloId,
    updateParams,
  ]);

  return (
    <div className="rounded-[24px] border bg-muted/20 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <FilterDateInput
          value={desde}
          onChange={(value) =>
            updateParams({
              desde: value,
              hasta,
              metodo,
              q: searchValue,
              cajaId,
              moduloId,
            })
          }
        />

        <FilterDateInput
          value={hasta}
          onChange={(value) =>
            updateParams({
              desde,
              hasta: value,
              metodo,
              q: searchValue,
              cajaId,
              moduloId,
            })
          }
        />

        <FilterCombobox
          value={metodo}
          onChange={(value) =>
            updateParams({
              desde,
              hasta,
              metodo: value,
              q: searchValue,
              cajaId,
              moduloId,
            })
          }
          options={metodoOptions}
          placeholder="Todos los métodos"
          searchPlaceholder="Buscar método..."
          emptyText="No hay métodos"
        />

        <FilterCombobox
          value={cajaId}
          onChange={(value) =>
            updateParams({
              desde,
              hasta,
              metodo,
              q: searchValue,
              cajaId: value,
              moduloId,
            })
          }
          options={cajaOptions}
          placeholder="Todas las cajas"
          searchPlaceholder="Buscar caja..."
          emptyText="No hay cajas"
        />

        <FilterCombobox
          value={moduloId}
          onChange={(value) =>
            updateParams({
              desde,
              hasta,
              metodo,
              q: searchValue,
              cajaId,
              moduloId: value,
            })
          }
          options={moduloOptions}
          placeholder="Todos los módulos"
          searchPlaceholder="Buscar módulo..."
          emptyText="No hay módulos"
        />

        <div className="flex flex-col gap-3 sm:flex-row xl:col-span-3 2xl:col-span-1">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Referencia o paciente"
              className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              router.replace(pathname);
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}