import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { CategoriaAfiliacionForm } from "@/features/parametrizacion/categorias-afiliacion/components/categoria-afiliacion-form";
import { CategoriasAfiliacionList } from "@/features/parametrizacion/categorias-afiliacion/components/categorias-afiliacion-list";
import { getCategoriasAfiliacion } from "@/features/parametrizacion/categorias-afiliacion/lib/get-categorias-afiliacion";

export default async function CategoriasAfiliacionPage() {
  const categorias = await getCategoriasAfiliacion();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Categorías de afiliación"
        description="Aquí construiremos la gestión de categorías de afiliación."
      />

      <CategoriaAfiliacionForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de categorías de afiliación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de categorías registradas: {categorias.length}
          </p>

          <CategoriasAfiliacionList categorias={categorias} />
        </CardContent>
      </Card>
    </div>
  );
}
