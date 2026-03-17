"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdmisionPosSummary } from "@/features/admisiones/components/admision-pos-summary";
import { createAdmisionWithMovimientoAction } from "@/features/admisiones/lib/create-admision-with-movimiento-action";
import { getTarifaVigenteAction } from "@/features/admisiones/lib/get-tarifa-vigente-action";

type ContratoOption = {
  id: number;
  nombre: string;
  tipo: string;
  categorias: Array<{
    id: number;
    codigo: string;
    nombre: string;
  }>;
};

type ServicioOption = {
  id: number;
  codigo: string | null;
  nombre: string;
};

type TarifaCombo = {
  contratoId: number;
  servicioId: number;
  categoriaAfiliacionId: number | null;
};

type SelectedPatient = {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  telefono: string | null;
  estado: string;
} | null;

type AdmisionConfigCardProps = {
  canStartAdmision: boolean;
  selectedPatient: SelectedPatient;
  contratos: ContratoOption[];
  servicios: ServicioOption[];
  tarifaCombos: TarifaCombo[];
  isOpen: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  onAdmisionRegistered: () => void;
};

type TarifaStatus =
  | { kind: "idle" }
  | {
      kind: "error";
      message: string;
      fieldErrors?: {
        contratoId?: string[];
        servicioId?: string[];
        categoriaAfiliacionId?: string[];
      };
    }
  | {
      kind: "not-found";
      contratoNombre: string;
      servicioNombre: string;
      categoriaNombre: string | null;
    }
  | {
      kind: "found";
      tarifa: {
        id: number;
        tipoCobro: "CUOTA_MODERADORA" | "PARTICULAR";
        valor: string;
        fechaInicioVigencia: Date | string;
        fechaFinVigencia: Date | string | null;
        contrato: {
          id: number;
          nombre: string;
          tipo: string;
        };
        servicio: {
          id: number;
          codigo: string | null;
          nombre: string;
        };
        categoriaAfiliacion: null | {
          id: number;
          codigo: string;
          nombre: string;
        };
      };
    };

type AdmisionStatus =
  | { kind: "idle" }
  | {
      kind: "error";
      message: string;
      fieldErrors?: {
        pacienteId?: string[];
        contratoId?: string[];
        servicioId?: string[];
        categoriaAfiliacionId?: string[];
        descuentoInput?: string[];
        valorRecibido?: string[];
        metodoPago?: string[];
        referenciaPago?: string[];
        observacion?: string[];
        razonDescuento?: string[];
      };
    };

const METODO_PAGO_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "NEQUI", label: "Nequi" },
  { value: "DAVIPLATA", label: "Daviplata" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
] as const;

function formatMoney(value: number | string) {
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

function sanitizeMoneyInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function parseMoneyInput(value: string) {
  if (!value.trim()) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseDescuentoInput(rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return {
      tipo: "NINGUNO" as const,
      valorGuardado: 0,
      descuentoAplicado: 0,
      descripcion: "Sin descuento",
    };
  }

  const normalized = value.replace(/\s+/g, "");

  if (normalized.endsWith("%")) {
    const porcentaje = Number(normalized.slice(0, -1));

    if (Number.isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      return {
        tipo: "ERROR" as const,
        valorGuardado: 0,
        descuentoAplicado: 0,
        descripcion: "Porcentaje inválido",
      };
    }

    return {
      tipo: "PORCENTAJE" as const,
      valorGuardado: porcentaje,
      descuentoAplicado: 0,
      descripcion: `${porcentaje}%`,
    };
  }

  const valorFijo = Number(normalized);

  if (Number.isNaN(valorFijo) || valorFijo < 0) {
    return {
      tipo: "ERROR" as const,
      valorGuardado: 0,
      descuentoAplicado: 0,
      descripcion: "Valor inválido",
    };
  }

  return {
    tipo: valorFijo > 0 ? ("VALOR_FIJO" as const) : ("NINGUNO" as const),
    valorGuardado: valorFijo,
    descuentoAplicado: 0,
    descripcion: valorFijo > 0 ? formatMoney(valorFijo) : "Sin descuento",
  };
}

function resolveDescuento(
  valorBase: number,
  descuentoInput: string,
  permitido: boolean,
) {
  if (!permitido) return 0;

  const parsed = parseDescuentoInput(descuentoInput);

  if (parsed.tipo === "ERROR" || parsed.tipo === "NINGUNO") {
    return 0;
  }

  if (parsed.tipo === "PORCENTAJE") {
    return Math.min(
      Number(((valorBase * parsed.valorGuardado) / 100).toFixed(2)),
      valorBase,
    );
  }

  return Math.min(parsed.valorGuardado, valorBase);
}

export function AdmisionConfigCard({
  canStartAdmision,
  selectedPatient,
  contratos,
  servicios,
  tarifaCombos,
  isOpen,
  onOpenChange,
  onAdmisionRegistered,
}: AdmisionConfigCardProps) {
  const [contratoId, setContratoId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [tarifaStatus, setTarifaStatus] = useState<TarifaStatus>({
    kind: "idle",
  });
  const [admisionStatus, setAdmisionStatus] = useState<AdmisionStatus>({
    kind: "idle",
  });
  const [descuentoInput, setDescuentoInput] = useState("");
  const [valorRecibido, setValorRecibido] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [razonDescuento, setRazonDescuento] = useState("");
  const [observacion, setObservacion] = useState("");
  const [isTarifaPending, startTarifaTransition] = useTransition();
  const [isRegisterPending, startRegisterTransition] = useTransition();

  const contratoSeleccionado = useMemo(
    () => contratos.find((item) => String(item.id) === contratoId) ?? null,
    [contratoId, contratos],
  );

  const combosContrato = useMemo(() => {
    if (!contratoId) return [];
    return tarifaCombos.filter((item) => String(item.contratoId) === contratoId);
  }, [contratoId, tarifaCombos]);

  const servicioIdsDisponibles = useMemo(
    () => new Set(combosContrato.map((item) => item.servicioId)),
    [combosContrato],
  );

  const serviciosDisponibles = useMemo(() => {
    if (!contratoId) return [];
    return servicios.filter((item) => servicioIdsDisponibles.has(item.id));
  }, [contratoId, servicios, servicioIdsDisponibles]);

  const servicioSeleccionado = useMemo(
    () =>
      serviciosDisponibles.find((item) => String(item.id) === servicioId) ??
      null,
    [servicioId, serviciosDisponibles],
  );

  const combosContratoServicio = useMemo(() => {
    if (!contratoId || !servicioId) return [];
    return tarifaCombos.filter(
      (item) =>
        String(item.contratoId) === contratoId &&
        String(item.servicioId) === servicioId,
    );
  }, [contratoId, servicioId, tarifaCombos]);

  const categoriaIdsDisponibles = useMemo(() => {
    return new Set(
      combosContratoServicio
        .map((item) => item.categoriaAfiliacionId)
        .filter((value): value is number => value !== null),
    );
  }, [combosContratoServicio]);

  const categoriasDisponibles = useMemo(() => {
    if (!contratoSeleccionado || !servicioSeleccionado) return [];
    return contratoSeleccionado.categorias.filter((item) =>
      categoriaIdsDisponibles.has(item.id),
    );
  }, [contratoSeleccionado, servicioSeleccionado, categoriaIdsDisponibles]);

  const categoriaSeleccionada = useMemo(
    () =>
      categoriasDisponibles.find((item) => String(item.id) === categoriaId) ??
      null,
    [categoriaId, categoriasDisponibles],
  );

  const contratoEsParticular = contratoSeleccionado?.tipo === "PARTICULAR";
  const requiereCategoria = categoriasDisponibles.length > 0;
  const isBusy = isTarifaPending || isRegisterPending;

  const canConsultarTarifa =
    canStartAdmision &&
    Boolean(selectedPatient) &&
    Boolean(contratoSeleccionado) &&
    Boolean(servicioSeleccionado) &&
    (!requiereCategoria || Boolean(categoriaSeleccionada)) &&
    !isBusy;

  const valorBase =
    tarifaStatus.kind === "found" ? Number(tarifaStatus.tarifa.valor) : 0;

  const descuentoPermitido =
    tarifaStatus.kind === "found" && contratoEsParticular;

  const descuentoAplicado = resolveDescuento(
    valorBase,
    descuentoInput,
    descuentoPermitido,
  );

  const descuentoPreview = parseDescuentoInput(descuentoInput);

  const totalPagar = Math.max(valorBase - descuentoAplicado, 0);
  const recibido = parseMoneyInput(valorRecibido);
  const vuelto = Math.max(recibido - totalPagar, 0);
  const faltante = Math.max(totalPagar - recibido, 0);
  const isReady = tarifaStatus.kind === "found";

  const canRegistrarAdmision =
    Boolean(selectedPatient) &&
    tarifaStatus.kind === "found" &&
    recibido >= totalPagar &&
    metodoPago.length > 0 &&
    !isBusy;

  function resetPaymentFields() {
    setDescuentoInput("");
    setValorRecibido("");
    setMetodoPago("");
    setReferenciaPago("");
    setRazonDescuento("");
    setObservacion("");
  }

  function resetTarifaState() {
    setTarifaStatus({ kind: "idle" });
    setAdmisionStatus({ kind: "idle" });
    resetPaymentFields();
  }

  function handleContratoChange(value: string) {
    setContratoId(value);
    setServicioId("");
    setCategoriaId("");
    resetTarifaState();
  }

  function handleServicioChange(value: string) {
    setServicioId(value);
    setCategoriaId("");
    resetTarifaState();
  }

  function handleCategoriaChange(value: string) {
    setCategoriaId(value);
    resetTarifaState();
  }

  function handleReset() {
    setContratoId("");
    setCategoriaId("");
    setServicioId("");
    setTarifaStatus({ kind: "idle" });
    setAdmisionStatus({ kind: "idle" });
    resetPaymentFields();
  }

  function handleConsultarTarifa() {
    if (!canConsultarTarifa || !contratoSeleccionado || !servicioSeleccionado) {
      return;
    }

    startTarifaTransition(async () => {
      const result = await getTarifaVigenteAction({
        contratoId: Number(contratoId),
        servicioId: Number(servicioId),
        categoriaAfiliacionId: requiereCategoria ? Number(categoriaId) : null,
      });

      if (!result.ok) {
        setTarifaStatus({
          kind: "error",
          message: result.message,
          fieldErrors: result.fieldErrors,
        });
        setAdmisionStatus({ kind: "idle" });
        resetPaymentFields();
        return;
      }

      if (result.notFound || !result.tarifa) {
        setTarifaStatus({
          kind: "not-found",
          contratoNombre: contratoSeleccionado.nombre,
          servicioNombre: servicioSeleccionado.nombre,
          categoriaNombre: categoriaSeleccionada
            ? `${categoriaSeleccionada.codigo} · ${categoriaSeleccionada.nombre}`
            : null,
        });
        setAdmisionStatus({ kind: "idle" });
        resetPaymentFields();
        return;
      }

      setTarifaStatus({
        kind: "found",
        tarifa: result.tarifa,
      });
      setAdmisionStatus({ kind: "idle" });
      resetPaymentFields();
    });
  }

  function handleRegistrarAdmision() {
    if (
      !selectedPatient ||
      tarifaStatus.kind !== "found" ||
      !contratoSeleccionado ||
      !servicioSeleccionado ||
      !metodoPago
    ) {
      return;
    }

    startRegisterTransition(async () => {
      const result = await createAdmisionWithMovimientoAction({
        pacienteId: selectedPatient.id,
        contratoId: Number(contratoId),
        servicioId: Number(servicioId),
        categoriaAfiliacionId: requiereCategoria ? Number(categoriaId) : null,
        descuentoInput,
        valorRecibido: recibido,
        metodoPago,
        referenciaPago,
        razonDescuento,
        observacion,
      });

      if (!result.ok) {
        setAdmisionStatus({
          kind: "error",
          message: result.message,
          fieldErrors: result.fieldErrors,
        });
        toast.error(result.message);
        return;
      }

      toast.success("Admisión registrada correctamente");
      setAdmisionStatus({ kind: "idle" });
      onAdmisionRegistered();
    });
  }

  const contratoError =
    tarifaStatus.kind === "error"
      ? tarifaStatus.fieldErrors?.contratoId?.[0]
      : undefined;

  const servicioError =
    tarifaStatus.kind === "error"
      ? tarifaStatus.fieldErrors?.servicioId?.[0]
      : undefined;

  const categoriaError =
    tarifaStatus.kind === "error"
      ? tarifaStatus.fieldErrors?.categoriaAfiliacionId?.[0]
      : undefined;

  const admisionPacienteError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.pacienteId?.[0]
      : undefined;

  const admisionDescuentoError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.descuentoInput?.[0]
      : undefined;

  const admisionValorRecibidoError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.valorRecibido?.[0]
      : undefined;

  const admisionMetodoPagoError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.metodoPago?.[0]
      : undefined;

  const admisionReferenciaPagoError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.referenciaPago?.[0]
      : undefined;

  const admisionRazonDescuentoError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.razonDescuento?.[0]
      : undefined;

  const admisionObservacionError =
    admisionStatus.kind === "error"
      ? admisionStatus.fieldErrors?.observacion?.[0]
      : undefined;

  return (
    <section className="rounded-3xl border bg-background shadow-sm">
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Paso 2 del flujo</p>
          <h2 className="text-xl font-semibold tracking-tight">
            Configuración de admisión
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona contrato, servicio y categoría válidos para resolver el
            cobro y registrar la admisión.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isReady
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : canStartAdmision
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {canStartAdmision ? "En proceso" : "Bloqueado"}
          </span>

          <span className="text-2xl leading-none text-muted-foreground">
            {isOpen ? "-" : "+"}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t px-6 pb-6 pt-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border bg-muted/30 p-4">
              {selectedPatient ? (
                <div className="mb-4 rounded-2xl border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Paciente seleccionado
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {selectedPatient.nombreCompleto}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedPatient.tipoDocumento} ·{" "}
                    {selectedPatient.numeroDocumento}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="admision-contrato"
                    className="text-sm font-medium text-foreground"
                  >
                    Contrato
                  </label>
                  <select
                    id="admision-contrato"
                    value={contratoId}
                    onChange={(e) => handleContratoChange(e.target.value)}
                    disabled={!canStartAdmision || isBusy}
                    className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Selecciona un contrato</option>
                    {contratos.map((contrato) => (
                      <option key={contrato.id} value={contrato.id}>
                        {contrato.nombre} · {contrato.tipo}
                      </option>
                    ))}
                  </select>
                  {contratoError ? (
                    <p className="text-sm text-destructive">{contratoError}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="admision-servicio"
                    className="text-sm font-medium text-foreground"
                  >
                    Servicio
                  </label>
                  <select
                    id="admision-servicio"
                    value={servicioId}
                    onChange={(e) => handleServicioChange(e.target.value)}
                    disabled={!canStartAdmision || !contratoSeleccionado || isBusy}
                    className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {contratoSeleccionado
                        ? serviciosDisponibles.length > 0
                          ? "Selecciona un servicio"
                          : "No hay servicios activos para este contrato"
                        : "Primero selecciona contrato"}
                    </option>
                    {serviciosDisponibles.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.codigo ? `${servicio.codigo} · ` : ""}
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                  {servicioError ? (
                    <p className="text-sm text-destructive">{servicioError}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="admision-categoria"
                    className="text-sm font-medium text-foreground"
                  >
                    Categoría de afiliación
                  </label>
                  <select
                    id="admision-categoria"
                    value={categoriaId}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                    disabled={
                      !canStartAdmision ||
                      !contratoSeleccionado ||
                      !servicioSeleccionado ||
                      !requiereCategoria ||
                      isBusy
                    }
                    className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {!contratoSeleccionado
                        ? "Primero selecciona contrato"
                        : !servicioSeleccionado
                          ? "Primero selecciona servicio"
                          : requiereCategoria
                            ? "Selecciona una categoría"
                            : "No aplica para esta combinación"}
                    </option>
                    {categoriasDisponibles.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.codigo} · {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  {categoriaError ? (
                    <p className="text-sm text-destructive">{categoriaError}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConsultarTarifa}
                  disabled={!canConsultarTarifa}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTarifaPending ? "Consultando..." : "Consultar tarifa"}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isBusy}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Limpiar selección
                </button>
              </div>

              {tarifaStatus.kind === "found" ? (
                <div className="mt-6 space-y-4 rounded-3xl border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Cálculo del cobro
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      El descuento solo se habilita cuando el contrato es
                      PARTICULAR.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="descuento-input"
                        className="text-sm font-medium text-foreground"
                      >
                        Descuento
                      </label>
                      <input
                        id="descuento-input"
                        type="text"
                        value={descuentoInput}
                        onChange={(e) =>
                          setDescuentoInput(e.target.value.toUpperCase())
                        }
                        disabled={!descuentoPermitido || isRegisterPending}
                        placeholder={
                          descuentoPermitido
                            ? "Ej. 5000 o 10%"
                            : "Solo para contrato particular"
                        }
                        className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <p className="text-sm text-muted-foreground">
                        {descuentoPermitido
                          ? descuentoPreview.tipo === "ERROR"
                            ? "Usa un valor fijo o un porcentaje válido. Ejemplo: 5000 o 10%."
                            : `Descuento aplicado: ${formatMoney(descuentoAplicado)}`
                          : "Este contrato no permite descuento."}
                      </p>
                      {admisionDescuentoError ? (
                        <p className="text-sm text-destructive">
                          {admisionDescuentoError}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="valor-recibido"
                        className="text-sm font-medium text-foreground"
                      >
                        Valor recibido
                      </label>
                      <input
                        id="valor-recibido"
                        type="text"
                        inputMode="numeric"
                        value={valorRecibido}
                        onChange={(e) =>
                          setValorRecibido(sanitizeMoneyInput(e.target.value))
                        }
                        disabled={isRegisterPending}
                        placeholder="Ej. 20000"
                        className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                      />
                      <p className="text-sm text-muted-foreground">
                        Registra el valor entregado por el paciente.
                      </p>
                      {admisionValorRecibidoError ? (
                        <p className="text-sm text-destructive">
                          {admisionValorRecibidoError}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="metodo-pago"
                        className="text-sm font-medium text-foreground"
                      >
                        Método de pago
                      </label>
                      <select
                        id="metodo-pago"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        disabled={isRegisterPending}
                        className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                      >
                        <option value="">Selecciona un método</option>
                        {METODO_PAGO_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      {admisionMetodoPagoError ? (
                        <p className="text-sm text-destructive">
                          {admisionMetodoPagoError}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="referencia-pago"
                        className="text-sm font-medium text-foreground"
                      >
                        Referencia de pago
                      </label>
                      <input
                        id="referencia-pago"
                        type="text"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                        disabled={isRegisterPending}
                        placeholder="Opcional"
                        className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                      />
                      <p className="text-sm text-muted-foreground">
                        Útil para Nequi, transferencia, tarjeta o comprobantes.
                      </p>
                      {admisionReferenciaPagoError ? (
                        <p className="text-sm text-destructive">
                          {admisionReferenciaPagoError}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="razon-descuento"
                        className="text-sm font-medium text-foreground"
                      >
                        Razón del descuento
                      </label>
                      <input
                        id="razon-descuento"
                        type="text"
                        value={razonDescuento}
                        onChange={(e) => setRazonDescuento(e.target.value)}
                        disabled={!descuentoPermitido || isRegisterPending}
                        placeholder="Opcional"
                        className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      {admisionRazonDescuentoError ? (
                        <p className="text-sm text-destructive">
                          {admisionRazonDescuentoError}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="observacion"
                        className="text-sm font-medium text-foreground"
                      >
                        Observación
                      </label>
                      <textarea
                        id="observacion"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        disabled={isRegisterPending}
                        placeholder="Opcional"
                        rows={3}
                        className="w-full rounded-2xl border bg-background px-3 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      {admisionObservacionError ? (
                        <p className="text-sm text-destructive">
                          {admisionObservacionError}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Valor base
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {formatMoney(valorBase)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Descuento
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {formatMoney(descuentoAplicado)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Total a pagar
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {formatMoney(totalPagar)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Valor recibido
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        {formatMoney(recibido)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
                    {recibido === 0 ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Esperando pago
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ingresa el valor recibido para calcular si hay vuelto.
                        </p>
                      </div>
                    ) : faltante > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          Falta dinero para completar el pago
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Faltante: {formatMoney(faltante)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          Pago suficiente
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Vuelto: {formatMoney(vuelto)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleRegistrarAdmision}
                      disabled={!canRegistrarAdmision}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRegisterPending
                        ? "Registrando..."
                        : "Registrar admisión"}
                    </button>
                  </div>

                  {admisionPacienteError ? (
                    <p className="text-sm text-destructive">
                      {admisionPacienteError}
                    </p>
                  ) : null}

                  {admisionStatus.kind === "error" ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                      <p className="text-sm font-medium text-destructive">
                        No se pudo registrar la admisión
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {admisionStatus.message}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!canStartAdmision ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Este paso se habilita cuando el paciente ya quedó listo en el
                  paso 1.
                </p>
              ) : tarifaStatus.kind === "error" ? (
                <p className="mt-4 text-sm text-destructive">
                  {tarifaStatus.message}
                </p>
              ) : tarifaStatus.kind === "not-found" ? (
                <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
                  No se encontró una tarifa vigente para la selección actual.
                </p>
              ) : tarifaStatus.kind === "found" ? (
                <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
                  Tarifa encontrada y lista para registrar la admisión.
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Ahora solo verás servicios y categorías válidos para el
                  contrato seleccionado.
                </p>
              )}
            </div>

            <AdmisionPosSummary
              paciente={
                selectedPatient
                  ? {
                      nombreCompleto: selectedPatient.nombreCompleto,
                      tipoDocumento: selectedPatient.tipoDocumento,
                      numeroDocumento: selectedPatient.numeroDocumento,
                    }
                  : null
              }
              contrato={
                contratoSeleccionado
                  ? {
                      nombre: contratoSeleccionado.nombre,
                      tipo: contratoSeleccionado.tipo,
                    }
                  : null
              }
              servicio={
                servicioSeleccionado
                  ? {
                      nombre: servicioSeleccionado.nombre,
                      codigo: servicioSeleccionado.codigo,
                    }
                  : null
              }
              categoria={
                categoriaSeleccionada
                  ? {
                      codigo: categoriaSeleccionada.codigo,
                      nombre: categoriaSeleccionada.nombre,
                    }
                  : null
              }
              tipoCobro={
                tarifaStatus.kind === "found"
                  ? tarifaStatus.tarifa.tipoCobro
                  : null
              }
              metodoPago={metodoPago || null}
              referenciaPago={referenciaPago || null}
              descuentoPermitido={descuentoPermitido}
              totalPagar={totalPagar}
              valorRecibido={recibido}
              vuelto={vuelto}
              descuentoAplicado={descuentoAplicado}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}



