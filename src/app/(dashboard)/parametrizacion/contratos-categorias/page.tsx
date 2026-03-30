import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function ContratosCategoriasPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.CONTRACT_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Contratos - Categorias"
          description="Administra la asignacion de categorias de afiliacion por contrato."
        />

        <AccessDeniedState
          title="No tienes acceso a contratos - categorias"
          description="Tu perfil actual no tiene permisos para administrar asignaciones de categorias por contrato."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Contratos - Categorias"
        description="Aqui construiremos la asignacion de categorias de afiliacion a contratos."
      />

      <Card>
        <CardHeader>
          <CardTitle>Asignaciones de contratos y categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aqui mostraremos la tabla de asignaciones y sus acciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
