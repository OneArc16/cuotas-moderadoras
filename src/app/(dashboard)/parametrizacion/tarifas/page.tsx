import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { TarifasList } from "@/features/parametrizacion/tarifas/components/tarifas-list";
import { getTarifas } from "@/features/parametrizacion/tarifas/lib/get-tarifas";

export default async function TarifasPage() {
  const tarifas = await getTarifas();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Tarifas"
        description="Aquí construiremos la gestión de tarifas por contrato, servicio, categoría y vigencia."
      />

      <Card>
        <CardHeader>
          <CardTitle>Listado de tarifas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de tarifas registradas: {tarifas.length}
          </p>

          <TarifasList tarifas={tarifas} />
        </CardContent>
      </Card>
    </div>
  );
}
