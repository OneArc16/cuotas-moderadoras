import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { ContratoForm } from "@/features/parametrizacion/contratos/components/contrato-form";
import { ContratosList } from "@/features/parametrizacion/contratos/components/contratos-list";
import { getContratos } from "@/features/parametrizacion/contratos/lib/get-contratos";

export default async function ContratosPage() {
  const contratos = await getContratos();

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

          <ContratosList contratos={contratos} />
        </CardContent>
      </Card>
    </div>
  );
}