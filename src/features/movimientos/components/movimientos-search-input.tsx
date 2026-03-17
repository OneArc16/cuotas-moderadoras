"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function MovimientosSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [value, setValue] = useState(currentQuery);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextQuery = value.trim();

      if (nextQuery === currentQuery) return;

      const params = new URLSearchParams(searchParams.toString());

      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, currentQuery, pathname, router, searchParams]);

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Referencia o paciente"
      className="h-11 min-w-[180px] rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
    />
  );
}