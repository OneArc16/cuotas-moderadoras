"use client";

import type { SecurityPageContext } from "@/features/seguridad/lib/get-security-page-context";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SecurityAuditSection } from "@/features/seguridad/components/security-audit-section";
import { createRole } from "@/features/seguridad/lib/create-role";
import { updateRole } from "@/features/seguridad/lib/update-role";
import { updateRolePermissions } from "@/features/seguridad/lib/update-role-permissions";

type SecurityWorkspaceProps = SecurityPageContext;

function countTotalAssignments(roles: SecurityWorkspaceProps["roles"]) {
  return roles.reduce((total, role) => total + role.permissionCount, 0);
}

function getRoleBadgeClass(estado: "ACTIVO" | "INACTIVO") {
  return estado === "ACTIVO"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

export function SecurityWorkspace({
  stats,
  roles,
  permissionGroups,
  auditEntries,
}: SecurityWorkspaceProps) {
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(
    roles[0]?.id ?? null,
  );
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleStatus, setNewRoleStatus] = useState<"ACTIVO" | "INACTIVO">(
    "ACTIVO",
  );
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleStatus, setRoleStatus] = useState<"ACTIVO" | "INACTIVO">(
    "ACTIVO",
  );
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>(
    [],
  );
  const [isCreatingRole, startCreateRole] = useTransition();
  const [isSavingRole, startSaveRole] = useTransition();
  const [isSavingPermissions, startSavePermissions] = useTransition();

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;

  useEffect(() => {
    if (!selectedRole && roles[0]) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    if (!selectedRole) {
      setRoleName("");
      setRoleDescription("");
      setRoleStatus("ACTIVO");
      setSelectedPermissionCodes([]);
      return;
    }

    setRoleName(selectedRole.nombre);
    setRoleDescription(selectedRole.descripcion ?? "");
    setRoleStatus(selectedRole.estado);
    setSelectedPermissionCodes(selectedRole.permissionCodes);
  }, [selectedRole]);

  const selectedPermissionSet = new Set(selectedPermissionCodes);

  function togglePermission(code: string) {
    setSelectedPermissionCodes((currentCodes) =>
      currentCodes.includes(code)
        ? currentCodes.filter((currentCode) => currentCode !== code)
        : [...currentCodes, code].sort((a, b) => a.localeCompare(b)),
    );
  }

  function handleCreateRole() {
    startCreateRole(async () => {
      try {
        const result = await createRole({
          nombre: newRoleName,
          descripcion: newRoleDescription,
          estado: newRoleStatus,
        });

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setNewRoleName("");
        setNewRoleDescription("");
        setNewRoleStatus("ACTIVO");

        if (result.roleId) {
          setSelectedRoleId(result.roleId);
        }

        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el perfil.",
        );
      }
    });
  }

  function handleSaveRole() {
    if (!selectedRole) {
      return;
    }

    startSaveRole(async () => {
      try {
        const result = await updateRole({
          id: selectedRole.id,
          nombre: roleName,
          descripcion: roleDescription,
          estado: roleStatus,
        });

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil.",
        );
      }
    });
  }

  function handleSavePermissions() {
    if (!selectedRole) {
      return;
    }

    startSavePermissions(async () => {
      try {
        const result = await updateRolePermissions({
          roleId: selectedRole.id,
          permissionCodes: selectedPermissionCodes,
        });

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudieron actualizar los permisos.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Perfiles totales</p>
          <p className="mt-2 text-3xl font-semibold">{stats.totalRoles}</p>
        </div>

        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Perfiles activos</p>
          <p className="mt-2 text-3xl font-semibold">{stats.activeRoles}</p>
        </div>

        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Perfiles personalizados</p>
          <p className="mt-2 text-3xl font-semibold">{stats.customRoles}</p>
        </div>

        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Cambios ultimos 7 dias</p>
          <p className="mt-2 text-3xl font-semibold">
            {stats.auditEventsLast7Days}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Eventos registrados en la bitacora de seguridad.
          </p>
        </div>

        <div className="rounded-[24px] border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Asignaciones activas</p>
          <p className="mt-2 text-3xl font-semibold">
            {countTotalAssignments(roles)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.totalPermissions} permisos disponibles en el catalogo.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[28px] border bg-background p-5 shadow-sm">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Nuevo perfil
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                Crear perfil operativo
              </h2>
              <p className="text-sm text-muted-foreground">
                Los permisos se administran despues de crear el perfil.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="newRoleName">
                  Nombre del perfil
                </label>
                <Input
                  id="newRoleName"
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  placeholder="Ej: COORDINADOR CAJA"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="newRoleDescription"
                >
                  Descripcion
                </label>
                <Textarea
                  id="newRoleDescription"
                  value={newRoleDescription}
                  onChange={(event) => setNewRoleDescription(event.target.value)}
                  placeholder="Resumen corto del alcance operativo del perfil"
                  className="min-h-[96px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="newRoleStatus">
                  Estado inicial
                </label>
                <select
                  id="newRoleStatus"
                  value={newRoleStatus}
                  onChange={(event) =>
                    setNewRoleStatus(event.target.value as "ACTIVO" | "INACTIVO")
                  }
                  className="flex h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <Button
                type="button"
                className="w-full rounded-2xl"
                disabled={isCreatingRole}
                onClick={handleCreateRole}
              >
                {isCreatingRole ? "Creando..." : "Crear perfil"}
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border bg-background p-5 shadow-sm">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Perfiles existentes
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                Selecciona un perfil
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {roles.map((role) => {
                const selected = role.id === selectedRole?.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                      selected
                        ? "border-foreground bg-foreground text-background shadow-[0_16px_30px_-24px_color-mix(in_oklab,var(--foreground)_90%,transparent)]"
                        : "border-border bg-background hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold tracking-[0.01em]">
                        {role.nombre}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${
                          selected
                            ? "bg-background/15 text-background"
                            : getRoleBadgeClass(role.estado)
                        }`}
                      >
                        {role.estado}
                      </span>
                      {role.isSystem ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${
                            selected
                              ? "bg-background/15 text-background"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                          }`}
                        >
                          Perfil base
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={`mt-2 text-sm leading-5 ${
                        selected ? "text-background/80" : "text-muted-foreground"
                      }`}
                    >
                      {role.descripcion || "Sin descripcion operativa."}
                    </p>

                    <div
                      className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${
                        selected ? "text-background/80" : "text-muted-foreground"
                      }`}
                    >
                      <span>{role.usuariosCount} usuarios asignados</span>
                      <span>{role.permissionCount} permisos activos</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {selectedRole ? (
            <>
              <section className="rounded-[28px] border bg-background p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Perfil seleccionado
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Configuracion general
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${getRoleBadgeClass(
                        roleStatus,
                      )}`}
                    >
                      {roleStatus}
                    </span>
                    {selectedRole.isSystem ? (
                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[0.72rem] font-medium text-sky-700 ring-1 ring-sky-200">
                        Perfil base del sistema
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="roleName">
                      Nombre del perfil
                    </label>
                    <Input
                      id="roleName"
                      value={roleName}
                      disabled={selectedRole.isSystem || isSavingRole}
                      onChange={(event) => setRoleName(event.target.value)}
                    />
                    {selectedRole.isSystem ? (
                      <p className="text-xs text-muted-foreground">
                        Los perfiles base conservan su nombre para mantener consistencia operativa.
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="roleStatus">
                      Estado
                    </label>
                    <select
                      id="roleStatus"
                      value={roleStatus}
                      disabled={isSavingRole}
                      onChange={(event) =>
                        setRoleStatus(event.target.value as "ACTIVO" | "INACTIVO")
                      }
                      className="flex h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                    </select>
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="roleDescription">
                      Descripcion
                    </label>
                    <Textarea
                      id="roleDescription"
                      value={roleDescription}
                      onChange={(event) => setRoleDescription(event.target.value)}
                      className="min-h-[120px]"
                      placeholder="Describe que puede hacer este perfil dentro del sistema"
                      disabled={isSavingRole}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-5">
                  <Button
                    type="button"
                    disabled={isSavingRole}
                    onClick={handleSaveRole}
                    className="rounded-2xl"
                  >
                    {isSavingRole ? "Guardando perfil..." : "Guardar perfil"}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    {selectedRole.usuariosCount} usuarios tienen este perfil asignado.
                  </p>
                </div>
              </section>

              <section className="rounded-[28px] border bg-background p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Permisos del perfil
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Matriz de acceso
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      El catalogo de permisos es controlado por sistema. Aqui solo asignas o retiras acceso.
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={isSavingPermissions}
                    onClick={handleSavePermissions}
                    className="rounded-2xl"
                  >
                    {isSavingPermissions
                      ? "Guardando permisos..."
                      : "Guardar permisos"}
                  </Button>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {permissionGroups.map((group) => (
                    <div
                      key={group.moduloSistema}
                      className="rounded-[24px] border border-border/70 bg-muted/15 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {group.moduloSistema}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {
                              group.permisos.filter((permission) =>
                                selectedPermissionSet.has(permission.codigo),
                              ).length
                            }{" "}
                            de {group.permisos.length} permisos asignados
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {group.permisos.map((permission) => {
                          const checked = selectedPermissionSet.has(
                            permission.codigo,
                          );

                          return (
                            <label
                              key={permission.codigo}
                              className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-3 py-3 transition ${
                                checked
                                  ? "border-foreground/20 bg-background"
                                  : "border-border/70 bg-background/70"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(permission.codigo)}
                                className="mt-1 h-4 w-4 rounded border-border"
                              />

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {permission.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {permission.codigo}
                                </p>
                                {permission.descripcion ? (
                                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    {permission.descripcion}
                                  </p>
                                ) : null}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-[28px] border bg-background p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                No hay perfiles disponibles todavia.
              </p>
            </section>
          )}
        </div>
      </div>

      <SecurityAuditSection
        auditEntries={auditEntries}
        selectedRole={selectedRole}
      />
    </div>
  );
}