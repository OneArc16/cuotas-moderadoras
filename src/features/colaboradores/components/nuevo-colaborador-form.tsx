"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  createColaborador,
  type CreateColaboradorActionState,
} from "@/features/colaboradores/lib/create-colaborador";

type RolOption = {
  id: number;
  nombre: string;
};

const ESTADOS = ["ACTIVO", "INACTIVO", "BLOQUEADO"] as const;

const initialState: CreateColaboradorActionState = {
  success: false,
  message: "",
  errors: {},
};

function forceUppercase(event: React.FormEvent<HTMLInputElement>) {
  event.currentTarget.value = event.currentTarget.value.toUpperCase();
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Guardando..." : "Guardar colaborador"}
    </button>
  );
}

function FieldError({ error }: { error?: string[] }) {
  if (!error?.length) return null;

  return <p className="text-sm text-red-600">{error[0]}</p>;
}

export function NuevoColaboradorForm({ roles }: { roles: RolOption[] }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createColaborador, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      router.push("/colaboradores");
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state.message, state.success]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="tipoDocumento"
            className="text-sm font-medium text-foreground"
          >
            Tipo de documento
          </label>
          <select
            id="tipoDocumento"
            name="tipoDocumento"
            defaultValue="CC"
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground"
          >
            <option value="CC">Cédula de ciudadanía</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="RC">Registro civil</option>
            <option value="PASAPORTE">Pasaporte</option>
            <option value="NIT">NIT</option>
            <option value="OTRO">Otro</option>
          </select>
          <FieldError error={state.errors?.tipoDocumento} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="numeroDocumento"
            className="text-sm font-medium text-foreground"
          >
            Número de documento
          </label>
          <input
            id="numeroDocumento"
            name="numeroDocumento"
            type="text"
            placeholder="Número de documento"
            onInput={forceUppercase}
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.numeroDocumento} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="primerNombre"
            className="text-sm font-medium text-foreground"
          >
            Primer nombre
          </label>
          <input
            id="primerNombre"
            name="primerNombre"
            type="text"
            placeholder="Primer nombre"
            onInput={forceUppercase}
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.primerNombre} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="segundoNombre"
            className="text-sm font-medium text-foreground"
          >
            Segundo nombre
          </label>
          <input
            id="segundoNombre"
            name="segundoNombre"
            type="text"
            placeholder="Opcional"
            onInput={forceUppercase}
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.segundoNombre} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="primerApellido"
            className="text-sm font-medium text-foreground"
          >
            Primer apellido
          </label>
          <input
            id="primerApellido"
            name="primerApellido"
            type="text"
            placeholder="Primer apellido"
            onInput={forceUppercase}
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.primerApellido} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="segundoApellido"
            className="text-sm font-medium text-foreground"
          >
            Segundo apellido
          </label>
          <input
            id="segundoApellido"
            name="segundoApellido"
            type="text"
            placeholder="Opcional"
            onInput={forceUppercase}
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.segundoApellido} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="telefono"
            className="text-sm font-medium text-foreground"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="text"
            placeholder="Opcional"
            onInput={forceUppercase}
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.telefono} />
        </div>

        <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="correo@dominio.com"
              className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
            />
          <FieldError error={state.errors?.email} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-foreground"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="usuario"
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.username} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="rolId"
            className="text-sm font-medium text-foreground"
          >
            Rol
          </label>
          <select
            id="rolId"
            name="rolId"
            defaultValue=""
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground"
          >
            <option value="" disabled>
              Seleccionar rol
            </option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          <FieldError error={state.errors?.rolId} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="estado"
            className="text-sm font-medium text-foreground"
          >
            Estado inicial
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue="ACTIVO"
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-foreground"
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <FieldError error={state.errors?.estado} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Contraseña temporal
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            className="h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
          />
          <FieldError error={state.errors?.password} />
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
        Al guardar, el colaborador quedará creado en la base de datos y el
        listado se actualizará automáticamente.
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/colaboradores"
          className="inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Cancelar
        </Link>

        <SubmitButton />
      </div>
    </form>
  );
}