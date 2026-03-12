import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border bg-background p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">Sesión iniciada</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Bienvenido al sistema
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ya estás autenticado correctamente.
          </p>
        </div>
      </div>
    </main>
  );
}