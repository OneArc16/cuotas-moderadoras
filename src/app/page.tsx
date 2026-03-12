import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  FileSpreadsheet,
  LayoutDashboard,
} from "lucide-react";

const modules = [
  {
    name: "Dashboard",
    description: "KPIs, estado de caja y resumen operativo del dia.",
    icon: LayoutDashboard,
  },
  {
    name: "Admisiones",
    description: "Registro rapido de pacientes, servicios y cobros.",
    icon: Building2,
  },
  {
    name: "Caja",
    description: "Aperturas, cierres, diferencias y trazabilidad.",
    icon: CircleDollarSign,
  },
  {
    name: "Reportes",
    description: "Consulta administrativa y exportes a Excel.",
    icon: FileSpreadsheet,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#e2e8f0)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="overflow-hidden rounded-4xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
                Base inicial del sistema
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                  Cuotas moderadoras, admisiones y caja en una sola operacion.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Primera pantalla del proyecto para reemplazar la plantilla y dejar visible
                  la estructura funcional definida para la V1.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl bg-slate-900 p-5 text-sm text-slate-100 shadow-lg sm:grid-cols-3 md:min-w-[360px]">
              <div>
                <p className="text-slate-400">Operacion</p>
                <p className="mt-1 font-semibold">IPS por pisos y cajas</p>
              </div>
              <div>
                <p className="text-slate-400">Stack</p>
                <p className="mt-1 font-semibold">Next.js + Prisma</p>
              </div>
              <div>
                <p className="text-slate-400">Objetivo</p>
                <p className="mt-1 font-semibold">Rapidez y trazabilidad</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <article
                key={module.name}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-slate-300 transition-colors group-hover:text-slate-700" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-900">{module.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
