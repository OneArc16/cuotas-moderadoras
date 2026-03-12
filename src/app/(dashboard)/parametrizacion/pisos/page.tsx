import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PisoForm } from "@/features/parametrizacion/pisos/components/piso-form";
import { PisosList } from "@/features/parametrizacion/pisos/components/pisos-list";
import { getPisos } from "@/features/parametrizacion/pisos/lib/get-pisos";

export default async function PisosPage() {
  const pisos = await getPisos();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Pisos"
        description="Aquí construiremos la gestión de pisos de la IPS."
      />

      <PisoForm />

      <Card>
        <CardHeader>
          <CardTitle>Listado de pisos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de pisos registrados: {pisos.length}
          </p>

          <PisosList pisos={pisos} />
        </CardContent>
      </Card>
    </div>
  );
} 