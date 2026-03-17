"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShieldCheck, WalletCards, ReceiptText } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const { error } = await authClient.signIn.username({
      username,
      password,
      callbackURL: "/",
      rememberMe: true,
    });

    setIsPending(false);

    if (error) {
      toast.error(error.message || "No se pudo iniciar sesión");
      return;
    }

    toast.success("Sesión iniciada correctamente");
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_88%,white_12%)_0%,color-mix(in_oklab,var(--primary)_68%,var(--foreground)_32%)_100%)] px-12 py-10 text-primary-foreground">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Acceso seguro
            </div>

            <div className="mt-10 max-w-md">
              <h1 className="text-4xl font-semibold leading-tight">
                Control simple y moderno para cuotas moderadoras y particulares
              </h1>
              <p className="mt-4 text-base leading-7 text-primary-foreground/85">
                Diseñado para admisionistas. Rápido de usar, claro en caja y con
                trazabilidad de cada movimiento.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="rounded-xl bg-white/15 p-2">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Apertura y cierre de caja por piso</p>
                <p className="text-sm text-primary-foreground/80">
                  Control compartido entre módulos del mismo piso.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="rounded-xl bg-white/15 p-2">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Cobros claros y trazables</p>
                <p className="text-sm text-primary-foreground/80">
                  Cuotas, particulares, descuentos, devoluciones y anulaciones.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md rounded-[28px] border border-border/80 bg-card p-8 shadow-[0_20px_60px_color-mix(in_oklab,var(--primary)_10%,transparent)]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Cuotas Moderadoras
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-12 rounded-2xl border-border bg-muted/45 px-4 shadow-none focus-visible:ring-2 focus-visible:ring-primary/25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-2xl border-border bg-muted/45 px-4 shadow-none focus-visible:ring-2 focus-visible:ring-primary/25"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Acceso solo para personal autorizado
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

