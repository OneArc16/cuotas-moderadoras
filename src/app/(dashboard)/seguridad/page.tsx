import { redirect } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/page/access-denied-state";
import { PageHeader } from "@/components/shared/page/page-header";
import { SecurityWorkspace } from "@/features/seguridad/components/security-workspace";
import { getSecurityPageContext } from "@/features/seguridad/lib/get-security-page-context";
import { getCurrentUsuario } from "@/lib/current-user";
import { hasPermission, RBAC_PERMISSION } from "@/lib/rbac";

export default async function SeguridadPage() {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  if (!hasPermission(usuario, RBAC_PERMISSION.SECURITY_MANAGE)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Administracion"
          title="Seguridad"
          description="Administra perfiles, permisos y control de acceso del sistema."
        />

        <AccessDeniedState
          title="No tienes acceso a seguridad"
          description="Tu perfil actual no tiene permisos para administrar roles, permisos y control de acceso."
        />
      </div>
    );
  }

  const context = await getSecurityPageContext();

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Administracion"
        title="Seguridad"
        description="Crea perfiles, administra su estado y define exactamente que puede hacer cada uno dentro del sistema."
      />

      <SecurityWorkspace
        stats={context.stats}
        roles={context.roles}
        permissionGroups={context.permissionGroups}
        auditEntries={context.auditEntries}
      />
    </main>
  );
}