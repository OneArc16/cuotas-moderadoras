"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppSidebarProps = {
  usuario?: {
    nombreCompleto: string;
    username: string;
  } | null;
};

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

const OPERACION_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    shortLabel: "DB",
    description: "Inicio operativo",
  },
  {
    href: "/admisiones",
    label: "Admisiones",
    shortLabel: "AD",
    description: "Recepción y cobro",
  },
  {
    href: "/caja",
    label: "Caja",
    shortLabel: "CJ",
    description: "Apertura y cierre",
  },
  {
    href: "/movimientos",
    label: "Movimientos",
    shortLabel: "MV",
    description: "Entradas y salidas",
  },
];

const PARAMETRIZACION_ITEMS: NavItem[] = [
  {
    href: "/parametrizacion/pisos",
    label: "Pisos",
    shortLabel: "PI",
    description: "Estructura física",
  },
  {
    href: "/parametrizacion/cajas",
    label: "Cajas",
    shortLabel: "CA",
    description: "Cajas por piso",
  },
  {
    href: "/parametrizacion/modulos-atencion",
    label: "Módulos",
    shortLabel: "MO",
    description: "Puntos de atención",
  },
  {
    href: "/parametrizacion/contratos",
    label: "Contratos",
    shortLabel: "CT",
    description: "Pagadores",
  },
  {
    href: "/parametrizacion/categorias-afiliacion",
    label: "Categorías",
    shortLabel: "CG",
    description: "Afiliación",
  },
  {
    href: "/parametrizacion/servicios",
    label: "Servicios",
    shortLabel: "SV",
    description: "Catálogo asistencial",
  },
  {
    href: "/parametrizacion/tarifas",
    label: "Tarifas",
    shortLabel: "TF",
    description: "Vigencias y cobros",
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="space-y-2">
      <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>

      <nav className="space-y-1.5">
        {items.map((item) => {
          const active = isItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground hover:bg-muted/70"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${
                  active
                    ? "bg-background/15 text-background"
                    : "bg-muted text-foreground"
                }`}
              >
                {item.shortLabel}
              </div>

              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-medium ${
                    active ? "text-background" : "text-foreground"
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`truncate text-xs ${
                    active ? "text-background/80" : "text-muted-foreground"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppSidebar({ usuario }: AppSidebarProps) {
  const pathname = usePathname();

  const nombreCompleto = usuario?.nombreCompleto ?? "Usuario";
  const username = usuario?.username ?? "sin-usuario";

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[290px]">
      <div className="flex h-full flex-col rounded-[32px] border bg-background p-4 shadow-sm">
        <div className="rounded-[28px] border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background">
              CM
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Cuotas Moderadoras
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Operación diaria
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-background p-3">
            <p className="truncate text-sm font-medium">{nombreCompleto}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{username}
            </p>
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
          <NavSection
            title="Operación"
            items={OPERACION_ITEMS}
            pathname={pathname}
          />

          <NavSection
            title="Parametrización"
            items={PARAMETRIZACION_ITEMS}
            pathname={pathname}
          />
        </div>

        <div className="mt-4 rounded-2xl border bg-muted/20 p-4">
          <p className="text-sm font-medium">Flujo recomendado</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Dashboard, Caja, Admisiones y luego Movimientos.
          </p>
        </div>
      </div>
    </aside>
  );
}