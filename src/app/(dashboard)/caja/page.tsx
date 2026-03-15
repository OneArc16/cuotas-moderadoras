import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { CajasOperativasList } from "@/features/caja/components/cajas-operativas-list";
import { getCajasOperativas } from "@/features/caja/lib/get-cajas-operativas";

export default async function CajaPage() {
  const cajas = await getCajasOperativas();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Caja"
        description="Consulta las cajas operativas organizadas por piso."
      />

      <Card>
        <CardHeader>
          <CardTitle>Cajas por piso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de cajas registradas: {cajas.length}
          </p>

          <CajasOperativasList cajas={cajas} />
        </CardContent>
      </Card>
    </div>
  );
}