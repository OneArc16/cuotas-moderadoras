"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { createPacienteRapidoAction } from "@/features/admisiones/lib/create-paciente-rapido-action";
import { searchPacienteByDocumentoAction } from "@/features/admisiones/lib/search-paciente-by-documento-action";

export type PacienteReadyPayload = {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
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
  | {
      kind: "idle";
    }
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

type CreateFormValues = {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  telefono: string;
};

type CreateFieldErrors = {
  tipoDocumento?: string[];
  numeroDocumento?: string[];
  primerNombre?: string[];
  segundoNombre?: string[];
  primerApellido?: string[];
  segundoApellido?: string[];
  telefono?: string[];
};

const INITIAL_CREATE_FORM: CreateFormValues = {
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  telefono: "",
};

function toUpperInput(value: string) {
  return value.toUpperCase();
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

  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createValues, setCreateValues] =
    useState<CreateFormValues>(INITIAL_CREATE_FORM);
  const [createFieldErrors, setCreateFieldErrors] =
    useState<CreateFieldErrors>({});
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const [isSearchPending, startSearchTransition] = useTransition();
  const [isCreatePending, startCreateTransition] = useTransition();

  const numeroDocumentoLimpio = useMemo(
    () => numeroDocumento.replace(/\s+/g, "").trim(),
    [numeroDocumento],
  );

  const canSearch =
    canStartAdmision &&
    tipoDocumento.length > 0 &&
    numeroDocumentoLimpio.length >= 4 &&
    !isSearchPending &&
    !isCreatePending;

  useEffect(() => {
    if (searchStatus.kind === "not-found") {
      setCreateFormOpen(true);
      setCreateFieldErrors({});
      setCreateMessage(null);
      setCreateValues(INITIAL_CREATE_FORM);
      return;
    }

    if (searchStatus.kind === "found" || searchStatus.kind === "idle") {
      setCreateFormOpen(false);
      setCreateFieldErrors({});
      setCreateMessage(null);
    }
  }, [searchStatus]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSearch) return;

    setCreateFieldErrors({});
    setCreateMessage(null);

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
    setCreateFormOpen(false);
    setCreateValues(INITIAL_CREATE_FORM);
    setCreateFieldErrors({});
    setCreateMessage(null);
    onFlowReset();
  }

  function updateCreateField<K extends keyof CreateFormValues>(
    key: K,
    value: CreateFormValues[K],
  ) {
    setCreateValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleCreatePaciente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (searchStatus.kind !== "not-found") return;

    setCreateFieldErrors({});
    setCreateMessage(null);

    startCreateTransition(async () => {
      const result = await createPacienteRapidoAction({
        tipoDocumento: searchStatus.tipoDocumento,
        numeroDocumento: searchStatus.numeroDocumento,
        primerNombre: createValues.primerNombre,
        segundoNombre: createValues.segundoNombre,
        primerApellido: createValues.primerApellido,
        segundoApellido: createValues.segundoApellido,
        telefono: createValues.telefono,
      });

      if (!result.ok) {
        setCreateFieldErrors(result.fieldErrors ?? {});
        setCreateMessage(result.message);
        return;
      }

      setSearchStatus({
        kind: "found",
        tipoDocumento: result.paciente.tipoDocumento,
        numeroDocumento: result.paciente.numeroDocumento,
        paciente: result.paciente,
      });

      onPatientReady(result.paciente);

      setCreateFieldErrors({});
      setCreateMessage(null);
      setCreateFormOpen(false);
    });
  }

  const tipoDocumentoError =
    searchStatus.kind === "error"
      ? searchStatus.fieldErrors?.tipoDocumento?.[0]
      : undefined;

  const numeroDocumentoError =
    searchStatus.kind === "error"
      ? searchStatus.fieldErrors?.numeroDocumento?.[0]
      : undefined;

  const isBusy = isSearchPending || isCreatePending;
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
            documento.
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
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="rounded-3xl border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                Consulta de paciente
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta búsqueda ya consulta la base de datos por documento.
              </p>

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

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!canSearch}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearchPending ? "Buscando..." : "Buscar paciente"}
                  </button>

                  <button
                    type="button"
                    disabled={searchStatus.kind !== "not-found"}
                    onClick={() => setCreateFormOpen(true)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Crear paciente rápido
                  </button>

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
                <p className="mt-4 text-sm text-destructive">
                  Este bloque se habilita cuando existe sesión operativa activa y
                  jornada de caja abierta o reabierta.
                </p>
              ) : searchStatus.kind === "error" ? (
                <p className="mt-4 text-sm text-destructive">
                  {searchStatus.message}
                </p>
              ) : searchStatus.kind === "not-found" ? (
                <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
                  No se encontró el paciente. Ya puedes registrarlo aquí mismo.
                </p>
              ) : searchStatus.kind === "found" ? (
                <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
                  Paciente listo. Ya puedes continuar al paso 2.
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Busca un paciente por documento para continuar.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">
                Resultado de la búsqueda
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aquí mostramos el resultado real y el registro rápido si no
                existe.
              </p>

              <div className="mt-5 rounded-3xl border bg-background p-5">
                {searchStatus.kind === "idle" ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Estado inicial
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Aún no se ha realizado ninguna búsqueda.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Paciente existente
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Cuando exista, mostraremos su información básica para
                          continuar el flujo.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Paciente nuevo
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Si no existe, aquí activaremos el registro rápido.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {searchStatus.kind === "error" ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-destructive">
                      No se pudo completar la búsqueda
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchStatus.message}
                    </p>
                  </div>
                ) : null}

                {searchStatus.kind === "not-found" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Paciente no encontrado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        No existe un paciente con este documento en la base
                        actual.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Tipo de documento
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.tipoDocumento}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Número de documento
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.numeroDocumento}
                        </p>
                      </div>
                    </div>

                    {createFormOpen ? (
                      <form
                        onSubmit={handleCreatePaciente}
                        className="space-y-4 rounded-3xl border bg-muted/20 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Registro rápido de paciente
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Completa los datos mínimos para continuar la
                            admisión.
                          </p>
                        </div>

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
                              value={createValues.primerNombre}
                              onChange={(e) =>
                                updateCreateField(
                                  "primerNombre",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isCreatePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {createFieldErrors.primerNombre?.[0] ? (
                              <p className="text-sm text-destructive">
                                {createFieldErrors.primerNombre[0]}
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
                              value={createValues.segundoNombre}
                              onChange={(e) =>
                                updateCreateField(
                                  "segundoNombre",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isCreatePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {createFieldErrors.segundoNombre?.[0] ? (
                              <p className="text-sm text-destructive">
                                {createFieldErrors.segundoNombre[0]}
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
                              value={createValues.primerApellido}
                              onChange={(e) =>
                                updateCreateField(
                                  "primerApellido",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isCreatePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {createFieldErrors.primerApellido?.[0] ? (
                              <p className="text-sm text-destructive">
                                {createFieldErrors.primerApellido[0]}
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
                              value={createValues.segundoApellido}
                              onChange={(e) =>
                                updateCreateField(
                                  "segundoApellido",
                                  toUpperInput(e.target.value),
                                )
                              }
                              disabled={isCreatePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {createFieldErrors.segundoApellido?.[0] ? (
                              <p className="text-sm text-destructive">
                                {createFieldErrors.segundoApellido[0]}
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
                              value={createValues.telefono}
                              onChange={(e) =>
                                updateCreateField("telefono", e.target.value)
                              }
                              disabled={isCreatePending}
                              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {createFieldErrors.telefono?.[0] ? (
                              <p className="text-sm text-destructive">
                                {createFieldErrors.telefono[0]}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {createFieldErrors.numeroDocumento?.[0] ? (
                          <p className="text-sm text-destructive">
                            {createFieldErrors.numeroDocumento[0]}
                          </p>
                        ) : null}

                        {createMessage ? (
                          <p className="text-sm text-destructive">
                            {createMessage}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={isCreatePending}
                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isCreatePending
                              ? "Creando..."
                              : "Guardar paciente"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCreateFormOpen(false)}
                            disabled={isCreatePending}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Ocultar formulario
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          Formulario disponible
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Puedes abrir el registro rápido con el botón “Crear
                          paciente rápido”.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}

                {searchStatus.kind === "found" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Paciente encontrado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ya puedes continuar con contrato, servicio y tarifa.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-muted/40 p-4 sm:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Nombre completo
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.paciente.nombreCompleto}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Documento
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.paciente.tipoDocumento} ·{" "}
                          {searchStatus.paciente.numeroDocumento}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Estado
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.paciente.estado}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-muted/40 p-4 sm:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Teléfono
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {searchStatus.paciente.telefono ||
                            "Sin teléfono registrado"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Paso 1 completado
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        El siguiente bloque ya puede continuar con contrato,
                        categoría y servicio.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}