import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "gold" | "success" | "danger";
  trend?: string;
  trendUp?: boolean;
  href?: string;
};

const accentClassMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/8 text-primary",
  gold: "bg-gold/10 text-gold-dark",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-destructive/8 text-destructive",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  trend,
  trendUp,
  href,
}: StatCardProps) {
  const content = (
    <Card className="bg-card border border-border shadow-sm rounded-none hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-bold text-foreground font-sans mt-2">{value}</p>
          {trend ? (
            <p
              className={`text-xs mt-2 ${
                trendUp === undefined
                  ? "text-muted-foreground"
                  : trendUp
                    ? "text-emerald-700"
                    : "text-destructive"
              }`}
            >
              {trend}
            </p>
          ) : null}
        </div>
        <div className={`h-9 w-9 shrink-0 grid place-items-center ${accentClassMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href}>
      <a className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {content}
      </a>
    </Link>
  );
}
