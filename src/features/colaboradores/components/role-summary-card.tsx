type RoleSummary = {
  nombre: string;
  descripcion: string | null;
  estado: "ACTIVO" | "INACTIVO";
  permissionCount: number;
  usersCount: number;
};

export function RoleSummaryCard({
  role,
}: {
  role: RoleSummary | null;
}) {
  if (!role) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
        Selecciona un perfil para ver su alcance operativo.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">{role.nombre}</p>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${
            role.estado === "ACTIVO"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          }`}
        >
          {role.estado}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {role.descripcion || "Este perfil no tiene una descripcion operativa cargada todavia."}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{role.permissionCount} permisos activos</span>
        <span>{role.usersCount} usuarios asignados</span>
      </div>
    </div>
  );
}
