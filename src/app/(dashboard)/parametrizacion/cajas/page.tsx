import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { CajaForm } from "@/features/parametrizacion/cajas/components/caja-form";
import { CajasList } from "@/features/parametrizacion/cajas/components/cajas-list";
import { getCajas } from "@/features/parametrizacion/cajas/lib/get-cajas";

export default async function CajasPage() {
  const cajas = await getCajas();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Cajas"
        description="Aquí gestionas las cajas operativas que se usarán directamente en la sesión diaria."
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