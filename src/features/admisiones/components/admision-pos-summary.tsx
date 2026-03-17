type AdmisionPosSummaryProps = {
  paciente: null | {
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
  };
  contrato: null | {
    nombre: string;
    tipo: string;
  };
  servicio: null | {
    nombre: string;
    codigo: string | null;
  };
  categoria: null | {
    codigo: string;
    nombre: string;
  };
  tipoCobro: string | null;
  metodoPago: string | null;
  referenciaPago: string | null;
  descuentoPermitido: boolean;
  totalPagar: number;
  valorRecibido: number;
  vuelto: number;
  descuentoAplicado: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeMetodoPago(value: string | null) {
  if (!value) return "Pendiente";

  const map: Record<string, string> = {
    EFECTIVO: "Efectivo",
    NEQUI: "Nequi",
    DAVIPLATA: "Daviplata",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
    OTRO: "Otro",
  };

  return map[value] ?? value;
}

export function AdmisionPosSummary({
  paciente,
  contrato,
  servicio,
  categoria,
  tipoCobro,
  metodoPago,
  referenciaPago,
  descuentoPermitido,
  totalPagar,
  valorRecibido,
  vuelto,
  descuentoAplicado,
}: AdmisionPosSummaryProps) {
  return (
    <section className="rounded-[28px] border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Resumen rápido</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            Vista previa del cobro
          </h3>
        </div>

        <div className="rounded-2xl border bg-muted/30 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Total
          </p>
          <p className="text-xl font-semibold">{formatMoney(totalPagar)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {paciente?.nombreCompleto || "Paciente pendiente"}
            </p>
            <p className="text-sm text-muted-foreground">
              {paciente
                ? `${paciente.tipoDocumento} · ${paciente.numeroDocumento}`
                : "Completa el paso 1 para continuar"}
            </p>
          </div>

          <div className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
            {tipoCobro || "Sin tarifa"}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Contrato
            </p>
            <p className="mt-2 text-base font-semibold">
              {contrato?.nombre || "Pendiente"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {contrato?.tipo || "Selecciona contrato"}
            </p>
          </div>

          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Servicio
            </p>
            <p className="mt-2 text-base font-semibold">
              {servicio?.nombre || "Pendiente"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {servicio?.codigo ? `Código ${servicio.codigo}` : "Selecciona servicio"}
            </p>
          </div>

          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Categoría
            </p>
            <p className="mt-2 text-base font-semibold">
              {categoria ? `${categoria.codigo} · ${categoria.nombre}` : "No aplica / pendiente"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Categoría de afiliación para la tarifa.
            </p>
          </div>

          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Método de pago
            </p>
            <p className="mt-2 text-base font-semibold">
              {normalizeMetodoPago(metodoPago)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {referenciaPago?.trim()
                ? `Ref. ${referenciaPago}`
                : "Sin referencia registrada"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Descuento
            </p>
            <p className="mt-2 text-base font-semibold">
              {formatMoney(descuentoAplicado)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {descuentoPermitido ? "Permitido por contrato" : "No permitido"}
            </p>
          </div>

          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Recibido
            </p>
            <p className="mt-2 text-base font-semibold">
              {formatMoney(valorRecibido)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Valor entregado por el paciente.
            </p>
          </div>

          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Vuelto
            </p>
            <p className="mt-2 text-base font-semibold">
              {formatMoney(vuelto)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cambio proyectado.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Total a cobrar</span>
            <span className="text-2xl font-semibold">
              {formatMoney(totalPagar)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
