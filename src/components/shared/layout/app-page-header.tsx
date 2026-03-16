import type { ReactNode } from "react";

type HeaderStat = {
  label: string;
  value: string;
  helper?: string;
};

type AppPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  statusChips?: ReactNode;
  aside?: ReactNode;
  stats?: HeaderStat[];
};

export function AppPageHeader({
  eyebrow,
  title,
  description,
  statusChips,
  aside,
  stats = [],
}: AppPageHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[32px] border bg-background shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>

            {statusChips ? (
              <div className="mt-4 flex flex-wrap gap-2">{statusChips}</div>
            ) : null}
          </div>

          {aside ? <div className="xl:min-w-[320px]">{aside}</div> : null}
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={`${stat.label}-${stat.value}`}
              className="rounded-2xl border bg-muted/20 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              {stat.helper ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.helper}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}