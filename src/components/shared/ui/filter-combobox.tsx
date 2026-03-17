"use client";

import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ComboboxOption = {
  value: string;
  label: string;
};

type FilterComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
};

export function FilterCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyText = "No hay resultados",
}: FilterComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    return () => clearTimeout(timeout);
  }, [open]);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-background px-4 text-sm text-foreground shadow-sm transition hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/15"
      >
        <span className={selectedOption ? "truncate" : "truncate text-muted-foreground"}>
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[22px] border border-border bg-background p-2 shadow-xl">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-2xl bg-muted/40 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:bg-muted/60"
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-2xl">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                value === ""
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <span>{placeholder}</span>
              {value === "" ? <Check className="h-4 w-4" /> : null}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const active = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}