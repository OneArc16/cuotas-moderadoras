"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function ColaboradoresSearchInput() {
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
      placeholder="Buscar por nombre, documento, usuario o correo"
      className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground md:w-[340px]"
    />
  );
}