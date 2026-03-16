"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { createPacienteRapidoAction } from "@/features/admisiones/lib/create-paciente-rapido-action";
import { searchPacienteByDocumentoAction } from "@/features/admisiones/lib/search-paciente-by-documento-action";
import { updatePacienteRapidoAction } from "@/features/admisiones/lib/update-paciente-rapido-action";

export type PacienteReadyPayload = {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string;
  telefono: string | null;
  estado: string;
};

type PacienteLookupCardProps = {
  canStartAdmision: boolean;
  isOpen: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  onPatientReady: (patient: PacienteReadyPayload) => void;
  onFlowReset: () => void;
};

const DOCUMENT_TYPES = [
  { value: "CC", label: "CC" },
  { value: "CE", label: "CE" },
  { value: "TI", label: "TI" },
  { value: "RC", label: "RC" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
  { value: "OTRO", label: "Otro" },
] as const;

type SearchStatus =
  | { kind: "idle" }
  | {
      kind: "error";
      message: string;
      fieldErrors?: {
        tipoDocumento?: string[];
        numeroDocumento?: string[];
      };
    }
  | {
      kind: "not-found";
      tipoDocumento: string;
      numeroDocumento: string;
    }
  | {
      kind: "found";
      tipoDocumento: string;
      numeroDocumento: string;
      paciente: PacienteReadyPayload;
    };

type FormValues = {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  telefono: string;
};

type FormFieldErrors = {
  pacienteId?: string[];
  tipoDocumento?: string[];
  numeroDocumento?: string[];
  primerNombre?: string[];
  segundoNombre?: string[];
  primerApellido?: string[];
  segundoApellido?: string[];
  telefono?: string[];
};

const INITIAL_FORM: FormValues = {
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  telefono: "",
};

function toUpperInput(value: string) {
  return value.toUpperCase();
}

function getFormValuesFromPaciente(paciente: PacienteReadyPayload): FormValues {
  return {
    primerNombre: paciente.primerNombre,
    segundoNombre: paciente.segundoNombre ?? "",
    primerApellido: paciente.primerApellido,
    segundoApellido: paciente.segundoApellido ?? "",
    telefono: paciente.telefono ?? "",
  };
}

export function PacienteLookupCard({
  canStartAdmision,
  isOpen,
  onOpenChange,
  onPatientReady,
  onFlowReset,
}: PacienteLookupCardProps) {
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({
    kind: "idle",
  });

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(INITIAL_FORM);
  const [formFieldErrors, setFormFieldErrors] = useState<FormFieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [isSearchPending, startSearchTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();

  const numeroDocumentoLimpio = useMemo(
    () => numeroDocumento.replace(/\s+/g, "").trim(),
    [numeroDocumento],
  );

  const canSearch =
    canStartAdmision &&
    tipoDocumento.length > 0 &&
    numeroDocumentoLimpio.length >= 4 &&
    !isSearchPending &&
    !isSavePending;

  useEffect(() => {
    if (searchStatus.kind === "not-found") {
      setFormMode("create");
      setFormFieldErrors({});
      setFormMessage(null);
      setFormValues(INITIAL_FORM);
      return;
    }

    if (searchStatus.kind === "idle") {
      setFormMode(null);
      setFormFieldErrors({});
      setFormMessage(null);
      setFormValues(INITIAL_FORM);
    }
  }, [searchStatus]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSearch) return;

    setFormFieldErrors({});
    setFormMessage(null);

    const payload = {
      tipoDocumento,
      numeroDocumento: numeroDocumentoLimpio,
    };

    startSearchTransition(async () => {
      const result = await searchPacienteByDocumentoAction(payload);

      if (!result.ok) {
        setSearchStatus({
          kind: "error",
          message: result.message,
          fieldErrors: result.fieldErrors,
        });
        return;
      }

      if (result.notFound || !result.paciente) {
        setSearchStatus({
          kind: "not-found",
          tipoDocumento,
          numeroDocumento: numeroDocumentoLimpio,
        });
        return;
      }

      setSearchStatus({
        kind: "found",
        tipoDocumento,
        numeroDocumento: numeroDocumentoLimpio,
        paciente: result.paciente,
      });

      onPatientReady(result.paciente);
    });
  }

  function handleReset() {
    setTipoDocumento("");
    setNumeroDocumento("");
    setSearchStatus({ kind: "idle" });
    setFormMode(null);
    setFormValues(INITIAL_FORM);
    setFormFieldErrors({});
    setFormMessage(null);
    onFlowReset();
  }

  function updateFormField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function openEditForm() {
    if (searchStatus.kind !== "found") return;

    setFormMode("edit");
    setFormFieldErrors({});
    setFormMessage(null);
    setFormValues(getFormValuesFromPaciente(searchStatus.paciente));
  }

  function handleCancelForm() {
    setFormFieldErrors({});
    setFormMessage(null);

    if (searchStatus.kind === "not-found") {
      setFormMode(null);
      return;
    }

    setFormMode(null);
  }

  function handleSavePaciente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setFormFieldErrors({});
    setFormMessage(null);

    if (formMode === "create" && searchStatus.kind === "not-found") {
      startSaveTransition(async () => {
        const result = await createPacienteRapidoAction({
          tipoDocumento: searchStatus.tipoDocumento,
          numeroDocumento: searchStatus.numeroDocumento,
          primerNombre: formValues.primerNombre,
          segundoNombre: formValues.segundoNombre,
          primerApellido: formValues.primerApellido,
          segundoApellido: formValues.segundoApellido,
          telefono: formValues.telefono,
        });

        if (!result.ok) {
          setFormFieldErrors(result.fieldErrors ?? {});
          setFormMessage(result.message);
          return;
        }

        setSearchStatus({
          kind: "found",
          tipoDocumento: result.paciente.tipoDocumento,
          numeroDocumento: result.paciente.numeroDocumento,
          paciente: result.paciente,
        });

        onPatientReady(result.paciente);
        setFormMode(null);
        setFormFieldErrors({});
        setFormMessage(null);
      });

      return;
    }

    if (formMode === "edit" && searchStatus.kind === "found") {
      startSaveTransition(async () => {
        const result = await updatePacienteRapidoAction({
          pacienteId: searchStatus.paciente.id,
          primerNombre: formValues.primerNombre,
          segundoNombre: formValues.segundoNombre,
          primerApellido: formValues.primerApellido,
          segundoApellido: formValues.segundoApellido,
          telefono: formValues.telefono,
        });

        if (!result.ok) {
          setFormFieldErrors(result.fieldErrors ?? {});
          setFormMessage(result.message);
          return;
        }

        setSearchStatus({
          kind: "found",
          tipoDocumento: result.paciente.tipoDocumento,
          numeroDocumento: result.paciente.numeroDocumento,
          paciente: result.paciente,
        });

        onPatientReady(result.paciente);
        setFormMode(null);
        setFormFieldErrors({});
        setFormMessage(null);
      });
    }
  }

  const tipoDocumentoError =
    searchStatus.kind === "error"
      ? searchStatus.fieldErrors?.tipoDocumento?.[0]
      : undefined;

  const numeroDocumentoError =
    searchStatus.kind === "error"
      ? searchStatus.fieldErrors?.numeroDocumento?.[0]
      : undefined;

  const isBusy = isSearchPending || isSavePending;
  const isReady = searchStatus.kind === "found";

  return (
    <section className="rounded-3xl border bg-background shadow-sm">
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Paso 1 del flujo</p>
          <h2 className="text-xl font-semibold tracking-tight">
            Buscar o crear paciente
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Primero validamos si el paciente ya existe por tipo y número de
            documento antes de continuar la admisión.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isReady
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isReady ? "Completado" : "Pendiente"}
          </span>

          <span className="text-2xl leading-none text-muted-foreground">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t px-6 pb-6 pt-6">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border bg-muted/30 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Identificación del paciente
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight">
                    Consulta rápida
                  </h3>
                </div>

                <div className="rounded-2xl border bg-background px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Estado
                  </p>
                  <p className="text-sm font-medium">
                    {searchStatus.kind === "found"
                      ? "Encontrado"
                      : searchStatus.kind === "not-found"
                        ? "No existe"
                        : "Pendiente"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="tipo-documento"
                      className="text-sm font-medium text-foreground"
                    >
                      Tipo de documento
                    </label>
                    <select
                      id="tipo-documento"
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      disabled={!canStartAdmision || isBusy}
                      className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Selecciona una opción</option>
                      {DOCUMENT_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {tipoDocumentoError ? (
                      <p className="text-sm text-destructive">
                        {tipoDocumentoError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="numero-documento"
                      className="text-sm font-medium text-foreground"
                    >
                      Número de documento
                    </label>
                    <input
                      id="numero-documento"
                      type="text"
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      placeholder="Ej. 1234567890"
                      disabled={!canStartAdmision || isBusy}
                      className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    {numeroDocumentoError ? (
                      <p className="text-sm text-destructive">
                        {numeroDocumentoError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="submit"
                    disabled={!canSearch}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearchPending ? "Buscando..." : "Buscar paciente"}
                  </button>

                  {searchStatus.kind === "found" ? (
                    <button
                      type="button"
                      onClick={openEditForm}
                      disabled={isBusy}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Editar paciente
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isBusy}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Limpiar
                  </button>
                </div>
              </form>

              {!canStartAdmision ? (
                <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive">
                    El flujo aún no está habilitado
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Primero debe existir una sesión operativa activa y una
                    jornada de caja abierta o reabierta.
                  </p>
                </div>
              ) : searchStatus.kind === "error" ? (
                <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive">
                    No se pudo completar la búsqueda
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchStatus.message}
                  </p>
                </div>
              ) : searchStatus.kind === "not-found" ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Paciente no encontrado
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Se habilitó el formulario de registro en el panel derecho.
                  </p>
                </div>
              ) : searchStatus.kind === "found" ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Paciente listo
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ya puedes continuar al paso 2 o editar su información.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              {searchStatus.kind === "found" ? (
                <section className="rounded-[28px] border bg-background p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Resumen del paciente
                      </p>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight">
                        Paciente identificado
                      </h3>
                    </div>

                    <div className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                      {searchStatus.paciente.estado}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border bg-muted/20 p-4">
                    <div className="rounded-2xl bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Nombre completo
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {searchStatus.paciente.nombreCompleto}
                      </p>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Documento
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.paciente.tipoDocumento} ·{" "}
                          {searchStatus.paciente.numeroDocumento}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Teléfono
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.paciente.telefono ||
                            "Sin teléfono registrado"}
                        </p>
                      </div>
                    </div>

                    {formMode === "edit" ? (
                      <form
                        onSubmit={handleSavePaciente}
                        className="mt-4 space-y-4 rounded-2xl bg-background p-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor="edit-primer-nombre"
                              className="text-sm font-medium text-foreground"
                            >
                              Primer nombre
                            </label>
                            <input
                              id="edit-primer-nombre"
                              type="text"
                              value={formValues.primerNombre}
                              onChange={(e) =>
                                updateFormField(
                                  "primerNombre",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.primerNombre?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.primerNombre[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="edit-segundo-nombre"
                              className="text-sm font-medium text-foreground"
                            >
                              Segundo nombre
                            </label>
                            <input
                              id="edit-segundo-nombre"
                              type="text"
                              value={formValues.segundoNombre}
                              onChange={(e) =>
                                updateFormField(
                                  "segundoNombre",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.segundoNombre?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.segundoNombre[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="edit-primer-apellido"
                              className="text-sm font-medium text-foreground"
                            >
                              Primer apellido
                            </label>
                            <input
                              id="edit-primer-apellido"
                              type="text"
                              value={formValues.primerApellido}
                              onChange={(e) =>
                                updateFormField(
                                  "primerApellido",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.primerApellido?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.primerApellido[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="edit-segundo-apellido"
                              className="text-sm font-medium text-foreground"
                            >
                              Segundo apellido
                            </label>
                            <input
                              id="edit-segundo-apellido"
                              type="text"
                              value={formValues.segundoApellido}
                              onChange={(e) =>
                                updateFormField(
                                  "segundoApellido",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.segundoApellido?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.segundoApellido[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <label
                              htmlFor="edit-telefono"
                              className="text-sm font-medium text-foreground"
                            >
                              Teléfono
                            </label>
                            <input
                              id="edit-telefono"
                              type="text"
                              value={formValues.telefono}
                              onChange={(e) =>
                                updateFormField("telefono", e.target.value)
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.telefono?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.telefono[0]}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {formMessage ? (
                          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                            <p className="text-sm text-destructive">
                              {formMessage}
                            </p>
                          </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="submit"
                            disabled={isSavePending}
                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSavePending
                              ? "Guardando..."
                              : "Guardar cambios"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelForm}
                            disabled={isSavePending}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed bg-background p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-muted-foreground">
                            Resultado del paso
                          </span>
                          <button
                            type="button"
                            onClick={openEditForm}
                            className="inline-flex h-10 items-center justify-center rounded-2xl border px-4 text-sm font-medium transition hover:bg-muted"
                          >
                            Editar información
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {searchStatus.kind === "idle" ? (
                <section className="rounded-[28px] border bg-background p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Vista previa del paciente
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    Esperando búsqueda
                  </h3>

                  <div className="mt-5 rounded-[24px] border bg-muted/20 p-4">
                    <div className="rounded-2xl bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Estado actual
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        Aún no se ha consultado ningún documento
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Busca un paciente existente o crea uno nuevo para seguir
                        al siguiente paso.
                      </p>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Paciente existente
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Verás sus datos básicos y podrás editarlos si hace
                          falta.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Paciente nuevo
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Se abrirá automáticamente el formulario de registro.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {searchStatus.kind === "not-found" ? (
                <section className="rounded-[28px] border bg-background p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Registro rápido
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    Crear paciente
                  </h3>

                  <div className="mt-5 rounded-[24px] border bg-muted/20 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Tipo de documento
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.tipoDocumento}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-background p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Número de documento
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.numeroDocumento}
                        </p>
                      </div>
                    </div>

                    {formMode === "create" ? (
                      <form
                        onSubmit={handleSavePaciente}
                        className="mt-4 space-y-4 rounded-2xl bg-background p-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor="primer-nombre"
                              className="text-sm font-medium text-foreground"
                            >
                              Primer nombre
                            </label>
                            <input
                              id="primer-nombre"
                              type="text"
                              value={formValues.primerNombre}
                              onChange={(e) =>
                                updateFormField(
                                  "primerNombre",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.primerNombre?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.primerNombre[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="segundo-nombre"
                              className="text-sm font-medium text-foreground"
                            >
                              Segundo nombre
                            </label>
                            <input
                              id="segundo-nombre"
                              type="text"
                              value={formValues.segundoNombre}
                              onChange={(e) =>
                                updateFormField(
                                  "segundoNombre",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.segundoNombre?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.segundoNombre[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="primer-apellido"
                              className="text-sm font-medium text-foreground"
                            >
                              Primer apellido
                            </label>
                            <input
                              id="primer-apellido"
                              type="text"
                              value={formValues.primerApellido}
                              onChange={(e) =>
                                updateFormField(
                                  "primerApellido",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.primerApellido?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.primerApellido[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="segundo-apellido"
                              className="text-sm font-medium text-foreground"
                            >
                              Segundo apellido
                            </label>
                            <input
                              id="segundo-apellido"
                              type="text"
                              value={formValues.segundoApellido}
                              onChange={(e) =>
                                updateFormField(
                                  "segundoApellido",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.segundoApellido?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.segundoApellido[0]}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <label
                              htmlFor="telefono"
                              className="text-sm font-medium text-foreground"
                            >
                              Teléfono
                            </label>
                            <input
                              id="telefono"
                              type="text"
                              value={formValues.telefono}
                              onChange={(e) =>
                                updateFormField("telefono", e.target.value)
                              }
                              disabled={isSavePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none"
                            />
                            {formFieldErrors.telefono?.[0] ? (
                              <p className="text-sm text-destructive">
                                {formFieldErrors.telefono[0]}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {formFieldErrors.numeroDocumento?.[0] ? (
                          <p className="text-sm text-destructive">
                            {formFieldErrors.numeroDocumento[0]}
                          </p>
                        ) : null}

                        {formMessage ? (
                          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                            <p className="text-sm text-destructive">
                              {formMessage}
                            </p>
                          </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="submit"
                            disabled={isSavePending}
                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSavePending
                              ? "Creando..."
                              : "Guardar paciente"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelForm}
                            disabled={isSavePending}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Ocultar formulario
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          Formulario oculto
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Abre el formulario para registrar el paciente.
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormMode("create")}
                          className="mt-3 inline-flex h-10 items-center justify-center rounded-2xl border px-4 text-sm font-medium transition hover:bg-muted"
                        >
                          Abrir formulario
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {searchStatus.kind === "error" ? (
                <section className="rounded-[28px] border bg-background p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Resultado de la consulta
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    Error en la búsqueda
                  </h3>

                  <div className="mt-5 rounded-[24px] border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-destructive">
                      No se pudo validar el documento
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchStatus.message}
                    </p>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}