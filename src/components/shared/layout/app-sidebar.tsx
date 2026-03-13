"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  Settings2,
  Users,
  Shield,
  FileText,
  Building2,
  Monitor,
  Vault,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Admisiones", href: "/admisiones", icon: Receipt },
  { title: "Caja", href: "/caja", icon: Wallet },
  { title: "Reportes", href: "/reportes", icon: BarChart3 },
  { title: "Parametrización", href: "/parametrizacion", icon: Settings2 },
  { title: "Pisos", href: "/parametrizacion/pisos", icon: Building2 },
  { title: "Módulos de atención", href: "/parametrizacion/modulos-atencion", icon: Monitor },
  { title: "Cajas", href: "/parametrizacion/cajas", icon: Vault },
  { title: "Contratos", href: "/parametrizacion/contratos", icon: FileText },
  { title: "Colaboradores", href: "/colaboradores", icon: Users },
  { title: "Seguridad", href: "/seguridad", icon: Shield },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">
              Cuotas Moderadoras
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Panel principal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-2 py-3">
        <p className="text-xs text-muted-foreground">
          Sistema interno IPS
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}