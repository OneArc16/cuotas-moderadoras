import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CajaForm } from "@/features/parametrizacion/cajas/components/caja-form";
import { CajasList } from "@/features/parametrizacion/cajas/components/cajas-list";
import { getCajas } from "@/features/parametrizacion/cajas/lib/get-cajas";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function CajasPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.BOX_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Cajas"
          description="Administra las cajas operativas del sistema."
        />

        <AccessDeniedState
          title="No tienes acceso a cajas"
          description="Tu perfil actual no tiene permisos para administrar cajas operativas."
        />
      </div>
    );
  }

  const cajas = await getCajas();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Cajas"
        description="Aqui gestionas las cajas operativas que se usaran directamente en la sesion diaria."
      />

      <CajaForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de cajas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de cajas registradas: {cajas.length}
          </p>

          <CajasList cajas={cajas} />
        </CardContent>
      </Card>
    </div>
  );
}
