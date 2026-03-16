"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "ACTIVO", label: "Activos" },
  { value: "INACTIVO", label: "Inactivos" },
  { value: "BLOQUEADO", label: "Bloqueados" },
];

export function ColaboradoresEstadoFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentEstado = searchParams.get("estado") ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("estado", value);
    } else {
      params.delete("estado");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <select
      value={currentEstado}
      onChange={(event) => handleChange(event.target.value)}
      className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground md:w-[220px]"
    >
      {ESTADOS.map((estado) => (
        <option key={estado.value || "ALL"} value={estado.value}>
          {estado.label}
        </option>
      ))}
    </select>
  );
}