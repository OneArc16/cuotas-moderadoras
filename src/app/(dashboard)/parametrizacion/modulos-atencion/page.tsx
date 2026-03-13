import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { ModuloAtencionForm } from "@/features/parametrizacion/modulos-atencion/components/modulo-atencion-form";
import { ModulosAtencionList } from "@/features/parametrizacion/modulos-atencion/components/modulos-atencion-list";
import { getModulosAtencion } from "@/features/parametrizacion/modulos-atencion/lib/get-modulos-atencion";
import { getPisos } from "@/features/parametrizacion/pisos/lib/get-pisos";

export default async function ModulosAtencionPage() {
  const [modulos, pisos] = await Promise.all([
    getModulosAtencion(),
    getPisos(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrización"
        title="Módulos de atención"
        description="Aquí construiremos la gestión de módulos físicos de atención por piso."
      />

      <ModuloAtencionForm pisos={pisos} />

      <Card>
        <CardHeader>
          <CardTitle>Listado de módulos de atención</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de módulos registrados: {modulos.length}
          </p>

          <ModulosAtencionList modulos={modulos} pisos={pisos} />
        </CardContent>
      </Card>
    </div>
  );
}