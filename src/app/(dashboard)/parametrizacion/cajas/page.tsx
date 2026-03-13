import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { CajaForm } from "@/features/parametrizacion/cajas/components/caja-form";
import { CajasList } from "@/features/parametrizacion/cajas/components/cajas-list";
import { getCajas } from "@/features/parametrizacion/cajas/lib/get-cajas";
import { getPisos } from "@/features/parametrizacion/pisos/lib/get-pisos";

export default async function CajasPage() {
  const [cajas, pisos] = await Promise.all([getCajas(), getPisos()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Cajas"
        description="Aquí construiremos la gestión de cajas por piso."
      />

      <CajaForm pisos={pisos} />

      <Card>
        <CardHeader>
          <CardTitle>Listado de cajas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de cajas registradas: {cajas.length}
          </p>

          <CajasList cajas={cajas} pisos={pisos} />
        </CardContent>
      </Card>
    </div>
  );
}