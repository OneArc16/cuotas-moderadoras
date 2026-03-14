import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";

export default function ContratosCategoriasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Contratos - Categorías"
        description="Aquí construiremos la asignación de categorías de afiliación a contratos."
      />

      <Card>
        <CardHeader>
          <CardTitle>Asignaciones de contratos y categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aquí mostraremos la tabla de asignaciones y sus acciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}