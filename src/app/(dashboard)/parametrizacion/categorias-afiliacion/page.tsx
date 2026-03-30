import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoriaAfiliacionForm } from "@/features/parametrizacion/categorias-afiliacion/components/categoria-afiliacion-form";
import { CategoriasAfiliacionList } from "@/features/parametrizacion/categorias-afiliacion/components/categorias-afiliacion-list";
import { getCategoriasAfiliacion } from "@/features/parametrizacion/categorias-afiliacion/lib/get-categorias-afiliacion";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function CategoriasAfiliacionPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.CATEGORY_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Categorias de afiliacion"
          description="Administra categorias usadas para cuotas moderadoras y clasificacion operativa."
        />

        <AccessDeniedState
          title="No tienes acceso a categorias de afiliacion"
          description="Tu perfil actual no tiene permisos para administrar categorias de afiliacion."
        />
      </div>
    );
  }

  const categorias = await getCategoriasAfiliacion();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Categorias de afiliacion"
        description="Aqui administras las categorias de afiliacion disponibles en el sistema."
      />

      <CategoriaAfiliacionForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de categorias de afiliacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de categorias registradas: {categorias.length}
          </p>

          <CategoriasAfiliacionList categorias={categorias} />
        </CardContent>
      </Card>
    </div>
  );
}
