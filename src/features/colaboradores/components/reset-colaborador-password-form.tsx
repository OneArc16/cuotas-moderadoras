"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  resetColaboradorPassword,
  type ResetColaboradorPasswordActionState,
} from "@/features/colaboradores/lib/reset-colaborador-password";

const initialState: ResetColaboradorPasswordActionState = {
  success: false,
  message: "",
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Actualizando..." : "Actualizar contraseña"}
    </button>
  );
}

function FieldError({ error }: { error?: string[] }) {
  if (!error?.length) return null;

  return <p className="text-sm text-red-600">{error[0]}</p>;
}

type PasswordInputProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  error?: string[];
};

function PasswordInput({
  id,
  name,
  label,
  placeholder = "********",
  error,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="h-11 w-full rounded-2xl border bg-background px-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <FieldError error={error} />
    </div>
  );
}

export function ResetColaboradorPasswordForm({
  colaboradorId,
}: {
  colaboradorId: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    resetColaboradorPassword,
    initialState,
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
      return;
    }

    toast.error(state.message);
  }, [state.message, state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={colaboradorId} />

      <div className="grid gap-4 md:grid-cols-2">
        <PasswordInput
          id="password"
          name="password"
          label="Nueva contraseña temporal"
          error={state.errors?.password}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar contraseña"
          error={state.errors?.confirmPassword}
        />
      </div>

      <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
        Esta acción reemplaza la contraseña actual del colaborador por una nueva
        contraseña temporal.
      </div>

      <div className="flex justify-end border-t pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}