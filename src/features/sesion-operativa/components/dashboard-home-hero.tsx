type DashboardHomeHeroProps = {
  usuario: {
    nombreCompleto: string;
    username: string;
  };
  sesionOperativa: null | {
    moduloNombre: string;
    moduloCodigo: string;
    pisoNombre: string;
    cajaNombre: string;
    fechaOperativa: Date | string;
  };
  metrics: {
    modulosDisponibles: number;
    cajasActivas: number;
    pisosActivos: number;
  };
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("es-CO");
}

export function DashboardHomeHero({
  usuario,
  sesionOperativa,
  metrics,
}: DashboardHomeHeroProps) {
  return (
    <section className="overflow-hidden rounded-[32px] border bg-background shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground">
              Inicio operativo · Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Selección de módulo y control de sesión
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Desde aquí eliges el módulo físico de trabajo, validas la caja del
              piso y controlas la sesión operativa del día antes de entrar a
              admisiones.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[380px]">
            <div className="rounded-2xl border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Usuario
              </p>
              <p className="mt-2 text-sm font-semibold">
                {usuario.nombreCompleto}
              </p>
              <p className="text-xs text-muted-foreground">
                @{usuario.username}
              </p>
            </div>

            <div className="rounded-2xl border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Sesión operativa
              </p>
              <div className="mt-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    sesionOperativa
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {sesionOperativa ? "Activa" : "Pendiente"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Caja vinculada
              </p>
              <p className="mt-2 text-sm font-semibold">
                {sesionOperativa?.cajaNombre || "Sin caja"}
              </p>
              <p className="text-xs text-muted-foreground">
                {sesionOperativa?.pisoNombre || "Selecciona módulo"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 lg:grid-cols-[1.15fr_1fr_1fr_1fr]">
        <div className="rounded-2xl border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Estado actual
          </p>
          <p className="mt-2 text-lg font-semibold">
            {sesionOperativa
              ? `${sesionOperativa.moduloNombre} · ${sesionOperativa.moduloCodigo}`
              : "Aún no has seleccionado módulo"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sesionOperativa
              ? `${sesionOperativa.pisoNombre} · Caja ${sesionOperativa.cajaNombre} · ${formatDate(
                  sesionOperativa.fechaOperativa,
                )}`
              : "El sistema usará el piso del módulo para resolver la caja operativa."}
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Módulos disponibles
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {metrics.modulosDisponibles}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Módulos listos para selección.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Cajas activas
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {metrics.cajasActivas}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cajas disponibles en operación.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Pisos activos
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {metrics.pisosActivos}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pisos con estructura operativa.
          </p>
        </div>
      </div>
    </section>
  );
}