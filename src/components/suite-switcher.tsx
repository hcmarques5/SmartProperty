"use client";

/**
 * Smart Suite top-level navigation between the four sibling apps:
 *   • SmartInvest    — portfolio tracker
 *   • SmartFinance   — household budget / transactions
 *   • SmartPlanning  — household calendar
 *   • SmartProperty  — PT real-estate ROI calculator
 *
 * URLs default to the production Vercel deployments but can be overridden
 * per-environment via NEXT_PUBLIC_URL_INVEST / _FINANCE / _PLANNING / _PROPERTY.
 *
 * The component is intentionally self-contained (no app-specific contexts)
 * so the same file can be dropped into all four repos verbatim.
 */

import { LineChart, Wallet, CalendarCheck2, Home } from "lucide-react";

export type SuiteAppId = "invest" | "finance" | "planning" | "property";

const DEFAULT_URLS: Record<SuiteAppId, string> = {
  invest: "https://smart-invest-dun.vercel.app",
  finance: "https://smartfinance-pi.vercel.app",
  planning: "https://smart-planning-psi.vercel.app",
  property: "https://smartproperty-wheat.vercel.app",
};

function urlFor(app: SuiteAppId): string {
  // NEXT_PUBLIC_* env vars are inlined at build time and safe to read in the client.
  const env: Record<SuiteAppId, string | undefined> = {
    invest: process.env.NEXT_PUBLIC_URL_INVEST,
    finance: process.env.NEXT_PUBLIC_URL_FINANCE,
    planning: process.env.NEXT_PUBLIC_URL_PLANNING,
    property: process.env.NEXT_PUBLIC_URL_PROPERTY,
  };
  return (env[app] && env[app]!.trim()) || DEFAULT_URLS[app];
}

const APPS: Array<{ id: SuiteAppId; label: string; Icon: typeof Wallet }> = [
  { id: "invest", label: "Invest", Icon: LineChart },
  { id: "finance", label: "Finance", Icon: Wallet },
  { id: "planning", label: "Planning", Icon: CalendarCheck2 },
  { id: "property", label: "Property", Icon: Home },
];

interface Props {
  current: SuiteAppId;
  variant?: "compact" | "full";
}

export function SuiteSwitcher({ current, variant = "compact" }: Props) {
  if (variant === "full") {
    return (
      <div className="flex flex-col gap-1">
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Smart Suite
        </div>
        {APPS.map(({ id, label, Icon }) => {
          const isActive = id === current;
          const className =
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
            (isActive
              ? "bg-primary/15 text-primary cursor-default"
              : "text-muted-foreground hover:bg-accent hover:text-foreground");
          if (isActive) {
            return (
              <span key={id} className={className} aria-current="page">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            );
          }
          return (
            <a key={id} href={urlFor(id)} className={className}>
              <Icon className="h-4 w-4" />
              {label}
            </a>
          );
        })}
      </div>
    );
  }

  // Compact: small icon row used in the mobile header.
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border bg-background/60 p-1"
      role="group"
      aria-label="Smart Suite"
    >
      {APPS.map(({ id, label, Icon }) => {
        const isActive = id === current;
        const className =
          "h-8 w-8 grid place-items-center rounded-md transition-colors " +
          (isActive
            ? "bg-primary text-primary-foreground cursor-default"
            : "text-muted-foreground hover:bg-accent hover:text-foreground");
        if (isActive) {
          return (
            <span
              key={id}
              className={className}
              aria-current="page"
              aria-label={label}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </span>
          );
        }
        return (
          <a
            key={id}
            href={urlFor(id)}
            className={className}
            aria-label={label}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
