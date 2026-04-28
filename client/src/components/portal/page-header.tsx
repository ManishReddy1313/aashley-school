import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  actions,
}: PageHeaderProps) {
  return (
    <header className="bg-background border-b border-border px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
        <div className="min-w-0">
          {backHref ? (
            <Link href={backHref}>
              <a className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <ArrowLeft className="h-4 w-4" />
                <span>{backLabel}</span>
              </a>
            </Link>
          ) : null}
          <h1 className="font-serif font-normal text-2xl text-foreground">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center justify-end gap-2 flex-wrap">{actions}</div> : null}
      </div>
    </header>
  );
}
