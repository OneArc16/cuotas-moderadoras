"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SecurityPageContext } from "@/features/seguridad/lib/get-security-page-context";

type SecurityAuditSectionProps = {
  auditEntries: SecurityPageContext["auditEntries"];
  selectedRole: SecurityPageContext["roles"][number] | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getActionBadgeClass(action: string) {
  switch (action) {
    case "SEGURIDAD_CREAR_PERFIL":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "SEGURIDAD_ACTUALIZAR_PERFIL":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "SEGURIDAD_ACTUALIZAR_PERMISOS":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-muted text-muted-foreground ring-1 ring-border";
  }
}

export function SecurityAuditSection({
  auditEntries,
  selectedRole,
}: SecurityAuditSectionProps) {
  const recentAuditEntries = auditEntries.slice(0, 12);
  const selectedRoleAuditEntries = selectedRole
    ? auditEntries.filter((entry) => entry.roleId === selectedRole.id).slice(0, 8)
    : [];

  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="rounded-[28px] border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Historial reciente
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Bitacora de seguridad
            </h2>
            <p className="text-sm text-muted-foreground">
              Muestra los ultimos cambios registrados al crear perfiles, actualizar su configuracion o guardar permisos.
            </p>
          </div>

          <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {auditEntries.length} eventos cargados
          </span>
        </div>

        {recentAuditEntries.length > 0 ? (
          <div className="mt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cambio</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAuditEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-normal align-top">
                      <div className="min-w-[132px]">
                        <p className="font-medium text-foreground">
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${getActionBadgeClass(
                            entry.accion,
                          )}`}
                        >
                          {entry.accionLabel}
                        </span>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {entry.detalle ?? "Cambio registrado en seguridad."}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.summary}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top">
                      <div className="min-w-[160px]">
                        <p className="font-medium text-foreground">
                          {entry.roleName ?? "Perfil no disponible"}
                        </p>
                        {entry.roleId ? (
                          <p className="text-xs text-muted-foreground">
                            Perfil #{entry.roleId}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top">
                      <div className="min-w-[160px]">
                        <p className="font-medium text-foreground">
                          {entry.actorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{entry.actorUsername}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed p-6 text-sm text-muted-foreground">
            Todavia no hay cambios registrados en la bitacora de seguridad.
          </div>
        )}
      </div>

      <div className="rounded-[28px] border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Actividad por perfil
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Seguimiento del perfil seleccionado
            </h2>
            <p className="text-sm text-muted-foreground">
              Te ayuda a entender rapidamente cuando fue la ultima vez que se ajusto un perfil especifico.
            </p>
          </div>

          {selectedRole ? (
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {selectedRole.nombre}
            </span>
          ) : null}
        </div>

        {selectedRole ? (
          selectedRoleAuditEntries.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedRoleAuditEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[22px] border border-border/70 bg-muted/15 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${getActionBadgeClass(
                        entry.accion,
                      )}`}
                    >
                      {entry.accionLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-foreground">
                    {entry.detalle ?? "Cambio registrado en seguridad."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.actorName}</span>
                    <span>@{entry.actorUsername}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed p-6 text-sm text-muted-foreground">
              Este perfil aun no tiene eventos recientes dentro de la bitacora cargada.
            </div>
          )
        ) : (
          <div className="mt-5 rounded-[24px] border border-dashed p-6 text-sm text-muted-foreground">
            Selecciona un perfil para revisar su historial reciente.
          </div>
        )}
      </div>
    </section>
  );
}