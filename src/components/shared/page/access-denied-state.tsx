import Link from "next/link";

type AccessDeniedStateProps = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

export function AccessDeniedState({
  title,
  description,
  href = "/",
  actionLabel = "Volver al inicio",
}: AccessDeniedStateProps) {
  return (
    <section className="rounded-[24px] border border-destructive/20 bg-destructive/5 p-5 shadow-[0_16px_36px_-30px_color-mix(in_oklab,var(--destructive)_35%,transparent)]">
      <h3 className="text-base font-semibold text-destructive">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex rounded-2xl border border-border/70 px-4 py-2 text-sm font-medium transition hover:bg-secondary/60"
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}
