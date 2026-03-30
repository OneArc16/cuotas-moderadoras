import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicioForm } from "@/features/parametrizacion/servicios/components/servicio-form";
import { ServiciosList } from "@/features/parametrizacion/servicios/components/servicios-list";
import { getServicios } from "@/features/parametrizacion/servicios/lib/get-servicios";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function ServiciosPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.SERVICE_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Servicios"
          description="Administra el catalogo de servicios que usa la IPS."
        />

        <AccessDeniedState
          title="No tienes acceso a servicios"
          description="Tu perfil actual no tiene permisos para administrar servicios."
        />
      </div>
    );
  }

  const servicios = await getServicios();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Servicios"
        description="Aqui administras el catalogo de servicios de la IPS."
      />

      <ServicioForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de servicios registrados: {servicios.length}
          </p>

          <ServiciosList servicios={servicios} />
        </CardContent>
      </Card>
    </div>
  );
}
