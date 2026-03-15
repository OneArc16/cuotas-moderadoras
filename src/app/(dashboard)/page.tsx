import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page/page-header";
import { getServerSession } from "@/lib/session";
import { ModuloSelector } from "@/features/sesion-operativa/components/modulo-selector";
import { getModulosDisponibles } from "@/features/sesion-operativa/lib/get-modulos-disponibles";
import { getSesionOperativaActual } from "@/features/sesion-operativa/lib/get-sesion-operativa-actual";
import { CloseSesionOperativaButton } from "@/features/sesion-operativa/components/close-sesion-operativa-button";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const [modulos, sesionOperativaActual] = await Promise.all([
    getModulosDisponibles(),
    getSesionOperativaActual(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Sesión operativa"
        description="Selecciona tu módulo físico o consulta la sesión operativa activa."
      />

      {sesionOperativaActual ? (
        <Card>
          <CardHeader>
            <CardTitle>Sesión operativa activa</CardTitle>
            <div className="pt-2">
              <CloseSesionOperativaButton />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Módulo:</span>{" "}
              {sesionOperativaActual.moduloAtencion.nombre}
            </p>
            <p>
              <span className="font-medium">Código:</span>{" "}
              {sesionOperativaActual.moduloAtencion.codigo}
            </p>
            <p>
              <span className="font-medium">Piso:</span>{" "}
              {sesionOperativaActual.piso.nombre}
            </p>
            <p>
              <span className="font-medium">Caja:</span>{" "}
              {sesionOperativaActual.caja.nombre}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Módulos disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona un módulo para iniciar tu sesión operativa.
            </p>

            <ModuloSelector modulos={modulos} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}