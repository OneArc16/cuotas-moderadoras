import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasAnyPermission, hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

const parametrizacionModules = [
  {
    title: "Contratos",
    description: "Gestiona contratos, pagadores y categorias habilitadas por contrato.",
    href: "/parametrizacion/contratos",
    permission: RBAC_PERMISSION.CONTRACT_MANAGE,
  },
  {
    title: "Categorias de afiliacion",
    description: "Administra categorias para cuotas moderadoras y clasificacion operativa.",
    href: "/parametrizacion/categorias-afiliacion",
    permission: RBAC_PERMISSION.CATEGORY_MANAGE,
  },
  {
    title: "Servicios",
    description: "Mantiene el catalogo de servicios usados en admisiones y particulares.",
    href: "/parametrizacion/servicios",
    permission: RBAC_PERMISSION.SERVICE_MANAGE,
  },
  {
    title: "Cajas",
    description: "Configura las cajas operativas que se usan en la sesion diaria.",
    href: "/parametrizacion/cajas",
    permission: RBAC_PERMISSION.BOX_MANAGE,
  },
  {
    title: "Tarifas",
    description: "Define valores por servicio o por categoria segun el tipo de contrato.",
    href: "/parametrizacion/tarifas",
    permission: RBAC_PERMISSION.TARIFF_MANAGE,
  },
] as const;

export default async function ParametrizacionPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  const canAccessParametrizacion = hasAnyPermission(
    usuario,
    parametrizacionModules.map((module) => module.permission),
  );

  if (!canAccessParametrizacion) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Parametrizacion"
          description="Administra contratos, categorias, servicios, cajas y tarifas del sistema."
        />

        <AccessDeniedState
          title="No tienes acceso a parametrizacion"
          description="Tu perfil actual no tiene permisos para administrar la configuracion operativa del sistema."
        />
      </div>
    );
  }

  const visibleModules = parametrizacionModules.filter((module) =>
    hasPermission(usuario, module.permission),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Parametrizacion"
        description="Selecciona el area que quieres administrar segun los permisos de tu perfil."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleModules.map((module) => (
          <Card key={module.href}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
              <Link
                href={module.href}
                className="inline-flex rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium transition hover:bg-secondary/60"
              >
                Abrir modulo
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
