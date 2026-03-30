import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TarifaForm } from "@/features/parametrizacion/tarifas/components/tarifa-form";
import { TarifasList } from "@/features/parametrizacion/tarifas/components/tarifas-list";
import { getTarifaFormOptions } from "@/features/parametrizacion/tarifas/lib/get-tarifa-form-options";
import { getTarifas } from "@/features/parametrizacion/tarifas/lib/get-tarifas";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function TarifasPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.TARIFF_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parametrizacion"
          title="Tarifas"
          description="Administra valores por servicio, categoria y vigencia."
        />

        <AccessDeniedState
          title="No tienes acceso a tarifas"
          description="Tu perfil actual no tiene permisos para administrar tarifas."
        />
      </div>
    );
  }

  const [tarifas, options] = await Promise.all([
    getTarifas(),
    getTarifaFormOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parametrizacion"
        title="Tarifas"
        description="Aqui administras tarifas por contrato, servicio, categoria y vigencia."
      />

      <TarifaForm servicios={options.servicios} contratos={options.contratos} />

      <Card>
        <CardHeader>
          <CardTitle>Listado de tarifas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Total de tarifas registradas: {tarifas.length}
          </p>

          <TarifasList
            tarifas={tarifas}
            servicios={options.servicios}
            contratos={options.contratos}
          />
        </CardContent>
      </Card>
    </div>
  );
}
