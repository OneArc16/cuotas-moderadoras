import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { ContratoForm } from "@/features/parametrizacion/contratos/components/contrato-form";
import { ContratosList } from "@/features/parametrizacion/contratos/components/contratos-list";
import { getContratos } from "@/features/parametrizacion/contratos/lib/get-contratos";
import { getCategoriasAfiliacion } from "@/features/parametrizacion/categorias-afiliacion/lib/get-categorias-afiliacion";

export default async function ContratosPage() {
  const [contratos, categoriasAfiliacion] = await Promise.all([
    getContratos(),
    getCategoriasAfiliacion(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Contratos"
        description="Aquí construiremos la gestión de contratos y pagadores."
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

          <ContratosList contratos={contratos} categoriasAfiliacion={categoriasAfiliacion} />
        </CardContent>
      </Card>
    </div>
  );
}