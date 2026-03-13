import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { ServicioForm } from "@/features/parametrizacion/servicios/components/servicio-form";
import { ServiciosList } from "@/features/parametrizacion/servicios/components/servicios-list";
import { getServicios } from "@/features/parametrizacion/servicios/lib/get-servicios";

export default async function ServiciosPage() {
  const servicios = await getServicios();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Servicios"
        description="Aquí construiremos la gestión de servicios de la IPS."
      />

      <ServicioForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de servicios registrados: {servicios.length}
          </p>

          <ServiciosList servicios={servicios} />
        </CardContent>
      </Card>
    </div>
  );
}
