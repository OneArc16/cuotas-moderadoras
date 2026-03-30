"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  RBAC_PERMISSION,
  type PermissionCode,
} from "@/lib/rbac/definitions";

type AppSidebarProps = {
  usuario?: {
    nombreCompleto: string;
    username: string;
  } | null;
  permissionCodes?: PermissionCode[];
};

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  permission: PermissionCode;
};

const OPERACION_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    shortLabel: "DB",
    description: "Inicio operativo",
    permission: RBAC_PERMISSION.DASHBOARD_VIEW,
  },
  {
    href: "/admisiones",
    label: "Admisiones",
    shortLabel: "AD",
    description: "Recepcion y cobro",
    permission: RBAC_PERMISSION.ADMISION_VIEW,
  },
  {
    href: "/caja",
    label: "Caja",
    shortLabel: "CJ",
    description: "Apertura y cierre",
    permission: RBAC_PERMISSION.CAJA_VIEW,
  },
  {
    href: "/movimientos",
    label: "Movimientos",
    shortLabel: "MV",
    description: "Entradas y salidas",
    permission: RBAC_PERMISSION.MOVEMENT_VIEW,
  },
];

const PARAMETRIZACION_ITEMS: NavItem[] = [
  {
    href: "/parametrizacion/cajas",
    label: "Cajas",
    shortLabel: "CA",
    description: "Puntos de recaudo",
    permission: RBAC_PERMISSION.BOX_MANAGE,
  },
  {
    href: "/parametrizacion/contratos",
    label: "Contratos",
    shortLabel: "CT",
    description: "Pagadores",
    permission: RBAC_PERMISSION.CONTRACT_MANAGE,
  },
  {
    href: "/parametrizacion/categorias-afiliacion",
    label: "Categorias",
    shortLabel: "CG",
    description: "Afiliacion",
    permission: RBAC_PERMISSION.CATEGORY_MANAGE,
  },
  {
    href: "/parametrizacion/servicios",
    label: "Servicios",
    shortLabel: "SV",
    description: "Catalogo asistencial",
    permission: RBAC_PERMISSION.SERVICE_MANAGE,
  },
  {
    href: "/parametrizacion/tarifas",
    label: "Tarifas",
    shortLabel: "TF",
    description: "Vigencias y cobros",
    permission: RBAC_PERMISSION.TARIFF_MANAGE,
  },
];

const ADMINISTRACION_ITEMS: NavItem[] = [
  {
    href: "/colaboradores",
    label: "Colaboradores",
    shortLabel: "CL",
    description: "Usuarios internos",
    permission: RBAC_PERMISSION.COLLABORATOR_MANAGE,
  },
  {
    href: "/seguridad",
    label: "Seguridad",
    shortLabel: "SG",
    description: "Roles y permisos",
    permission: RBAC_PERMISSION.SECURITY_MANAGE,
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
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="px-2 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>

      <nav className="space-y-1.5">
        {items.map((item) => {
          const active = isItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-[20px] border px-3 py-2.5 transition-colors ${
                active
                  ? "border-transparent bg-foreground text-background shadow-[0_16px_30px_-24px_color-mix(in_oklab,var(--foreground)_90%,transparent)]"
                  : "border-transparent text-foreground hover:bg-secondary/70"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] text-[0.72rem] font-semibold ${
                  active
                    ? "bg-background/15 text-background"
                    : "border border-border/60 bg-background/90 text-foreground"
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
                  className={`truncate text-[0.82rem] ${
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

export function AppSidebar({ usuario, permissionCodes = [] }: AppSidebarProps) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const allowedPermissions = useMemo(
    () => new Set(permissionCodes),
    [permissionCodes],
  );

  const visibleOperacionItems = OPERACION_ITEMS.filter((item) =>
    allowedPermissions.has(item.permission),
  );
  const visibleParametrizacionItems = PARAMETRIZACION_ITEMS.filter((item) =>
    allowedPermissions.has(item.permission),
  );
  const visibleAdministracionItems = ADMINISTRACION_ITEMS.filter((item) =>
    allowedPermissions.has(item.permission),
  );

  const nombreCompleto = usuario?.nombreCompleto ?? "Usuario";
  const username = usuario?.username ?? "sin-usuario";

  async function handleSignOut() {
    try {
      setIsSigningOut(true);

      await authClient.signOut();

      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
      toast.error("No se pudo cerrar la sesion. Intenta nuevamente.");
      setIsSigningOut(false);
    }
  }

  return (
    <aside className="w-full xl:sticky xl:top-5 xl:h-[calc(100vh-2.5rem)] xl:w-[272px] 2xl:w-[288px]">
      <div className="flex h-full flex-col rounded-[28px] border border-border/80 bg-card/95 p-3.5 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-sm">
        <div className="rounded-[24px] border border-border/70 bg-secondary/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-foreground text-sm font-semibold text-background">
              CM
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
                Cuotas Moderadoras
              </p>
              <p className="truncate text-[0.82rem] text-muted-foreground">
                Operacion diaria
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-border/60 bg-background/90 p-3">
            <p className="truncate text-sm font-medium text-foreground">
              {nombreCompleto}
            </p>
            <p className="truncate text-[0.82rem] text-muted-foreground">
              @{username}
            </p>
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          <NavSection
            title="Operacion"
            items={visibleOperacionItems}
            pathname={pathname}
          />
          <NavSection
            title="Parametrizacion"
            items={visibleParametrizacionItems}
            pathname={pathname}
          />
          <NavSection
            title="Administracion"
            items={visibleAdministracionItems}
            pathname={pathname}
          />
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-[20px] border border-border/70 bg-secondary/35 p-4">
            <p className="text-sm font-medium text-foreground">Flujo recomendado</p>
            <p className="mt-1 text-[0.82rem] leading-5 text-muted-foreground">
              Dashboard, Caja, Admisiones y luego Movimientos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-border/70 bg-background/90 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cerrando sesion...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
