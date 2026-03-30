import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PisoForm } from "@/features/parametrizacion/pisos/components/piso-form";
import { PisosList } from "@/features/parametrizacion/pisos/components/pisos-list";
import { getPisos } from "@/features/parametrizacion/pisos/lib/get-pisos";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function PisosPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.BOX_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Pisos"
          description="Consulta o administra la estructura fisica legada si todavia aplica."
        />

        <AccessDeniedState
          title="No tienes acceso a pisos"
          description="Tu perfil actual no tiene permisos para administrar estructuras fisicas legadas."
        />
      </div>
    );
  }

  const pisos = await getPisos();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Pisos"
        description="Aqui se mantiene la gestion legacy de pisos para escenarios de compatibilidad."
      />

      <PisoForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de pisos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de pisos registrados: {pisos.length}
          </p>

          <PisosList pisos={pisos} />
        </CardContent>
      </Card>
    </div>
  );
}
