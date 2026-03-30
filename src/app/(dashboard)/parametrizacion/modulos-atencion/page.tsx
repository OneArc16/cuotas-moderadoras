import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuloAtencionForm } from "@/features/parametrizacion/modulos-atencion/components/modulo-atencion-form";
import { ModulosAtencionList } from "@/features/parametrizacion/modulos-atencion/components/modulos-atencion-list";
import { getModulosAtencion } from "@/features/parametrizacion/modulos-atencion/lib/get-modulos-atencion";
import { getPisos } from "@/features/parametrizacion/pisos/lib/get-pisos";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function ModulosAtencionPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.BOX_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Modulos de atencion"
          description="Consulta o administra la estructura fisica legada si todavia aplica."
        />

        <AccessDeniedState
          title="No tienes acceso a modulos de atencion"
          description="Tu perfil actual no tiene permisos para administrar estructuras fisicas legadas."
        />
      </div>
    );
  }

  const [modulos, pisos] = await Promise.all([
    getModulosAtencion(),
    getPisos(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Modulos de atencion"
        description="Aqui se mantiene la gestion legacy de modulos fisicos para escenarios de compatibilidad."
      />

      <ModuloAtencionForm pisos={pisos} />

      <Card>
        <CardHeader>
          <CardTitle>Listado de modulos de atencion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de modulos registrados: {modulos.length}
          </p>

          <ModulosAtencionList modulos={modulos} pisos={pisos} />
        </CardContent>
      </Card>
    </div>
  );
}
