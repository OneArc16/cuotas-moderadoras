import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContratoForm } from "@/features/parametrizacion/contratos/components/contrato-form";
import { ContratosList } from "@/features/parametrizacion/contratos/components/contratos-list";
import { getContratos } from "@/features/parametrizacion/contratos/lib/get-contratos";
import { getCategoriasAfiliacion } from "@/features/parametrizacion/categorias-afiliacion/lib/get-categorias-afiliacion";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function ContratosPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.CONTRACT_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Contratos"
          description="Administra contratos, pagadores y categorias habilitadas por contrato."
        />

        <AccessDeniedState
          title="No tienes acceso a contratos"
          description="Tu perfil actual no tiene permisos para administrar contratos."
        />
      </div>
    );
  }

  const [contratos, categoriasAfiliacion] = await Promise.all([
    getContratos(),
    getCategoriasAfiliacion(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Contratos"
        description="Aqui administras contratos, pagadores y categorias habilitadas."
      />

      <ContratoForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de contratos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de contratos registrados: {contratos.length}
          </p>

          <ContratosList
            contratos={contratos}
            categoriasAfiliacion={categoriasAfiliacion}
          />
        </CardContent>
      </Card>
    </div>
  );
}
