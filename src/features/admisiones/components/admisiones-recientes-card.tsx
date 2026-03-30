"use client";

import { useState } from "react";

import { CancelAdmisionDialog } from "@/features/admisiones/components/cancel-admision-dialog";

type RecentAdmissionItem = {
  id: number;
  fechaHora: string;
  estado: "REGISTRADA" | "ANULADA";
  pacienteNombreSnapshot: string;
  pacienteDocumentoSnapshot: string;
  servicioNombreSnapshot: string;
  contratoNombreSnapshot: string;
  categoriaAfiliacionNombreSnapshot: string | null;
  tipoCobroSnapshot: "CUOTA_MODERADORA" | "PARTICULAR";
  valorFinalCobrado: string;
  metodoPagoSnapshot: string | null;
  referenciaPagoSnapshot: string | null;
  observacion: string | null;
  motivoAnulacion: string | null;
  anuladaAt: string | null;
  anuladaPorUsuarioNombre: string | null;
  anuladaPorUsername: string | null;
};

type AdmisionesRecientesCardProps = {
  items: RecentAdmissionItem[];
  canCancelAdmision: boolean;
  canOperateOnCurrentJornada: boolean;
};

function formatMoney(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMetodoPago(value: string | null) {
  switch (value) {
    case "EFECTIVO":
      return "Efectivo";
    case "NEQUI":
      return "Nequi";
    case "DAVIPLATA":
      return "Daviplata";
    case "TRANSFERENCIA":
      return "Transferencia";
    case "TARJETA":
      return "Tarjeta";
    case "OTRO":
      return "Otro";
    default:
      return "Sin definir";
  }
}

function getEstadoClasses(estado: RecentAdmissionItem["estado"]) {
  return estado === "ANULADA"
    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
}

export function AdmisionesRecientesCard({
  items,
  canCancelAdmision,
  canOperateOnCurrentJornada,
}: AdmisionesRecientesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-3xl border bg-background shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full flex-wrap items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <div>
          <p className="text-sm text-muted-foreground">Historial operativo</p>
          <h2 className="text-xl font-semibold tracking-tight">
            Admisiones recientes de la jornada
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Este historial queda disponible para consulta cuando decidas desplegarlo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border bg-muted/25 px-4 py-2 text-sm text-muted-foreground">
            {items.length} registro{items.length === 1 ? "" : "s"}
          </div>
          <span className="rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium text-foreground">
            {isOpen ? "Ocultar historial" : "Ver historial"}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t p-6">
          {!canOperateOnCurrentJornada ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                La jornada actual no esta lista para operar
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Inicia sesion operativa y confirma una caja con jornada abierta o reabierta para consultar y anular admisiones de hoy.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              Aun no hay admisiones registradas en la jornada actual.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border bg-muted/15 p-5 shadow-[0_14px_30px_-28px_color-mix(in_oklab,var(--foreground)_45%,transparent)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.04em] ${getEstadoClasses(
                            item.estado,
                          )}`}
                        >
                          {item.estado}
                        </span>
                        <span className="rounded-full border border-border/70 px-3 py-1 text-[0.72rem] font-medium tracking-[0.04em] text-muted-foreground">
                          {item.tipoCobroSnapshot === "PARTICULAR"
                            ? "Particular"
                            : "Cuota moderadora"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                          {item.pacienteNombreSnapshot}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.pacienteDocumentoSnapshot}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background/80 px-4 py-3 xl:min-w-[200px]">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Valor cobrado
                      </p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatMoney(item.valorFinalCobrado)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMetodoPago(item.metodoPagoSnapshot)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Servicio</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{item.servicioNombreSnapshot}</p>
                    </div>

                    <div className="rounded-2xl border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Contrato</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{item.contratoNombreSnapshot}</p>
                    </div>

                    <div className="rounded-2xl border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Categoria</p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {item.categoriaAfiliacionNombreSnapshot ?? "No aplica"}
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Registrada</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{formatDateTime(item.fechaHora)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="rounded-full border border-border/70 px-3 py-1">
                      Metodo: {formatMetodoPago(item.metodoPagoSnapshot)}
                    </span>
                    {item.referenciaPagoSnapshot ? (
                      <span className="rounded-full border border-border/70 px-3 py-1">
                        Referencia: {item.referenciaPagoSnapshot}
                      </span>
                    ) : null}
                  </div>

                  {item.observacion ? (
                    <div className="mt-4 rounded-2xl border bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Observacion</p>
                      <p className="mt-2 text-sm text-foreground">{item.observacion}</p>
                    </div>
                  ) : null}

                  {item.estado === "ANULADA" ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-900 dark:bg-rose-950/30">
                      <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                        Admision anulada
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.anuladaPorUsuarioNombre
                          ? `Anulada por ${item.anuladaPorUsuarioNombre}`
                          : "Anulada por un usuario autorizado"}
                        {item.anuladaPorUsername ? ` (@${item.anuladaPorUsername})` : ""}
                        {item.anuladaAt ? ` el ${formatDateTime(item.anuladaAt)}` : ""}.
                      </p>
                      {item.motivoAnulacion ? (
                        <p className="mt-2 text-sm text-foreground">
                          Motivo: {item.motivoAnulacion}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        {canCancelAdmision
                          ? "Si necesitas revertir este cobro, registra el motivo para dejar trazabilidad completa."
                          : "Tu perfil actual puede consultar esta admision, pero no anularla."}
                      </p>

                      {canCancelAdmision ? (
                        <CancelAdmisionDialog
                          admisionId={item.id}
                          pacienteNombre={item.pacienteNombreSnapshot}
                          servicioNombre={item.servicioNombreSnapshot}
                          valorFinalCobrado={item.valorFinalCobrado}
                          metodoPagoSnapshot={item.metodoPagoSnapshot}
                        />
                      ) : null}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}