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
  const hasAside = Boolean(aside);
  const hasStats = stats.length > 0;

  return (
    <section className="overflow-hidden rounded-[28px] border border-border/80 bg-card/95 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-sm">
      <div
        className={`bg-secondary/45 px-5 py-5 sm:px-6 sm:py-6 ${
          hasStats ? "border-b border-border/70" : ""
        }`}
      >
        <div
          className={
            hasAside
              ? "flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.82fr)] xl:gap-6"
              : "max-w-3xl"
          }
        >
          <div className="max-w-3xl">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>

            {statusChips ? (
              <div className="mt-4 flex flex-wrap gap-2.5">{statusChips}</div>
            ) : null}
          </div>

          {hasAside ? (
            <div className="xl:max-w-[320px] xl:justify-self-end">{aside}</div>
          ) : null}
        </div>
      </div>

      {hasStats ? (
        <div className="grid gap-3 px-5 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={`${stat.label}-${stat.value}`}
              className="rounded-[24px] border border-border/70 bg-background/85 p-4 shadow-[0_10px_24px_-20px_color-mix(in_oklab,var(--foreground)_30%,transparent)]"
            >
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-foreground">
                {stat.value}
              </p>
              {stat.helper ? (
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
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